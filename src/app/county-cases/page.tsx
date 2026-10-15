import type { Metadata } from 'next';
import Link from 'next/link';

import { PostCard } from '@/components/PostCard';
import { getJurisdictions, getPostsByFilters, getReaderBookmarks } from '@/lib/queries';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'County Cases & County Legal Updates',
  description:
    'Legal developments from Kenya’s counties: devolution disputes, county legislation, land adjudication and court decisions outside Nairobi.',
  openGraph: {
    title: 'County Cases & County Legal Updates | Sheria Docket',
    description: 'Devolution disputes and county-level court decisions from across Kenya.'
  }
};

interface CountyCasesPageProps {
  searchParams: Promise<{ county?: string }>;
}

export default async function CountyCasesPage({ searchParams }: CountyCasesPageProps) {
  const { county } = await searchParams;

  const [posts, counties, bookmarks] = await Promise.all([
    getPostsByFilters({ category: 'county_update', jurisdiction: county, limit: 60 }),
    getJurisdictions(),
    getReaderBookmarks()
  ]);

  return (
    <div className="container py-12">
      <header className="max-w-3xl space-y-3">
        <p className="section-label">County cases</p>
        <h1 className="text-4xl">Justice beyond Milimani</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Devolution disputes, county assembly legislation, land adjudication and magistrates&apos; decisions that shape
          how services reach Kenyans outside the capital.
        </p>
      </header>

      {counties.length > 0 ? (
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filter by county">
          <Link
            href="/county-cases"
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-gold hover:text-gold-dark',
              !county ? 'border-gold bg-accent/10 text-gold-dark' : 'border-border text-muted-foreground'
            )}
          >
            All counties
          </Link>
          {counties.map((item) => (
            <Link
              key={item}
              href={`/county-cases?county=${encodeURIComponent(item)}`}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-gold hover:text-gold-dark',
                county === item ? 'border-gold bg-accent/10 text-gold-dark' : 'border-border text-muted-foreground'
              )}
            >
              {item}
            </Link>
          ))}
        </nav>
      ) : null}

      {posts.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              bookmark={{ saved: bookmarks.ids.has(post.id), signedIn: bookmarks.signedIn, nextPath: '/county-cases' }}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No county updates published yet{county ? ` for ${county}` : ''}.
        </p>
      )}
    </div>
  );
}
