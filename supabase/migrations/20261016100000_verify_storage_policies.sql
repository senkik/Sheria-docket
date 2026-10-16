-- Sheria Docket: verify the storage policies that back every file upload.
--
-- The buckets and their write policies are created by
-- 20261015130000_storage_buckets.sql. Uploads rely on three capabilities:
--
--   1. A signed-in reader may INSERT objects into all four buckets, scoped to
--      the folder named after their user id (the uploader keys objects that way).
--   2. A signed-in reader may DELETE their own objects from all four buckets.
--   3. The four buckets stay public-read, and clients may SELECT the objects.
--
-- This file adds a policy only when an equivalent one is missing, so applying it
-- never duplicates or widens what is already in place. Re-running is safe and it
-- can be pasted straight into the Supabase SQL editor.

do $$
declare
  missing text;
begin
  select string_agg(t.id, ', ')
    into missing
    from (values ('covers'), ('briefs'), ('resources'), ('avatars')) as t(id)
   where not exists (select 1 from storage.buckets b where b.id = t.id);

  if missing is not null then
    raise exception 'Missing storage bucket(s): %. Apply 20261015130000_storage_buckets.sql first.', missing;
  end if;

  if exists (
    select 1 from storage.buckets
     where id in ('covers', 'briefs', 'resources', 'avatars')
       and public is not true
  ) then
    raise exception 'The covers, briefs, resources and avatars buckets must be public-read.';
  end if;

  raise notice 'Storage buckets present and public-read: covers, briefs, resources, avatars.';
end $$;

-- Capability 3: public read of the four public buckets. The signed-in SELECT
-- policy from 20261015130000 already covers authenticated clients, so this only
-- fills the anonymous case.
do $$
begin
  if exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'Sheria media is public'
  ) then
    raise notice 'Public SELECT policy already present.';
  else
    create policy "Sheria media is public" on storage.objects
      for select to public
      using (bucket_id in ('covers', 'briefs', 'resources', 'avatars'));

    raise notice 'Added public SELECT policy for the four buckets.';
  end if;
end $$;

-- Capabilities 1 and 2: signed-in writes, scoped to the uploader's own folder.
do $$
declare
  b text;
  covered boolean;
begin
  foreach b in array array['covers', 'briefs', 'resources', 'avatars'] loop
    select exists (
      select 1 from pg_policies
       where schemaname = 'storage' and tablename = 'objects' and cmd = 'INSERT'
         and position(b in coalesce(with_check, '')) > 0
    ) into covered;

    if covered then
      raise notice 'INSERT policy for % already present.', b;
    else
      execute format(
        'create policy %I on storage.objects for insert to authenticated '
        || 'with check (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)',
        b || ' uploads', b
      );
      raise notice 'Added INSERT policy for %.', b;
    end if;

    select exists (
      select 1 from pg_policies
       where schemaname = 'storage' and tablename = 'objects' and cmd = 'DELETE'
         and position(b in coalesce(qual, '')) > 0
    ) into covered;

    if covered then
      raise notice 'DELETE policy for % already present.', b;
    else
      execute format(
        'create policy %I on storage.objects for delete to authenticated '
        || 'using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)',
        b || ' deletes', b
      );
      raise notice 'Added DELETE policy for %.', b;
    end if;
  end loop;
end $$;
