import Link from 'next/link';

import { BookmarkButton } from '@/components/BookmarkButton';
import { CoverImage } from '@/components/CoverImage';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS } from '@/lib/constants';
import { cn, formatDate, postHref } from '@/lib/utils';
import type { PostCategory, PostWithAuthor } from '@/types/database';

interface PostCardProps {
  post: PostWithAuthor;
  className?: string;
  showImage?: boolean;
  /** Supplied by list pages for signed-in readers; omit to hide the save control. */
  bookmark?: { saved: boolean; signedIn: boolean; nextPath: string };
}

export function PostCard({ post, className, showImage = true, bookmark }: PostCardProps) {
  const categoryLabel = CATEGORY_LABELS[post.category as PostCategory] ?? 'Article';

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      {showImage && post.cover_image_url ? (
        <Link href={postHref(post)} className="relative block aspect-[16/9] overflow-hidden bg-muted">
          <CoverImage
            src={post.cover_image_url}
            alt=""
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="gold">{categoryLabel}</Badge>
            {post.jurisdiction ? <span className="text-xs text-muted-foreground">{post.jurisdiction}</span> : null}
          </div>
          {bookmark ? (
            <BookmarkButton
              postId={post.id}
              saved={bookmark.saved}
              signedIn={bookmark.signedIn}
              nextPath={bookmark.nextPath}
            />
          ) : null}
        </div>

        <h3 className="font-serif text-xl leading-snug">
          <Link href={postHref(post)} className="transition-colors hover:text-gold-dark">
            {post.title}
          </Link>
        </h3>

        {post.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-xs text-muted-foreground">
          <span>{post.profiles?.full_name ?? 'Sheria Docket'}</span>
          <span aria-hidden>&middot;</span>
          <time dateTime={post.published_at ?? post.created_at}>{formatDate(post.published_at ?? post.created_at)}</time>
          {post.citation ? (
            <>
              <span aria-hidden>&middot;</span>
              <span className="font-medium text-navy dark:text-foreground">{post.citation}</span>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
