import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';

import { BookmarkButton } from '@/components/BookmarkButton';
import { CommentSection } from '@/components/CommentSection';
import { CoverImage } from '@/components/CoverImage';
import { FollowTopics } from '@/components/FollowTopics';
import { PostBody } from '@/components/PostBody';
import { Badge } from '@/components/ui/badge';
import { getCurrentProfile } from '@/lib/auth';
import { CATEGORY_LABELS, DISCLAIMER } from '@/lib/constants';
import { getComments, getFollowKeys, getReaderBookmarks } from '@/lib/queries';
import { formatDate, postHref } from '@/lib/utils';
import type { PostCategory, PostWithAuthor } from '@/types/database';

interface ArticleDetailProps {
  post: PostWithAuthor;
  backHref: string;
  backLabel: string;
}

function readingTime(content: string | null) {
  if (!content) return 1;

  return Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 200));
}

export async function ArticleDetail({ post, backHref, backLabel }: ArticleDetailProps) {
  const [comments, profile, bookmarks, followKeys] = await Promise.all([
    getComments(post.id),
    getCurrentProfile(),
    getReaderBookmarks(),
    getFollowKeys()
  ]);
  const categoryLabel = CATEGORY_LABELS[post.category as PostCategory] ?? 'Article';
  const href = postHref(post);

  return (
    <article className="container max-w-3xl py-12">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy dark:hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <header className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="gold">{categoryLabel}</Badge>
          {post.area_of_law ? <Badge variant="secondary">{post.area_of_law}</Badge> : null}
          {post.jurisdiction ? <span className="text-xs text-muted-foreground">{post.jurisdiction}</span> : null}
        </div>

        <h1 className="text-3xl leading-tight sm:text-4xl">{post.title}</h1>

        {post.excerpt ? <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{post.profiles?.full_name ?? 'Sheria Docket'}</span>
            <span aria-hidden>&middot;</span>
            <time dateTime={post.published_at ?? post.created_at}>
              {formatDate(post.published_at ?? post.created_at)}
            </time>
            <span aria-hidden>&middot;</span>
            <span>{readingTime(post.content)} min read</span>
          </div>

          <BookmarkButton
            postId={post.id}
            saved={bookmarks.ids.has(post.id)}
            signedIn={Boolean(profile)}
            nextPath={href}
            variant="labelled"
          />
        </div>
      </header>

      {post.cover_image_url ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
          <CoverImage src={post.cover_image_url} alt="" sizes="(max-width: 768px) 100vw, 768px" priority />
        </div>
      ) : null}

      <div className="mt-10">
        <PostBody content={post.content} />
      </div>

      <FollowTopics
        post={post}
        followKeys={followKeys}
        signedIn={Boolean(profile)}
        nextPath={href}
      />

      <aside className="mt-8 flex gap-3 rounded-lg border border-gold/40 bg-accent/5 p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
        <p className="text-sm leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
      </aside>

      <CommentSection postId={post.id} comments={comments} profile={profile} returnPath={href} />
    </article>
  );
}
