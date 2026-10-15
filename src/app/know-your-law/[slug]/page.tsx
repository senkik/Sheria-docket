import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleDetail } from '@/components/ArticleDetail';
import { getCurrentProfile } from '@/lib/auth';
import { getPostBySlug } from '@/lib/queries';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Guide not found' };

  const description = post.excerpt ?? `A plain-language guide to ${post.title} under Kenyan law.`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/know-your-law/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/know-your-law/${post.slug}`,
      publishedTime: post.published_at ?? post.created_at,
      images: post.cover_image_url ? [{ url: post.cover_image_url, alt: post.title }] : undefined
    }
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const profile = await getCurrentProfile();
  const canPreview =
    profile !== null && (profile.id === post.author_id || profile.role === 'admin' || profile.role === 'editor');

  if (post.status !== 'published' && !canPreview) notFound();

  return <ArticleDetail post={post} backHref="/know-your-law" backLabel="All guides" />;
}
