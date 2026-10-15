import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

import { CommentForm } from '@/components/CommentForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDate, initials } from '@/lib/utils';
import type { CommentWithAuthor, Profile } from '@/types/database';

interface CommentSectionProps {
  postId: string;
  comments: CommentWithAuthor[];
  profile: Profile | null;
  /** Article path to return to after signing in. */
  returnPath: string;
}

export function CommentSection({ postId, comments, profile, returnPath }: CommentSectionProps) {
  return (
    <section id="comments" className="mt-14 border-t pt-10">
      <h2 className="flex items-center gap-2 text-2xl">
        <MessageSquare className="h-5 w-5 text-gold" />
        Discussion
        <span className="text-base font-normal text-muted-foreground">({comments.length})</span>
      </h2>

      {profile ? (
        <div className="mt-6">
          <CommentForm postId={postId} />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border bg-secondary/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Sign in to join the discussion on this brief.</p>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href={`/login?next=${encodeURIComponent(returnPath)}`}>Sign in</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No comments yet. Be the first to weigh in.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-4">
              <Avatar className="h-9 w-9">
                {comment.profiles?.avatar_url ? <AvatarImage src={comment.profiles.avatar_url} alt="" /> : null}
                <AvatarFallback>{initials(comment.profiles?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{comment.profiles?.full_name ?? 'Reader'}</span>
                  <time className="text-xs text-muted-foreground" dateTime={comment.created_at}>
                    {formatDate(comment.created_at, true)}
                  </time>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
