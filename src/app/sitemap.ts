import type { MetadataRoute } from 'next';

import { SITE } from '@/lib/constants';
import { getPublishedPosts } from '@/lib/queries';
import { postHref } from '@/lib/utils';

export const revalidate = 3600;

const STATIC_ROUTES = [
  '',
  '/cases',
  '/student-hub',
  '/student-hub/moot-court',
  '/student-hub/internships',
  '/know-your-law',
  '/county-cases',
  '/about',
  '/privacy',
  '/disclaimer',
  '/copyright'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7
  }));

  try {
    const posts = await getPublishedPosts({ limit: 500 });

    posts.forEach((post) => {
      entries.push({
        url: `${SITE.url}${postHref(post)}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly',
        priority: 0.6
      });
    });
  } catch {
    // The sitemap still serves the public routes if the database is unreachable.
  }

  return entries;
}
