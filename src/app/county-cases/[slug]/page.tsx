import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleDetail } from '@/components/ArticleDetail';
import { getCurrentProfile } from '@/lib/auth';
import { getPostBySlug } from '@/lib/queries';

interface CountyUpdatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CountyUpdatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Update not found' };

  const description = post.excerpt ?? `A county legal update from ${post.jurisdiction ?? 'Kenya'}.`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/county-cases/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/county-cases/${post.slug}`,
      publishedTime: post.published_at ?? post.created_at,
      images: post.cover_image_url ? [{ url: post.cover_image_url, alt: post.title }] : undefined
    }
  };
}

export default async function CountyUpdatePage({ params }: CountyUpdatePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const profile = await getCurrentProfile();
  const canPreview =
    profile !== null && (profile.id === post.author_id || profile.role === 'admin' || profile.role === 'editor');

  if (post.status !== 'published' && !canPreview) notFound();

  return <ArticleDetail post={post} backHref="/county-cases" backLabel="All county updates" />;
}
