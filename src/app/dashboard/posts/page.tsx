import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ExternalLink, Pencil } from 'lucide-react';

import { DeleteButton } from '@/components/DeleteButton';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { canCreateContent, canEditAnyPost, requireProfile } from '@/lib/auth';
import { CATEGORY_LABELS } from '@/lib/constants';
import { getLatestReviews, getPostsForReview } from '@/lib/queries';
import { formatDate, postHref, truncate } from '@/lib/utils';
import type { PostCategory } from '@/types/database';

export default async function DashboardPostsPage() {
  const profile = await requireProfile('/dashboard/posts');

  if (!canCreateContent(profile.role)) redirect('/dashboard');

  const posts = await getPostsForReview(profile);
  const latestReviews = await getLatestReviews(posts.map((post) => post.id));
  const showAuthor = canEditAnyPost(profile.role);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">{showAuthor ? 'All posts' : 'My posts'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {showAuthor
              ? 'Everything in the pipeline, newest edits first.'
              : 'Drafts and submissions are visible only to you and the editorial desk.'}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">New post</Link>
        </Button>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No posts yet. Start with a case brief.
        </p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => {
                const isOwner = post.author_id === profile.id;
                const canDelete = isOwner || canEditAnyPost(profile.role);
                const feedback = latestReviews.get(post.id);

                return (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-xs">
                      <span className="block font-medium leading-snug">{post.title}</span>
                      <span className="mt-1 block font-mono text-xs text-muted-foreground">{post.slug}</span>
                      {feedback?.decision === 'changes_requested' && feedback.notes ? (
                        <span className="mt-1 block text-xs leading-relaxed text-destructive">
                          Changes requested: {truncate(feedback.notes, 160)}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {CATEGORY_LABELS[post.category as PostCategory] ?? 'Uncategorised'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {post.profiles?.full_name ?? 'You'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDate(post.updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {post.status === 'published' ? (
                          <Button asChild size="sm" variant="ghost">
                            <Link href={postHref(post)} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                              View
                            </Link>
                          </Button>
                        ) : null}
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/dashboard/posts/${post.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        {canDelete ? (
                          <DeleteButton
                            endpoint="/api/posts"
                            id={post.id}
                            confirmMessage={`Delete “${post.title}”? This cannot be undone.`}
                            label=""
                          />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
