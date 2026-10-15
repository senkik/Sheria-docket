-- Sheria Docket: Supabase Storage buckets for real file uploads.
--
-- Media used to be pasted in as URLs. These four buckets let the editorial team
-- upload cover images and judgment PDFs, admins upload Student Hub resources,
-- and any signed-in reader upload an avatar.
--
-- Every bucket is public-read, because the files are referenced from public
-- pages (and optimised by next/image). Writes are restricted to the uploader's
-- own folder, so the object key is always <auth.uid()>/<timestamp>-<file>.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'covers', 'covers', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
  ),
  (
    'briefs', 'briefs', true, 26214400,
    array['application/pdf']
  ),
  (
    'resources', 'resources', true, 26214400,
    array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  ),
  (
    'avatars', 'avatars', true, 2097152,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
  )
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Authors, editors and admins may upload brief media. Mirrors the post roles.
create or replace function public.is_content_author()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('author', 'editor', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Anyone signed in can read files in these buckets (the public endpoint serves
-- them without a session; this lets a signed-in client list and overwrite its
-- own uploads).
drop policy if exists "Sheria media is readable by signed in users" on storage.objects;
create policy "Sheria media is readable by signed in users" on storage.objects
  for select to authenticated
  using (bucket_id in ('covers', 'briefs', 'resources', 'avatars'));

-- Cover images and judgment PDFs: editorial roles, own folder.
drop policy if exists "Editorial team can upload brief media" on storage.objects;
create policy "Editorial team can upload brief media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('covers', 'briefs')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_content_author()
  );

drop policy if exists "Editorial team can overwrite brief media" on storage.objects;
create policy "Editorial team can overwrite brief media" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('covers', 'briefs')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_content_author()
  )
  with check (
    bucket_id in ('covers', 'briefs')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_content_author()
  );

drop policy if exists "Editorial team can replace brief media" on storage.objects;
create policy "Editorial team can replace brief media" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('covers', 'briefs')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_content_author()
  );

-- Student Hub resources: admins only, own folder.
drop policy if exists "Admins can upload resources" on storage.objects;
create policy "Admins can upload resources" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'resources'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_admin()
  );

drop policy if exists "Admins can overwrite resources" on storage.objects;
create policy "Admins can overwrite resources" on storage.objects
  for update to authenticated
  using (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin())
  with check (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());

drop policy if exists "Admins can replace resources" on storage.objects;
create policy "Admins can replace resources" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text and public.is_admin());

-- Avatars: any signed-in reader, own folder.
drop policy if exists "Readers can upload own avatar" on storage.objects;
create policy "Readers can upload own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Readers can overwrite own avatar" on storage.objects;
create policy "Readers can overwrite own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Readers can replace own avatar" on storage.objects;
create policy "Readers can replace own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
