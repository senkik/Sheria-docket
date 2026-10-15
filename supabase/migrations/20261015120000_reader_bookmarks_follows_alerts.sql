-- Sheria Docket: reader bookmarks, followed topics and publish alerts.
--
--   bookmarks     one row per saved brief per reader (the reading list)
--   follows       one row per followed topic per reader (area of law, court,
--                 county, category or case citation)
--   notifications the email alert queue. Rows are written by the trigger below
--                 and are marked sent/failed by the dispatch route.
--
-- A brief published in the app or straight from the dashboard reaches readers
-- through public.queue_brief_alerts(): it matches the new brief against every
-- reader's followed topics and queues one alert per reader per brief.

-- 1. Readers can mute alerts without losing the topics they follow.
alter table public.profiles
  add column if not exists notify_on_publish boolean not null default true;

-- 2. BOOKMARKS
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamp with time zone not null default timezone('utc', now()),
  constraint bookmarks_user_post_key unique (user_id, post_id)
);

create index if not exists bookmarks_user_idx on public.bookmarks (user_id, created_at desc);
create index if not exists bookmarks_post_idx on public.bookmarks (post_id);

-- 3. FOLLOWS
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('area_of_law', 'jurisdiction', 'category', 'case')),
  value text not null check (length(trim(value)) between 1 and 160),
  created_at timestamp with time zone not null default timezone('utc', now()),
  constraint follows_user_topic_key unique (user_id, kind, value)
);

create index if not exists follows_topic_idx on public.follows (kind, lower(value));

-- 4. NOTIFICATIONS (the alert queue and delivery log)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  follow_id uuid references public.follows(id) on delete set null,
  kind text not null default 'new_brief',
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc', now()),
  constraint notifications_user_post_key unique (user_id, post_id)
);

create index if not exists notifications_status_idx on public.notifications (status, created_at);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;

-- Editors and admins see the alert queue so they can send pending or retry
-- failed alerts; readers never see another reader's alerts.
create or replace function public.is_content_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

-- Reading list: private to the reader who owns it, and only for briefs that
-- reader can actually read, so an unpublished brief cannot be saved by id.
drop policy if exists "Readers can view own bookmarks" on public.bookmarks;
create policy "Readers can view own bookmarks" on public.bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists "Readers can save bookmarks" on public.bookmarks;
create policy "Readers can save bookmarks" on public.bookmarks
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.posts p
      where p.id = post_id and (p.status = 'published' or p.author_id = auth.uid())
    )
  );

drop policy if exists "Readers can remove own bookmarks" on public.bookmarks;
create policy "Readers can remove own bookmarks" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- Followed topics: private to the reader who follows them.
drop policy if exists "Readers can view own follows" on public.follows;
create policy "Readers can view own follows" on public.follows
  for select using (auth.uid() = user_id);

drop policy if exists "Readers can follow topics" on public.follows;
create policy "Readers can follow topics" on public.follows
  for insert with check (auth.uid() = user_id);

drop policy if exists "Readers can unfollow topics" on public.follows;
create policy "Readers can unfollow topics" on public.follows
  for delete using (auth.uid() = user_id);

-- Alerts: readers see their own, editors and admins run the queue.
drop policy if exists "Readers can view own alerts" on public.notifications;
create policy "Readers can view own alerts" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "Staff can view the alert queue" on public.notifications;
create policy "Staff can view the alert queue" on public.notifications
  for select using (public.is_content_staff());

drop policy if exists "Staff can mark alerts sent" on public.notifications;
create policy "Staff can mark alerts sent" on public.notifications
  for update using (public.is_content_staff());

drop policy if exists "Admins can clear alerts" on public.notifications;
create policy "Admins can clear alerts" on public.notifications
  for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- 5. Queue an alert for every reader following a topic the brief matches.
-- SECURITY DEFINER because the trigger writes rows for readers other than the
-- person publishing. One alert per reader per brief, so re-publishing after a
-- correction never emails a reader twice.
create or replace function public.queue_brief_alerts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'published' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'published' then
    return new;
  end if;

  insert into public.notifications (user_id, post_id, follow_id)
  select f.user_id, new.id, f.id
  from public.follows f
  join public.profiles p on p.id = f.user_id
  where coalesce(p.notify_on_publish, true)
    and p.email is not null
    and (
      (f.kind = 'area_of_law' and new.area_of_law is not null and lower(f.value) = lower(new.area_of_law))
      or (f.kind = 'jurisdiction' and new.jurisdiction is not null and lower(f.value) = lower(new.jurisdiction))
      or (f.kind = 'category' and new.category is not null and f.value = new.category)
      or (f.kind = 'case' and new.citation is not null and lower(f.value) = lower(new.citation))
    )
  on conflict (user_id, post_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_post_published on public.posts;

create trigger on_post_published
  after insert or update of status on public.posts
  for each row execute function public.queue_brief_alerts();

-- 6. Grants for the API roles used by PostgREST. Alerts are insertable only by
-- the trigger, so no client insert grant is issued here.
grant select, insert, delete on public.bookmarks to authenticated;
grant select, insert, delete on public.follows to authenticated;
grant select, update, delete on public.notifications to authenticated;
