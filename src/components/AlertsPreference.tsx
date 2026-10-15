'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

interface AlertsPreferenceProps {
  enabled: boolean;
}

export function AlertsPreference({ enabled }: AlertsPreferenceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [active, setActive] = React.useState(enabled);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setActive(enabled);
  }, [enabled]);

  async function toggle(next: boolean) {
    setActive(next);
    setPending(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notify_on_publish: next })
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'Your preference could not be saved.');

      toast({
        variant: 'success',
        title: next ? 'Brief alerts are on' : 'Brief alerts paused',
        description: next
          ? 'We will email you when a brief on a topic you follow is published.'
          : 'You will still see your followed topics and reading list here.'
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
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-[#C8A951]"
        checked={active}
        disabled={pending}
        onChange={(event) => void toggle(event.target.checked)}
      />
      <span className="space-y-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 text-gold-dark" />}
          Email me when a brief I follow is published
        </span>
        <span className="block text-xs leading-relaxed text-muted-foreground">
          One email per brief, sent to the address on your account. Your followed topics stay saved even when alerts are
          paused.
        </span>
      </span>
    </label>
  );
}
