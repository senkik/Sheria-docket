'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (content.trim().length < 3) {
      toast({ variant: 'destructive', title: 'Comment too short', description: 'Add at least a few words.' });
      return;
    }

    setPending(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, content: content.trim() })
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(payload.message ?? 'Could not post your comment.');

      setContent('');
      toast({ variant: 'success', title: 'Comment posted', description: 'Thanks for adding to the discussion.' });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Comment not saved',
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="sr-only" htmlFor="comment-content">
        Your comment
      </label>
      <Textarea
        id="comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Share an analysis, a correction or a case the author should consider."
        rows={4}
      />
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Comments are moderated. Do not post confidential client information.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Post comment
        </Button>
      </div>
    </form>
  );
}
