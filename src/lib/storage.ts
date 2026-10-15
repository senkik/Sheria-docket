/**
 * Supabase Storage buckets, one per kind of media the site publishes.
 *
 * Uploads happen in the browser against these buckets; the storage policies in
 * `supabase/migrations/20261015130000_storage_buckets.sql` scope every write to
 * the uploader's own folder, and the bucket itself caps size and file type, so
 * this configuration mirrors what the database already enforces. Checking here
 * as well means a rejected file never leaves the browser.
 */

export interface BucketConfig {
  /** Human name used in labels and error messages. */
  label: string;
  description: string;
  /** Value for the file input's accept attribute. */
  accept: string;
  maxBytes: number;
  isImage: boolean;
}

export const STORAGE_BUCKETS = {
  covers: {
    label: 'Cover image',
    description: 'JPG, PNG, WebP, AVIF or GIF, up to 5 MB.',
    accept: 'image/jpeg,image/png,image/webp,image/avif,image/gif',
    maxBytes: 5 * 1024 * 1024,
    isImage: true
  },
  briefs: {
    label: 'Judgment PDF',
    description: 'The judgment as a PDF, up to 25 MB.',
    accept: 'application/pdf',
    maxBytes: 25 * 1024 * 1024,
    isImage: false
  },
  resources: {
    label: 'Resource file',
    description: 'PDF, Word, plain text, JPG, PNG or WebP, up to 25 MB.',
    accept:
      'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png,image/webp',
    maxBytes: 25 * 1024 * 1024,
    isImage: false
  },
  avatars: {
    label: 'Avatar',
    description: 'JPG, PNG, WebP, AVIF or GIF, up to 2 MB.',
    accept: 'image/jpeg,image/png,image/webp,image/avif,image/gif',
    maxBytes: 2 * 1024 * 1024,
    isImage: true
  }
} satisfies Record<string, BucketConfig>;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

/** Returns a reader-facing reason to refuse the file, or null when it is fine. */
export function validateUpload(file: File, bucket: StorageBucket): string | null {
  const config = STORAGE_BUCKETS[bucket];
  const accepted = config.accept.split(',');

  if (file.type && !accepted.includes(file.type)) {
    return `${file.name} is a ${file.type} file. ${config.label}s accept: ${config.description}`;
  }

  if (file.size > config.maxBytes) {
    return `${file.name} is ${formatBytes(file.size)}. The limit for a ${config.label.toLowerCase()} is ${formatBytes(config.maxBytes)}.`;
  }

  if (file.size === 0) return `${file.name} is empty.`;

  return null;
}

/** Object keys are namespaced per user so storage policies can scope writes. */
export function storageObjectKey(userId: string, fileName: string) {
  const cleaned = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-80);

  return `${userId}/${Date.now()}-${cleaned || 'upload'}`;
}

/** True for a file served from this project's public storage endpoint. */
export function isStorageUrl(url: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!base || !url) return false;

  return url.startsWith(`${base.replace(/\/$/, '')}/storage/v1/object/public/`);
}
