import { NextResponse } from 'next/server';

import { apiError, requireUser } from '@/lib/api';
import { STORAGE_BUCKETS, validateUpload, type StorageBucket } from '@/lib/storage';
import { createClient } from '@/lib/supabase/server';

const BUCKETS = Object.keys(STORAGE_BUCKETS) as StorageBucket[];

function isBucket(value: string): value is StorageBucket {
  return (BUCKETS as string[]).includes(value);
}

/** Keep the original extension, falling back to one derived from the MIME type. */
function extensionFor(file: File) {
  const fromName = /\.[a-z0-9]+$/i.exec(file.name)?.[0];
  if (fromName) return fromName.toLowerCase();

  const fromType = file.type.split('/')[1]?.replace(/^x-/, '');
  return fromType ? `.${fromType}` : '';
}

/**
 * Server-side upload. The browser uploads straight to Storage, but this endpoint
 * accepts the same four buckets for callers that would rather send a multipart
 * body, and runs the bucket's type and size rules before anything is stored.
 */
export async function POST(request: Request) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError('Send the file as multipart/form-data.');
  }

  const file = form.get('file');
  const bucket = form.get('bucket');

  if (!(file instanceof File) || typeof bucket !== 'string') {
    return apiError('A file and a bucket are required.');
  }

  if (!isBucket(bucket)) {
    return apiError('That storage bucket does not exist.');
  }

  const problem = validateUpload(file, bucket);
  if (problem) {
    const tooLarge = file.size > STORAGE_BUCKETS[bucket].maxBytes;
    return apiError(problem, tooLarge ? 413 : 400);
  }

  // Objects are namespaced under the uploader's id so the storage policies can
  // scope every write to its owner.
  const key = `${user.id}/${crypto.randomUUID()}${extensionFor(file)}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage.from(bucket).upload(key, file, {
    cacheControl: '31536000',
    contentType: file.type || undefined,
    upsert: false
  });

  if (uploadError) return apiError('The file could not be uploaded.', 500);

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);

  return NextResponse.json({ success: true, url: data.publicUrl, path: `${bucket}/${key}` });
}
