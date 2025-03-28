import React from 'react';
import { getNewsPostBySlug } from '@/lib/services/posts';
import { notFound } from 'next/navigation';
import NewsPostDetail from './NewsPostDetail';

// Define params type for server component
interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

// Server component with dynamic data fetching
export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <NewsPostDetail post={post} />;
}
