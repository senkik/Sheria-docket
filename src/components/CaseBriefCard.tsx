import Link from 'next/link';
import { FileText, Gavel } from 'lucide-react';

import { BookmarkButton } from '@/components/BookmarkButton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { PostWithAuthor } from '@/types/database';

interface CaseBriefCardProps {
  post: PostWithAuthor;
  /** Supplied by list pages for signed-in readers; omit to hide the save control. */
  bookmark?: { saved: boolean; signedIn: boolean; nextPath: string };
}

export function CaseBriefCard({ post, bookmark }: CaseBriefCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gold-dark">
            <Gavel className="h-3.5 w-3.5" />
            {post.jurisdiction ?? 'Kenyan court'}
          </p>
          {post.citation ? <p className="font-mono text-sm text-foreground">{post.citation}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {bookmark ? (
            <BookmarkButton
              postId={post.id}
              saved={bookmark.saved}
              signedIn={bookmark.signedIn}
              nextPath={bookmark.nextPath}
            />
          ) : null}
          {post.pdf_url ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              PDF
            </span>
          ) : null}
        </div>
      </div>

      <h3 className="mt-4 font-serif text-xl leading-snug">
        <Link href={`/cases/${post.slug}`} className="transition-colors hover:text-gold-dark">
          {post.title}
        </Link>
      </h3>

      {post.holding ? (
        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{post.holding}</p>
      ) : post.excerpt ? (
        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        {post.area_of_law ? <Badge variant="secondary">{post.area_of_law}</Badge> : null}
        <span className="text-xs text-muted-foreground">
          {formatDate(post.published_at ?? post.created_at)}
        </span>
      </div>
    </article>
  );
}
