import Link from 'next/link';
import { FileEdit, FileText, MessageSquare, Users } from 'lucide-react';

import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { canCreateContent, canPublish, requireProfile } from '@/lib/auth';
import { CATEGORY_LABELS } from '@/lib/constants';
import { getDashboardStats, getPostsForReview } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import type { PostCategory } from '@/types/database';

export default async function DashboardPage() {
  const profile = await requireProfile('/dashboard');
  const [stats, posts] = await Promise.all([getDashboardStats(profile), getPostsForReview(profile)]);

  const metrics = [
    { label: 'Posts', value: stats.posts, icon: FileText, hint: `${stats.published} published` },
    {
      label: 'In review',
      value: stats.pending,
      icon: FileEdit,
      hint: `${stats.drafts} drafts · ${stats.changesRequested} with the author`
    },
    { label: 'Comments', value: stats.comments, icon: MessageSquare, hint: 'Across all articles' },
    {
      label: profile.role === 'admin' ? 'Subscribers' : 'Readers',
      value: profile.role === 'admin' ? stats.subscribers : stats.readers,
      icon: Users,
      hint: profile.role === 'admin' ? `${stats.readers} accounts` : 'Registered accounts'
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.role === 'admin'
              ? 'Full editorial control: every post, resource and reader account.'
              : profile.role === 'editor'
                ? 'Review the queue, publish submissions and keep the archive accurate.'
                : profile.role === 'author'
                  ? 'Draft your briefs and send them to the editorial desk for review.'
                  : 'Your Sheria Docket account at a glance.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {canPublish(profile.role) && stats.pending > 0 ? (
            <Button asChild variant="gold">
              <Link href="/dashboard/review">
                {stats.pending} awaiting review
              </Link>
            </Button>
          ) : null}
          {canCreateContent(profile.role) ? (
            <Button asChild>
              <Link href="/dashboard/posts/new">Write a post</Link>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="space-y-2 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy/5 text-navy dark:bg-white/10 dark:text-foreground">
                <metric.icon className="h-4 w-4" />
              </span>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="font-serif text-3xl">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {canCreateContent(profile.role) ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl">Recent work</h2>
            <Link href="/dashboard/posts" className="text-sm font-medium underline underline-offset-4">
              Manage all posts
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              Nothing written yet. Start with a case brief on the last judgment you read.
            </p>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.slice(0, 5).map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-xs">
                        <Link href={`/dashboard/posts/${post.id}/edit`} className="font-medium hover:text-gold-dark">
                          {post.title}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {CATEGORY_LABELS[post.category as PostCategory] ?? 'Uncategorised'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={post.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(post.updated_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-serif text-xl">Write for Sheria Docket</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Readers can comment on published briefs and download Student Hub resources. If you would like to contribute
            case briefs or guides, ask the editorial desk for an author role and we will set your account up.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/reading-list">Open your reading list</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/student-hub/resources">Browse the resource centre</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
