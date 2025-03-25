import React from 'react';
import { getNewsPostBySlug, getAllNewsPosts } from '@/lib/models/news-posts';
import { notFound } from 'next/navigation';
import NewsPostDetail from './NewsPostDetail';

// Define params type for server component
interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

// Generate static paths for all news posts
export async function generateStaticParams() {
  const posts = getAllNewsPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

// Server component
export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = params;
  const post = getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <NewsPostDetail post={post} />;
}
