import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Gavel, Info, Scale } from 'lucide-react';

import { BookmarkButton } from '@/components/BookmarkButton';
import { CaseBriefCard } from '@/components/CaseBriefCard';
import { CommentSection } from '@/components/CommentSection';
import { CoverImage } from '@/components/CoverImage';
import { FollowTopics } from '@/components/FollowTopics';
import { PostBody } from '@/components/PostBody';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCurrentProfile } from '@/lib/auth';
import { CATEGORY_LABELS, DISCLAIMER } from '@/lib/constants';
import { getComments, getFollowKeys, getPostBySlug, getReaderBookmarks, getRelatedPosts } from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import type { PostCategory } from '@/types/database';

interface CasePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Brief not found' };
  }

  const description = post.excerpt ?? `A case brief on ${post.title}, prepared by Sheria Docket.`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/cases/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/cases/${post.slug}`,
      publishedTime: post.published_at ?? post.created_at,
      authors: post.profiles?.full_name ? [post.profiles.full_name] : undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url, alt: post.title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined
    }
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const profile = await getCurrentProfile();
  const canPreview =
    profile !== null && (profile.id === post.author_id || profile.role === 'admin' || profile.role === 'editor');

  // Row Level Security already hides other people's unpublished work; this keeps
  // drafts and review copies out of the public reading surface.
  if (post.status !== 'published' && !canPreview) notFound();

  const [comments, related, bookmarks, followKeys] = await Promise.all([
    getComments(post.id),
    getRelatedPosts(post, 3),
    getReaderBookmarks(),
    getFollowKeys()
  ]);
  const briefPath = `/cases/${post.slug}`;

  const isCaseBrief = post.category === 'case_brief';
  const categoryLabel = CATEGORY_LABELS[post.category as PostCategory] ?? 'Article';

  const structuredSections = [
    { label: 'Facts', body: post.facts },
    { label: 'Issues', body: post.issues },
    { label: 'Holding (ratio decidendi)', body: post.holding },
    { label: 'Obiter dicta', body: post.obiter }
  ].filter((section) => Boolean(section.body));

  return (
    <div className="container max-w-4xl py-12">
      {post.status !== 'published' ? (
        <p className="mt-6 rounded-md border border-gold/40 bg-accent/10 px-4 py-3 text-sm text-gold-dark">
          This brief is {post.status === 'draft' ? 'still a draft' : 'awaiting review'} and is only visible to you and
          the editorial team.
        </p>
      ) : null}

      <Link
        href={isCaseBrief ? '/cases' : '/'}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy dark:hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {isCaseBrief ? 'All case briefs' : 'Back to home'}
      </Link>

      <header className="mt-6 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="gold">{categoryLabel}</Badge>
          {post.area_of_law ? <Badge variant="secondary">{post.area_of_law}</Badge> : null}
          {post.citation ? <span className="font-mono text-sm text-muted-foreground">{post.citation}</span> : null}
        </div>

        <h1 className="text-3xl leading-tight sm:text-4xl">{post.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {post.jurisdiction ? (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Gavel className="h-3.5 w-3.5 text-gold-dark" />
                {post.jurisdiction}
              </span>
            ) : null}
            <span aria-hidden>&middot;</span>
            <time dateTime={post.published_at ?? post.created_at}>
              {formatDate(post.published_at ?? post.created_at)}
            </time>
            {post.profiles?.full_name ? (
              <>
                <span aria-hidden>&middot;</span>
                <span>Briefed by {post.profiles.full_name}</span>
              </>
            ) : null}
          </div>

          <BookmarkButton
            postId={post.id}
            saved={bookmarks.ids.has(post.id)}
            signedIn={Boolean(profile)}
            nextPath={briefPath}
            variant="labelled"
          />
        </div>
      </header>

      {post.cover_image_url ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
          <CoverImage src={post.cover_image_url} alt="" sizes="(max-width: 1024px) 100vw, 896px" priority />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <dl className="rounded-lg border bg-card p-5">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Citation</dt>
          <dd className="mt-1 font-mono text-sm">{post.citation ?? 'Not cited'}</dd>
        </dl>
        <dl className="rounded-lg border bg-card p-5">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Bench</dt>
          <dd className="mt-1 text-sm leading-relaxed">{post.bench ?? 'Not recorded'}</dd>
        </dl>
      </div>

      {post.excerpt ? (
        <p className="mt-8 border-l-2 border-gold pl-5 font-serif text-xl leading-relaxed text-navy dark:text-foreground">
          {post.excerpt}
        </p>
      ) : null}

      {structuredSections.length > 0 ? (
        <section className="mt-10 space-y-6">
          {structuredSections.map((section) => (
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

      {post.content ? (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Analysis</h2>
          <div className="mt-4">
            <PostBody content={post.content} />
          </div>
        </section>
      ) : null}

      {post.pdf_url ? (
        <div className="mt-10 flex flex-col gap-3 rounded-lg border border-gold/40 bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Full judgment</p>
            <p className="text-sm text-muted-foreground">Download the judgment as delivered by the court.</p>
          </div>
          <Button asChild variant="gold">
            <a href={post.pdf_url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>
      ) : null}

      <FollowTopics post={post} followKeys={followKeys} signedIn={Boolean(profile)} nextPath={briefPath} />

      <aside className="mt-8 flex gap-3 rounded-lg border border-gold/40 bg-accent/5 p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
        <p className="text-sm leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
      </aside>

      <CommentSection postId={post.id} comments={comments} profile={profile} returnPath={briefPath} />

      {related.length > 0 ? (
        <section className="mt-14 border-t pt-10">
          <h2 className="font-serif text-2xl">Related briefs</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <CaseBriefCard
                key={item.id}
                post={item}
                bookmark={{ saved: bookmarks.ids.has(item.id), signedIn: Boolean(profile), nextPath: briefPath }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
