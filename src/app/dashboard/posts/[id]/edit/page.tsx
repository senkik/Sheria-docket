import { notFound, redirect } from 'next/navigation';

import { PostForm } from '@/components/PostForm';
import { StatusBadge } from '@/components/StatusBadge';
import { canCreateContent, canEditAnyPost, requireProfile } from '@/lib/auth';
import { getPostById, getReviewsForPost } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import type { UserRole } from '@/types/database';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const profile = await requireProfile(`/dashboard/posts/${id}/edit`);

  if (!canCreateContent(profile.role)) redirect('/dashboard');

  const post = await getPostById(id);

  if (!post) notFound();

  const reviews = await getReviewsForPost(post.id);
  const feedback = reviews[0] ?? null;
  const isOwner = post.author_id === profile.id;

  if (!isOwner && !canEditAnyPost(profile.role)) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h1 className="font-serif text-2xl">Not your post</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only the author, an editor or an administrator can edit this post.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl">Edit post</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last updated {formatDate(post.updated_at, true)}</p>
        </div>
        <StatusBadge status={post.status} />
      </header>

      <PostForm role={(profile.role as UserRole) ?? 'author'} post={post} feedback={feedback} />
    </div>
  );
}
