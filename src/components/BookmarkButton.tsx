'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  postId: string;
  saved: boolean;
  signedIn: boolean;
  /** Where to send the reader back to after signing in. */
  nextPath: string;
  variant?: 'icon' | 'labelled';
  className?: string;
}

export function BookmarkButton({
  postId,
  saved,
  signedIn,
  nextPath,
  variant = 'icon',
  className
}: BookmarkButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [active, setActive] = React.useState(saved);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setActive(saved);
  }, [saved]);

  const labelled = variant === 'labelled';

  const shared = cn(
    'inline-flex items-center gap-2 rounded-md border text-sm font-medium transition-colors',
    labelled ? 'px-3 py-2' : 'h-8 w-8 justify-center',
    active ? 'border-gold bg-accent/10 text-gold-dark' : 'border-border text-muted-foreground hover:border-gold hover:text-gold-dark',
    className
  );

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(nextPath)}`}
        className={shared}
        title="Sign in to save this brief to your reading list"
        aria-label="Sign in to save this brief"
      >
        <Bookmark className="h-4 w-4" />
        {labelled ? 'Save' : null}
      </Link>
    );
  }

  async function toggle() {
    const next = !active;
    setActive(next);
    setPending(true);

    try {
      const response = next
        ? await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId })
          })
        : await fetch(`/api/bookmarks?post_id=${encodeURIComponent(postId)}`, { method: 'DELETE' });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'Your reading list could not be updated.');

      toast({
        variant: 'success',
        title: next ? 'Saved to your reading list' : 'Removed from your reading list',
        description: next ? 'Find it under Reading list in your account menu.' : undefined
      });

      router.refresh();
    } catch (error) {
      setActive(!next);
      toast({
        variant: 'destructive',
        title: 'Not saved',
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={pending}
      className={shared}
      aria-pressed={active}
      title={active ? 'Remove from your reading list' : 'Save to your reading list'}
      aria-label={active ? 'Remove from your reading list' : 'Save to your reading list'}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : active ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {labelled ? (active ? 'Saved' : 'Save') : null}
    </button>
  );
}
