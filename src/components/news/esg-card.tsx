'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { ESGPost } from '@/lib/models/esg-posts'
import { formatDate } from '@/lib/utils'

interface ESGCardProps {
  post: ESGPost;
  variant?: 'default' | 'featured' | 'compact';
}

export function ESGCard({ post, variant = 'default' }: ESGCardProps) {
  const { language } = useLanguage();

  const formatDateByLanguage = (dateString: string) => {
    return formatDate(dateString, language === 'ko' ? 'ko-KR' : 'en-US');
  };

  // Category badge text and colors
  const getCategoryProps = (category: string) => {
    const categories: Record<string, { text: { ko: string; en: string }, color: string }> = {
      'environment': {
        text: { ko: '환경', en: 'Environment' },
        color: 'bg-green-100 text-green-800'
      },
      'social': {
        text: { ko: '사회공헌', en: 'Social' },
        color: 'bg-blue-100 text-blue-800'
      },
      'governance': {
        text: { ko: '경영', en: 'Governance' },
        color: 'bg-purple-100 text-purple-800'
      }
    };

    return categories[category] || {
      text: { ko: 'ESG', en: 'ESG' },
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const categoryProps = getCategoryProps(post.category);

  if (variant === 'featured') {
    return (
      <div className="relative flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 h-full">
        <div className="md:w-1/2 h-64 md:h-auto relative">
          <Image
            src={post.imageSrc}
            alt={post.title[language]}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className={`${categoryProps.color} px-3 py-1 rounded-full text-xs font-medium`}>
              {categoryProps.text[language]}
            </span>
          </div>
        </div>
        <div className="p-6 md:w-1/2 flex flex-col">
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <Calendar size={14} className="mr-1" />
            <span>{formatDateByLanguage(post.date)}</span>
          </div>
          <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title[language]}</h3>
          <p className="text-gray-600 mb-4 flex-grow line-clamp-3">{post.excerpt[language]}</p>
          <Link
            href={`/notice/esg/${post.slug}`}
            className="inline-flex items-center text-echoit-primary hover:text-echoit-secondary font-medium"
          >
            {language === 'ko' ? '자세히 보기' : 'Read more'} <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-start space-x-4 border-b border-gray-200 pb-4">
        <div className="flex-shrink-0 w-16 h-16 relative rounded overflow-hidden">
          <Image
            src={post.imageSrc}
            alt={post.title[language]}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`${categoryProps.color} px-2 py-0.5 rounded-full text-xs font-medium`}>
              {categoryProps.text[language]}
            </span>
            <span className="text-gray-500 text-xs">{formatDateByLanguage(post.date)}</span>
          </div>
          <h4 className="text-sm font-medium mb-1 line-clamp-2">{post.title[language]}</h4>
          <Link
            href={`/notice/esg/${post.slug}`}
            className="text-xs text-echoit-primary hover:text-echoit-secondary font-medium"
          >
            {language === 'ko' ? '자세히 보기' : 'Read more'}
          </Link>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="relative h-48">
        <Image
          src={post.imageSrc}
          alt={post.title[language]}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`${categoryProps.color} px-3 py-1 rounded-full text-xs font-medium`}>
            {categoryProps.text[language]}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <Calendar size={14} className="mr-1" />
          <span>{formatDateByLanguage(post.date)}</span>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title[language]}</h3>
        <p className="text-gray-600 mb-4 flex-grow line-clamp-3">{post.excerpt[language]}</p>
        <Link
          href={`/notice/esg/${post.slug}`}
          className="inline-flex items-center text-echoit-primary hover:text-echoit-secondary font-medium"
        >
          {language === 'ko' ? '자세히 보기' : 'Read more'} <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
}
