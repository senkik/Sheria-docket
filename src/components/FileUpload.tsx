'use client';

import * as React from 'react';
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { STORAGE_BUCKETS, formatBytes, storageObjectKey, validateUpload, type StorageBucket } from '@/lib/storage';

interface FileUploadProps {
  bucket: StorageBucket;
  id: string;
  value: string;
  onChange: (url: string) => void;
  /** Overrides the bucket's own name, e.g. "Cover image (optional)". */
  label?: string;
  /** Keep the paste-a-link field for anyone with a file hosted elsewhere. */
  allowUrl?: boolean;
  urlPlaceholder?: string;
  hint?: string;
}

/** A readable name for an uploaded file, whether it came from storage or a link. */
function displayName(url: string) {
  if (!url) return '';

  const last = url.split('?')[0].split('/').filter(Boolean).pop() ?? url;

  try {
    return decodeURIComponent(last).replace(/^\d+-/, '');
  } catch {
    return last;
  }
}

export function FileUpload({
  bucket,
  id,
  value,
  onChange,
  label,
  allowUrl = true,
  urlPlaceholder = 'https://…',
  hint
}: FileUploadProps) {
  const { toast } = useToast();
  const config = STORAGE_BUCKETS[bucket];
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(file: File) {
    const problem = validateUpload(file, bucket);

    if (problem) {
      setError(problem);
      toast({ variant: 'destructive', title: 'That file cannot be uploaded', description: problem });
      return;
    }

    setError(null);
    setPending(true);

    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Sign in again before uploading a file.');

      const key = storageObjectKey(user.id, file.name);
      const { error: uploadError } = await supabase.storage.from(bucket).upload(key, file, {
        cacheControl: '31536000',
        contentType: file.type || undefined,
        upsert: true
      });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from(bucket).getPublicUrl(key);
      onChange(data.publicUrl);

      toast({
        variant: 'success',
        title: `${config.label} uploaded`,
        description: `${formatBytes(file.size)} stored. Save the form to use it.`
      });
    } catch (uploadFailure) {
      const message = uploadFailure instanceof Error ? uploadFailure.message : 'The upload failed.';
      setError(message);
      toast({ variant: 'destructive', title: 'Upload failed', description: message });
    } finally {
      setPending(false);

      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label ?? config.label}</Label>

      {value ? (
        <div className="flex items-center gap-3 rounded-md border bg-secondary/30 p-3">
          {config.isImage ? (
            // Plain <img>: the field also accepts links from anywhere, and only
            // this project's storage host is configured for next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-navy/5 text-navy dark:bg-white/10 dark:text-foreground">
              <FileText className="h-5 w-5" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName(value)}</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-gold-dark"
            >
              Open file
            </a>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            aria-label={`Remove ${config.label.toLowerCase()}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-1 rounded-md border border-dashed px-4 py-5 text-sm transition-colors hover:border-gold hover:text-gold-dark disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="font-medium">{pending ? 'Uploading…' : `Choose a file to upload`}</span>
          <span className="text-xs text-muted-foreground">{config.description}</span>
        </button>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={config.accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) void handleFile(file);
        }}
      />

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {allowUrl ? (
        <div className="space-y-1 pt-1">
          <Input
            id={`${id}-url`}
            value={value}
            onChange={(event) => {
              setError(null);
              onChange(event.target.value);
            }}
            placeholder={urlPlaceholder}
            aria-label={`${config.label} link`}
          />
          <p className="text-xs text-muted-foreground">Upload a file above, or paste a link to one hosted elsewhere.</p>
        </div>
      ) : null}

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
