"use client";

import React from 'react';
import { getESGPostBySlug } from '@/lib/models/esg-posts';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';

export default function ESGPostDetail({ post }: { post: ReturnType<typeof getESGPostBySlug> }) {
  const { language, translations } = useLanguage();

  if (!post) return null;

  // Format date with proper locale
  const formattedDate = format(
    new Date(post.date),
    language === 'ko' ? 'yyyy년 MM월 dd일' : 'MMMM d, yyyy',
    { locale: language === 'ko' ? ko : enUS }
  );

  // Translate category label
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: { ko: string; en: string } } = {
      environment: { ko: '환경', en: 'Environment' },
      social: { ko: '사회', en: 'Social' },
      governance: { ko: '지배구조', en: 'Governance' },
    };

    return categoryMap[category]?.[language] || category;
  };

  // Category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environment':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'governance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fallback translations if context is not available during static render
  const backToListText = translations?.backToList || (language === 'ko' ? '목록으로 돌아가기' : 'Back to List');
  const relatedPostsText = translations?.relatedPosts || (language === 'ko' ? '관련 게시물' : 'Related Posts');

  return (
    <div className="echoit-container py-10">
      <div className="mb-8">
        <Link href="/notice/esg" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {backToListText}
        </Link>
      </div>

      <article className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-4">{post.title[language]}</h1>

          <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600 mb-6">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
              {getCategoryLabel(post.category)}
            </span>
            <span>•</span>
            <span>{post.author}</span>
          </div>

          <div className="aspect-w-16 aspect-h-9 mb-8 relative rounded-lg overflow-hidden">
            <Image
              src={post.imageSrc}
              alt={post.title[language]}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {post.content[language].split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4">{relatedPostsText}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Related posts would go here */}
          </div>
        </div>
      </article>
    </div>
  );
}
