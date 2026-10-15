import Link from 'next/link';
import { ArrowRight, FileText, GraduationCap, MapPin, Scale } from 'lucide-react';

import { CaseBriefCard } from '@/components/CaseBriefCard';
import { PostCard } from '@/components/PostCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES, CATEGORY_LABELS, DISCLAIMER, SITE } from '@/lib/constants';
import { getFeaturedPost, getPublishedPosts, getReaderBookmarks } from '@/lib/queries';
import { formatDate, postHref } from '@/lib/utils';
import type { PostCategory } from '@/types/database';

const CATEGORY_ICONS = {
  case_brief: Scale,
  student_guide: GraduationCap,
  know_your_law: FileText,
  county_update: MapPin
} as const;

const HIGHLIGHTS = [
  { value: '[2023] eKLR', label: 'Citations follow the eKLR format' },
  { value: '47 counties', label: 'County-level legal developments' },
  { value: 'Issue-to-holding', label: 'Briefs written the way courts reason' }
];

export default async function HomePage() {
  const [featured, latest, bookmarks] = await Promise.all([
    getFeaturedPost(),
    getPublishedPosts({ limit: 7 }),
    getReaderBookmarks()
  ]);

  const latestPosts = latest.filter((post) => post.id !== featured?.id).slice(0, 6);
  const bookmarkFor = (postId: string, nextPath: string) => ({
    saved: bookmarks.ids.has(postId),
    signedIn: bookmarks.signedIn,
    nextPath
  });

  return (
    <div className="flex flex-col">
      <section className="border-b bg-navy text-white">
        <div className="container grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="gold" className="border-gold/40 bg-gold/15 text-gold">
              Kenyan law, explained
            </Badge>
            <h1 className="text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
              Law. Simplified.
              <br />
              <span className="text-gold">Localized.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/75">
              Sheria Docket reads the judgments, statutes and county notices that shape Kenya, then writes them up the
              way they are actually argued — structured, cited and free of jargon.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/cases">
                  Read case briefs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/student-hub">Visit the Student Hub</Link>
              </Button>
            </div>

            <dl className="grid gap-4 pt-6 sm:grid-cols-3">
              {HIGHLIGHTS.map((highlight) => (
                <div key={highlight.value} className="rounded-md border border-white/10 bg-white/5 p-4">
                  <dt className="font-serif text-lg text-gold">{highlight.value}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-white/70">{highlight.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <p className="section-label text-gold">This week</p>
            <h2 className="mt-2 font-serif text-2xl">What the courts decided</h2>
            <ul className="mt-5 space-y-4">
              {latest.slice(0, 4).map((post) => (
                <li key={post.id} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <Link href={postHref(post)} className="group block">
                    <span className="text-xs uppercase tracking-wide text-gold">
                      {CATEGORY_LABELS[post.category as PostCategory] ?? 'Article'}
                    </span>
                    <span className="mt-1 block font-medium leading-snug text-white/90 group-hover:text-gold">
                      {post.title}
                    </span>
                    <span className="mt-1 block text-xs text-white/50">
                      {post.jurisdiction ? `${post.jurisdiction} · ` : ''}
                      {formatDate(post.published_at ?? post.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
              {latest.length === 0 ? <li className="text-sm text-white/60">Briefs are being prepared.</li> : null}
            </ul>
          </div>
        </div>
      </section>

      {featured ? (
        <section className="container py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Featured brief</p>
              <h2 className="mt-2 text-3xl">In depth this week</h2>
            </div>
            <Link href="/cases" className="hidden text-sm font-medium text-navy underline underline-offset-4 sm:block dark:text-foreground">
              All case briefs
            </Link>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-stretch">
            <Card className="overflow-hidden border-navy/10">
              <div className="flex h-full flex-col justify-between gap-6 p-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="gold">{CATEGORY_LABELS[featured.category as PostCategory] ?? 'Article'}</Badge>
                    {featured.citation ? (
                      <span className="font-mono text-xs text-muted-foreground">{featured.citation}</span>
                    ) : null}
                  </div>
                  <h3 className="font-serif text-3xl leading-tight">
                    <Link href={postHref(featured)} className="hover:text-gold-dark">
                      {featured.title}
                    </Link>
                  </h3>
                  {featured.excerpt ? (
                    <p className="text-base leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">Court</dt>
                      <dd className="font-medium">{featured.jurisdiction ?? 'Kenyan court'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">Area of law</dt>
                      <dd className="font-medium">{featured.area_of_law ?? 'General'}</dd>
                    </div>
                  </dl>
                  <Button asChild>
                    <Link href={postHref(featured)}>
                      Read the brief
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid gap-6">
              {latest.slice(0, 2).map((post) => (
                <CaseBriefCard key={post.id} post={post} bookmark={bookmarkFor(post.id, '/')} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Latest</p>
            <h2 className="mt-2 text-3xl">From the docket</h2>
          </div>
          <Link href="/cases" className="text-sm font-medium text-navy underline underline-offset-4 dark:text-foreground">
            Browse everything
          </Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <PostCard key={post.id} post={post} bookmark={bookmarkFor(post.id, '/')} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No published articles yet. The first briefs are on the docket.
          </p>
        )}
      </section>

      <section className="container py-16">
        <p className="section-label">Browse</p>
        <h2 className="mt-2 text-3xl">Find your way in</h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.filter((category) => category.value !== 'opinion').map((category) => {
            const Icon = CATEGORY_ICONS[category.value as keyof typeof CATEGORY_ICONS] ?? Scale;

            return (
              <Card key={category.value} className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy dark:bg-white/10 dark:text-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-serif text-xl">{category.label}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{category.description}</p>
                  <Link
                    href={category.href}
                    className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-gold-dark hover:underline"
                  >
                    Explore
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-t bg-secondary/40">
        <div className="container grid gap-6 py-14 lg:grid-cols-[2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-2xl">Built for Kenyan practice, not for a textbook</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every brief names the bench, the citation and the holding. Every guide tells you which statute to open next.
              {` ${SITE.name} is written for advocates, students and the citizens who need to know their law.`}
            </p>
          </div>
          <p className="legal-rule">{DISCLAIMER}</p>
        </div>
      </section>
    </div>
  );
}
