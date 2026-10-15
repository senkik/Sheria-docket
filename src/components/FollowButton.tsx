'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, Loader2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  kind: string;
  value: string;
  label: string;
  following: boolean;
  signedIn: boolean;
  nextPath: string;
  className?: string;
}

export function FollowButton({
  kind,
  value,
  label,
  following,
  signedIn,
  nextPath,
  className
}: FollowButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [active, setActive] = React.useState(following);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setActive(following);
  }, [following]);

  const shared = cn(
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
    active
      ? 'border-gold bg-accent/10 text-gold-dark'
      : 'border-border text-muted-foreground hover:border-gold hover:text-gold-dark',
    className
  );

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(nextPath)}`}
        className={shared}
        title={`Sign in to follow ${label} and get an email when a new brief lands`}
      >
        <Bell className="h-3.5 w-3.5" />
        Follow {label}
      </Link>
    );
  }

  async function toggle() {
    const next = !active;
    setActive(next);
    setPending(true);

    try {
      const response = next
        ? await fetch('/api/follows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind, value })
          })
        : await fetch(
            `/api/follows?kind=${encodeURIComponent(kind)}&value=${encodeURIComponent(value)}`,
            { method: 'DELETE' }
          );

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'That topic could not be updated.');

      toast({
        variant: 'success',
        title: next ? `Following ${label}` : `Unfollowed ${label}`,
        description: next ? 'We will email you when a new brief on this topic is published.' : undefined
      });

      router.refresh();
    } catch (error) {
      setActive(!next);
      toast({
        variant: 'destructive',
        title: 'Not updated',
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
      title={active ? `Unfollow ${label}` : `Follow ${label} and get an email when a brief is published`}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : active ? (
        <BellRing className="h-3.5 w-3.5" />
      ) : (
        <Bell className="h-3.5 w-3.5" />
      )}
      {active ? `Following ${label}` : `Follow ${label}`}
    </button>
  );
}
