import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink, Gavel, Pencil, Scale } from 'lucide-react';

import { PostBody } from '@/components/PostBody';
import { ReviewPanel } from '@/components/ReviewPanel';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { canPublish, requireProfile } from '@/lib/auth';
import { CATEGORY_LABELS, DECISION_LABELS } from '@/lib/constants';
import { getReviewsForPost, getSubmissionById } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import type { PostCategory, ReviewDecision } from '@/types/database';

export const metadata: Metadata = {
  title: 'Review submission',
  robots: { index: false, follow: false }
};

interface ReviewSubmissionPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewSubmissionPage({ params }: ReviewSubmissionPageProps) {
  const { id } = await params;
  const profile = await requireProfile(`/dashboard/review/${id}`);

  if (!canPublish(profile.role)) redirect('/dashboard');

  const submission = await getSubmissionById(id);

  if (!submission) notFound();

  const reviews = await getReviewsForPost(id);
  const isCaseBrief = submission.category === 'case_brief';

  const sections = [
    { label: 'Facts', body: submission.facts },
    { label: 'Issues', body: submission.issues },
    { label: 'Holding (ratio decidendi)', body: submission.holding },
    { label: 'Obiter dicta', body: submission.obiter }
  ].filter((section) => Boolean(section.body));

  const meta = [
    { label: 'Author', value: submission.profiles?.full_name ?? 'Unknown author' },
    { label: 'Section', value: CATEGORY_LABELS[submission.category as PostCategory] ?? 'Uncategorised' },
    { label: isCaseBrief ? 'Court' : 'Jurisdiction', value: submission.jurisdiction ?? 'Not recorded' },
    { label: 'Area of law', value: submission.area_of_law ?? 'Not recorded' },
    { label: 'Citation', value: submission.citation ?? 'Not cited' },
    { label: 'Last edited', value: formatDate(submission.updated_at, true) }
  ];

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/review"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to the review queue
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={submission.status} />
          {submission.area_of_law ? <Badge variant="secondary">{submission.area_of_law}</Badge> : null}
        </div>

        <h1 className="font-serif text-3xl leading-tight">{submission.title}</h1>

        {isCaseBrief ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gavel className="h-4 w-4 text-gold-dark" />
            {submission.jurisdiction ?? 'Court not recorded'}
            {submission.citation ? <span className="font-mono">· {submission.citation}</span> : null}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/posts/${submission.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit before publishing
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/cases/${submission.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Preview
            </Link>
          </Button>
          {submission.pdf_url ? (
            <Button asChild size="sm" variant="ghost">
              <a href={submission.pdf_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Judgment PDF
              </a>
            </Button>
          ) : null}
        </div>
      </header>

      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {meta.map((item) => (
            <div key={item.label}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm leading-relaxed">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <ReviewPanel
        postId={submission.id}
        status={submission.status}
        assignedToMe={submission.assigned_editor_id === profile.id}
        reviewerName={submission.editor?.full_name ?? null}
      />

      {submission.excerpt ? (
        <p className="border-l-2 border-gold pl-5 font-serif text-xl leading-relaxed">{submission.excerpt}</p>
      ) : null}

      {sections.length > 0 ? (
        <section className="space-y-6">
          {sections.map((section) => (
            <div key={section.label} className="rounded-lg border bg-card p-6">
              <h2 className="flex items-center gap-2 font-serif text-xl">
                <Scale className="h-4 w-4 text-gold-dark" />
                {section.label}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </section>
      ) : null}

      {submission.content ? (
        <section>
          <h2 className="font-serif text-2xl">Body</h2>
          <div className="mt-4">
            <PostBody content={submission.content} />
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Submission history</h2>

        {reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No decisions recorded yet. Assign the submission or act on it above.
          </p>
        ) : (
          <ol className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {DECISION_LABELS[review.decision as ReviewDecision] ?? review.decision}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(review.created_at, true)}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  by {review.profiles?.full_name ?? 'an editor'}
                </p>
                {review.notes ? (
                  <p className="mt-3 whitespace-pre-line border-l-2 border-gold/50 pl-4 text-sm leading-relaxed text-muted-foreground">
                    {review.notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
