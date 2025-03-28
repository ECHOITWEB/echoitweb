import React from 'react';
import { getESGPostBySlug } from '@/lib/services/posts';
import { notFound } from 'next/navigation';
import ESGPostDetail from './ESGPostDetail';

// Define params type for server component
interface ESGDetailPageProps {
  params: {
    slug: string;
  };
}

// Server component with dynamic data fetching
export default async function ESGDetailPage({ params }: ESGDetailPageProps) {
  const { slug } = params;
  const post = await getESGPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <ESGPostDetail post={post} />;
}
