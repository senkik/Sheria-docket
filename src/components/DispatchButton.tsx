'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DispatchButtonProps {
  postId?: string;
  label?: string;
}

interface DispatchSummary {
  queued: number;
  sent: number;
  failed: number;
  skipped: number;
  message?: string;
}

export function DispatchButton({ postId, label = 'Send waiting alerts' }: DispatchButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);

  async function send() {
    setPending(true);

    try {
      const response = await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postId ? { post_id: postId } : {})
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string; summary?: DispatchSummary };

      if (!response.ok || !payload.summary) {
        throw new Error(payload.message ?? 'The alert queue could not be sent.');
      }

      const { summary } = payload;
      const detail = [
        `${summary.sent} sent`,
        summary.failed > 0 ? `${summary.failed} failed` : null,
        summary.skipped > 0 ? `${summary.skipped} skipped` : null
      ]
        .filter(Boolean)
        .join(' · ');

      toast({
        variant: summary.failed > 0 ? 'destructive' : 'success',
        title: summary.queued === 0 ? 'Nothing waiting' : `${summary.queued} alert${summary.queued === 1 ? '' : 's'}`,
        description: summary.queued === 0 ? 'Every queued alert has already been handled.' : `${detail}. ${summary.message ?? ''}`.trim()
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Not sent',
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void send()} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {label}
    </Button>
  );
}
