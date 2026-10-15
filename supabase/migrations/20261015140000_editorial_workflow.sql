-- Sheria Docket: editorial workflow.
--
-- A submission now has a life cycle the editorial desk can act on:
--
--   draft ──submit──► pending_review ──┬── publish ─────► published
--                                      ├── request changes ─► changes_requested ──resubmit──► pending_review
--                                      └── return to draft ─► draft
--
--   posts.assigned_editor_id  who owns the review
--   post_reviews              append-only trail of every editorial decision
--   notifications             now carries both reader brief alerts and the
--                             author notices sent when a decision is made

-- 1. A new status for revisions the editor has sent back.
alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts
  add constraint posts_status_check check (status in ('draft', 'pending_review', 'changes_requested', 'published'));

alter table public.posts
  add column if not exists assigned_editor_id uuid references public.profiles(id) on delete set null;

create index if not exists posts_assigned_editor_idx on public.posts (assigned_editor_id);
create index if not exists posts_status_updated_idx on public.posts (status, updated_at);

-- 2. POST REVIEWS: every assign, request, publish and return, with its notes.
create table if not exists public.post_reviews (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  editor_id uuid references public.profiles(id) on delete set null,
  decision text not null check (decision in ('assigned', 'changes_requested', 'published', 'returned')),
  notes text,
  created_at timestamp with time zone not null default timezone('utc', now())
);

create index if not exists post_reviews_post_idx on public.post_reviews (post_id, created_at desc);

alter table public.post_reviews enable row level security;

-- The author reads the feedback on their own submission; the desk reads all.
drop policy if exists "Author or staff can read reviews" on public.post_reviews;
create policy "Author or staff can read reviews" on public.post_reviews
  for select using (
    public.is_content_staff()
    or exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  );

drop policy if exists "Staff record reviews" on public.post_reviews;
create policy "Staff record reviews" on public.post_reviews
  for insert with check (public.is_content_staff() and editor_id = auth.uid());

drop policy if exists "Admins clear reviews" on public.post_reviews;
create policy "Admins clear reviews" on public.post_reviews
  for delete using (public.is_admin());

grant select, insert, delete on public.post_reviews to authenticated;

-- 3. NOTIFICATIONS become the outbound queue for both audiences. A reader alert
--    is one per brief per reader; an editorial notice is one per decision, so
--    the uniqueness rule is now (reader, brief, kind, dedupe key).
alter table public.notifications drop constraint if exists notifications_user_post_key;
alter table public.notifications add column if not exists dedupe_key text not null default 'brief';
alter table public.notifications add column if not exists payload jsonb;

alter table public.notifications drop constraint if exists notifications_dedupe_key;
alter table public.notifications
  add constraint notifications_dedupe_key unique (user_id, post_id, kind, dedupe_key);

-- Staff queue the author notices from the review screen.
drop policy if exists "Staff can queue review notices" on public.notifications;
create policy "Staff can queue review notices" on public.notifications
  for insert with check (public.is_content_staff() and kind = 'review_decision');

-- 4. The brief alert trigger writes an explicit kind and dedupe key, and no
--    longer emails an author about their own brief.
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

  insert into public.notifications (user_id, post_id, follow_id, kind, dedupe_key)
  select f.user_id, new.id, f.id, 'new_brief', 'brief'
  from public.follows f
  join public.profiles p on p.id = f.user_id
  where coalesce(p.notify_on_publish, true)
    and p.email is not null
    and f.user_id is distinct from new.author_id
    and (
      (f.kind = 'area_of_law' and new.area_of_law is not null and lower(f.value) = lower(new.area_of_law))
      or (f.kind = 'jurisdiction' and new.jurisdiction is not null and lower(f.value) = lower(new.jurisdiction))
      or (f.kind = 'category' and new.category is not null and f.value = new.category)
      or (f.kind = 'case' and new.citation is not null and lower(f.value) = lower(new.citation))
    )
  on conflict (user_id, post_id, kind, dedupe_key) do nothing;

  return new;
end;
$$;

