import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock } from 'lucide-react';

import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { canPublish, requireProfile } from '@/lib/auth';
import { CATEGORY_LABELS } from '@/lib/constants';
import { getReviewQueue } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import type { PostCategory } from '@/types/database';

export const metadata: Metadata = {
  title: 'Review queue',
  robots: { index: false, follow: false }
};

/** Whole days since the author last touched the submission. */
function waitingDays(value: string) {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);

  return days <= 0 ? 'today' : `${days} day${days === 1 ? '' : 's'}`;
}

export default async function ReviewQueuePage() {
  const profile = await requireProfile('/dashboard/review');

  if (!canPublish(profile.role)) redirect('/dashboard');

  const submissions = await getReviewQueue();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Review queue</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Every brief waiting on the desk, oldest submission first. Assign one to yourself, read it, then publish it or
            send it back with notes.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/posts">All posts</Link>
        </Button>
      </header>

      {submissions.length === 0 ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          Nothing is waiting for review. Submissions land here the moment an author sends one in.
        </p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submission</TableHead>
                <TableHead className="hidden lg:table-cell">Section</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead className="hidden sm:table-cell">Waiting</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="max-w-sm">
                    <span className="block font-medium leading-snug">{submission.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Updated {formatDate(submission.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {CATEGORY_LABELS[submission.category as PostCategory] ?? 'Uncategorised'}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {submission.profiles?.full_name ?? 'Unknown author'}
                  </TableCell>
                  <TableCell>
                    {submission.editor?.full_name ? (
                      <span className="text-sm">
                        {submission.editor.id === profile.id ? 'You' : submission.editor.full_name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {waitingDays(submission.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/review/${submission.id}`}>Review</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <section className="rounded-lg border bg-card p-6">
        <h2 className="font-serif text-xl">What each decision does</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-2">
              <StatusBadge status="published" />
            </dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">
              Publishes the brief immediately and emails every reader following one of its topics.
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2">
              <StatusBadge status="changes_requested" />
            </dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">
              Sends your notes to the author, who can revise and submit again. Nothing is published.
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2">
              <StatusBadge status="pending_review" />
            </dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">
              Waiting on the desk. Assign it to yourself so the queue shows who is reading it.
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2">
              <StatusBadge status="draft" />
            </dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">
              Back to the author as a draft, for submissions sent in by mistake or no longer wanted.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
