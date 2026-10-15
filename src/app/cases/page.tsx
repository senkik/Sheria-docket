import type { Metadata } from 'next';

import { CaseBriefCard } from '@/components/CaseBriefCard';
import { PostCard } from '@/components/PostCard';
import { SearchBar } from '@/components/SearchBar';
import { getJurisdictions, getPostsByFilters, getPublishedYears, getReaderBookmarks } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Court Cases & Case Briefs',
  description:
    'Structured briefs of Kenyan judgments: citation, bench, facts, issues, holding and obiter dicta, filtered by court, area of law and year.',
  openGraph: {
    title: 'Court Cases & Case Briefs | Sheria Docket',
    description: 'Kenyan judgments broken into citation, bench, facts, issues, holding and obiter dicta.'
  }
};

interface CasesPageProps {
  searchParams: Promise<{
    q?: string;
    jurisdiction?: string;
    area?: string;
    year?: string;
    category?: string;
  }>;
}

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const { q, jurisdiction, area, year, category } = await searchParams;
  const activeCategory = category ?? 'case_brief';

  const [posts, jurisdictions, years, bookmarks] = await Promise.all([
    getPostsByFilters({ q, jurisdiction, area, year, category: activeCategory, limit: 60 }),
    getJurisdictions(),
    getPublishedYears(),
    getReaderBookmarks()
  ]);

  const showingOpinions = activeCategory === 'opinion';

  return (
    <div className="container py-12">
      <header className="max-w-3xl space-y-3">
        <p className="section-label">{showingOpinions ? 'Opinions' : 'Case briefs'}</p>
        <h1 className="text-4xl">{showingOpinions ? 'Commentary and opinions' : 'Kenyan court cases, briefed'}</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          {showingOpinions
            ? 'Considered commentary on where Kenyan law is heading, written by practitioners and academics.'
            : 'Each brief sets out the citation, the bench, the facts, the questions the court had to answer, the holding and any obiter dicta worth keeping.'}
        </p>
      </header>

      <div className="mt-8">
        <SearchBar jurisdictions={jurisdictions} years={years} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {posts.length} {posts.length === 1 ? 'result' : 'results'}
          {q ? ` for “${q}”` : ''}
          {jurisdiction ? ` · ${jurisdiction}` : ''}
          {area ? ` · ${area}` : ''}
          {year ? ` · ${year}` : ''}
        </p>
        <a
          href={showingOpinions ? '/cases' : '/cases?category=opinion'}
          className="text-sm font-medium text-navy underline underline-offset-4 dark:text-foreground"
        >
          {showingOpinions ? 'View case briefs' : 'View opinions'}
        </a>
      </div>

      {posts.length > 0 ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const bookmark = {
              saved: bookmarks.ids.has(post.id),
              signedIn: bookmarks.signedIn,
              nextPath: '/cases'
            };

            return post.category === 'case_brief' ? (
              <CaseBriefCard key={post.id} post={post} bookmark={bookmark} />
            ) : (
              <PostCard key={post.id} post={post} bookmark={bookmark} />
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed p-12 text-center">
          <p className="font-serif text-xl">Nothing matches those filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a broader search, or browse every brief without filters.
          </p>
        </div>
      )}
    </div>
  );
}
