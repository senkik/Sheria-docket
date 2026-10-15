import { NextResponse, type NextRequest } from 'next/server';

import { getPostsByFilters } from '@/lib/queries';

export const dynamic = 'force-dynamic';

/** Backs the /cases search engine: /api/cases?jurisdiction=Supreme+Court&area=Criminal&year=2023 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const posts = await getPostsByFilters({
    q: searchParams.get('q') ?? undefined,
    jurisdiction: searchParams.get('jurisdiction') ?? undefined,
    area: searchParams.get('area') ?? undefined,
    year: searchParams.get('year') ?? undefined,
    category: searchParams.get('category') ?? 'case_brief',
    limit: Math.min(Number(searchParams.get('limit') ?? 30) || 30, 100)
  });

  return NextResponse.json(
    {
      count: posts.length,
      filters: {
        q: searchParams.get('q'),
        jurisdiction: searchParams.get('jurisdiction'),
        area: searchParams.get('area'),
        year: searchParams.get('year'),
        category: searchParams.get('category')
      },
      posts
    },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
