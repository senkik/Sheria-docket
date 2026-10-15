import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleDetail } from '@/components/ArticleDetail';
import { getCurrentProfile } from '@/lib/auth';
import { getPostBySlug } from '@/lib/queries';

interface StudentGuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StudentGuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Guide not found' };

  const description = post.excerpt ?? `A study guide on ${post.title} for Kenyan law students.`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/student-hub/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/student-hub/${post.slug}`,
      publishedTime: post.published_at ?? post.created_at,
      images: post.cover_image_url ? [{ url: post.cover_image_url, alt: post.title }] : undefined
    }
  };
}

export default async function StudentGuidePage({ params }: StudentGuidePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const profile = await getCurrentProfile();
  const canPreview =
    profile !== null && (profile.id === post.author_id || profile.role === 'admin' || profile.role === 'editor');

  if (post.status !== 'published' && !canPreview) notFound();

  return <ArticleDetail post={post} backHref="/student-hub" backLabel="Back to the Student Hub" />;
}
