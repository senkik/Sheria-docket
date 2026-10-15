-- Sheria Docket: initial schema
-- Tables, Row Level Security policies and the profile provisioning trigger.

-- 1. PROFILES (extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  role text default 'reader' check (role in ('admin', 'author', 'editor', 'reader')),
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- 2. POSTS (case briefs, student guides, county updates, know your law, opinions)
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  content text,
  excerpt text,
  category text check (category in ('case_brief', 'student_guide', 'county_update', 'know_your_law', 'opinion')),
  jurisdiction text,
  area_of_law text,
  status text default 'draft' check (status in ('draft', 'pending_review', 'published')),
  cover_image_url text,
  citation text,
  bench text,
  facts text,
  issues text,
  holding text,
  obiter text,
  pdf_url text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

create index if not exists posts_status_published_at_idx on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category);
create index if not exists posts_author_idx on public.posts (author_id);

-- 3. COMMENTS
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create index if not exists comments_post_idx on public.comments (post_id, created_at);

-- 4. RESOURCES (Student Hub downloads)
create table if not exists public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  file_url text not null,
  uploaded_by uuid references public.profiles(id),
  category text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- 5. SUBSCRIBERS (newsletter)
create table if not exists public.subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  subscribed_at timestamp with time zone default timezone('utc', now())
);

-- 6. INTERNSHIPS (Student Hub board)
create table if not exists public.internships (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  firm_name text not null,
  location text,
  description text,
  application_link text,
  deadline date,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.resources enable row level security;
alter table public.subscribers enable row level security;
alter table public.internships enable row level security;

-- Profiles: public read, self update
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Posts: public read of published work, authors manage their own drafts
create policy "Published posts are viewable by everyone" on public.posts for select using (status = 'published');

create policy "Authors can insert posts" on public.posts for insert with check (
  auth.uid() = author_id
  and (select role from public.profiles where id = auth.uid()) in ('author', 'admin', 'editor')
);

create policy "Authors can update own posts" on public.posts for update using (auth.uid() = author_id);

create policy "Admins can do anything with posts" on public.posts for all using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Without these two policies an author could never see their own draft in the
-- dashboard, and an editor could neither read the review queue nor publish a
-- submission they did not write.
create policy "Authors can view own posts" on public.posts for select using (auth.uid() = author_id);

create policy "Editors can review submissions" on public.posts for select using (
  (select role from public.profiles where id = auth.uid()) = 'editor'
);

create policy "Editors can publish submissions" on public.posts for update using (
  (select role from public.profiles where id = auth.uid()) = 'editor'
);

-- Comments: public read, authenticated insert
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Logged in users can comment" on public.comments for insert with check (auth.uid() = user_id);

-- Resources: authenticated read, admin manage
create policy "Resources viewable by authenticated users" on public.resources for select using (auth.role() = 'authenticated');
create policy "Admins can manage resources" on public.resources for all using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Subscribers: public insert, admin read
create policy "Anyone can subscribe" on public.subscribers for insert with check (true);
create policy "Only admins can view subscribers" on public.subscribers for select using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Internships: public read, admin manage
create policy "Internships viewable by everyone" on public.internships for select using (true);
create policy "Admins can manage internships" on public.internships for all using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Profiles are created by this trigger the moment a user signs up, so the app
-- never has to insert a row from the client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'reader@sheriadocket.co.ke'), '@', 1)
    ),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Explicit grants for the API roles used by PostgREST.
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.posts, public.comments, public.internships to anon, authenticated;
grant select on public.resources to authenticated;
grant insert on public.comments, public.subscribers to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.resources, public.internships to authenticated;
grant select on public.subscribers to authenticated;
