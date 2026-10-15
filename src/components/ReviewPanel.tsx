'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Send, Undo2, UserCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ReviewPanelProps {
  postId: string;
  status: string;
  assignedToMe: boolean;
  reviewerName: string | null;
}

interface DispatchSummary {
  queued: number;
  sent: number;
  failed: number;
  skipped: number;
  message?: string;
}

export function ReviewPanel({ postId, status, assignedToMe, reviewerName }: ReviewPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [notes, setNotes] = React.useState('');
  const [asking, setAsking] = React.useState(false);
  const [pending, setPending] = React.useState<string | null>(null);

  async function act(decision: 'assigned' | 'changes_requested' | 'published' | 'returned') {
    if (decision === 'changes_requested' && notes.trim().length < 5) {
      setAsking(true);
      toast({
        variant: 'destructive',
        title: 'Notes are required',
        description: 'Say what needs changing so the author can act on it.'
      });
      return;
    }

    setPending(decision);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, decision, notes: notes.trim() || undefined })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        alerts?: DispatchSummary | null;
      };

      if (!response.ok) throw new Error(payload.message ?? 'The decision could not be saved.');

      const alerts = payload.alerts;

      const description =
        decision === 'published'
          ? alerts
            ? `${alerts.sent} email${alerts.sent === 1 ? '' : 's'} sent${alerts.failed > 0 ? `, ${alerts.failed} failed` : ''}.`
            : 'The brief is live on the site.'
          : decision === 'changes_requested'
            ? 'The author has been emailed your notes.'
            : decision === 'returned'
              ? 'The submission is back in draft and the author has been told.'
              : 'You are recorded as the reviewer.';

      toast({
        variant: alerts && alerts.failed > 0 ? 'destructive' : 'success',
        title:
          decision === 'published'
            ? 'Published'
            : decision === 'changes_requested'
              ? 'Changes requested'
              : decision === 'returned'
                ? 'Returned to draft'
                : 'Assigned',
        description: `${description} ${alerts?.message ?? ''}`.trim()
      });

      setNotes('');
      setAsking(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Not saved',
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setPending(null);
    }
  }

  const publish = (
    <Button type="button" variant="gold" disabled={pending !== null} onClick={() => void act('published')}>
      {pending === 'published' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      Publish brief
    </Button>
  );

  const requestChanges = (
    <Button type="button" variant="outline" disabled={pending !== null} onClick={() => void act('changes_requested')}>
      {pending === 'changes_requested' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      Request changes
    </Button>
  );

  const returnToDraft = (
    <Button type="button" variant="ghost" disabled={pending !== null} onClick={() => void act('returned')}>
      {pending === 'returned' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
      Send back to draft
    </Button>
  );

  const claim = (
    <Button type="button" variant="outline" disabled={pending !== null} onClick={() => void act('assigned')}>
      {pending === 'assigned' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
      {reviewerName ? 'Take over this review' : 'Assign to me'}
    </Button>
  );

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div>
          <h2 className="font-serif text-xl">Editorial decision</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {reviewerName
              ? assignedToMe
                ? 'You are the reviewer on this submission.'
                : `Currently with ${reviewerName}.`
              : 'Nobody has picked this submission up yet.'}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="review-notes" className="text-sm font-medium">
            Notes for the author
          </label>
          <Textarea
            id="review-notes"
            rows={asking ? 6 : 3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anchor the ratio to the judgment, add the citation to the Court of Appeal decision, tighten the facts to two paragraphs."
          />
          <p className="text-xs text-muted-foreground">
            Required when you request changes. Sent to the author by email and kept on the submission history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {publish}
          {requestChanges}
          {assignedToMe ? null : claim}
          {status === 'pending_review' ? returnToDraft : null}
        </div>
      </CardContent>
    </Card>
  );
}
