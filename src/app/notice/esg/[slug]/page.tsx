import React from 'react';
import { getESGPostBySlug, getAllESGPosts } from '@/lib/models/esg-posts';
import { notFound } from 'next/navigation';
import ESGPostDetail from './ESGPostDetail';

// Define params type for server component
interface ESGDetailPageProps {
  params: {
    slug: string;
  };
}

// Generate static paths for all ESG posts
export async function generateStaticParams() {
  const posts = getAllESGPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

// Server component
export default function ESGDetailPage({ params }: ESGDetailPageProps) {
  const { slug } = params;
  const post = getESGPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <ESGPostDetail post={post} />;
}
