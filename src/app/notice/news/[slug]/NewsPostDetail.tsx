"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { ArrowLeft, Calendar, Eye, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageSource, MultiLingual } from '@/types/common';

// 간단화된 인터페이스 정의
interface Author {
  name: string;
  username?: string;
  role?: string;
  department?: string;
  _id?: string;
}

interface NewsPostProps {
  _id: string;
  title: MultiLingual;
  summary?: MultiLingual;
  content: MultiLingual;
  category: string;
  author?: Author | string;
  publishDate: string;
  imageSource?: ImageSource;
  originalUrl?: string;
  viewCount: number;
  slug: string;
  isPublished: boolean;
  isMainFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnailPath?: string;
  mediumPath?: string;
  originalPath?: string;
}

interface NewsPostDetailProps {
  post: NewsPostProps;
}

export default function NewsPostDetail({ post }: NewsPostDetailProps) {
  const { language, setLanguage } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [translating, setTranslating] = useState(false);
  
  // 디버깅을 위한 콘솔 로그
  useEffect(() => {
    console.log('NewsPostDetail 렌더링, post 데이터:', post);
    console.log('post?.title 구조:', post?.title);
    console.log('post?.content 구조:', post?.content);
  }, [post]);
  
  // 번역된 콘텐츠를 저장할 상태
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  if (!post) return <div className="p-10 text-center text-red-500">게시물을 찾을 수 없습니다.</div>;

  // 날짜 형식 지정
  const formattedDate = format(
    new Date(post.publishDate),
    language === 'ko' ? 'yyyy년 MM월 dd일' : 'MMMM d, yyyy',
    { locale: language === 'ko' ? ko : enUS }
  );

  // 구글 번역 API 호출 함수
  const translateText = async (text: string, target: string = 'en'): Promise<string> => {
    try {
      // 서버 API를 통해 번역 요청
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          target,
          format: 'html' // HTML 태그 보존
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`번역 API 오류: ${response.status} - ${errorData.error || '알 수 없는 오류'}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.translatedText) {
        return data.translatedText;
      } else {
        throw new Error(data.error || '번역 결과가 없습니다.');
      }
    } catch (error) {
      console.error('번역 오류:', error);
      return text; // 오류 발생 시 원본 텍스트 반환
    }
  };

  // 언어 변경 시 콘텐츠 번역 처리
  useEffect(() => {
    const translateContent = async () => {
      // 영어로 언어 변경 시 & 영어 콘텐츠가 없는 경우 번역 진행
      if (language === 'en' && !post.title.en && !translatedTitle) {
        setTranslating(true);
        
        // 제목 번역
        const title = await translateText(post.title.ko);
        setTranslatedTitle(title);
        
        // 요약 번역 (있는 경우)
        if (post.summary?.ko) {
          const summary = await translateText(post.summary.ko);
          setTranslatedSummary(summary);
        }
        
        // 본문 번역
        const content = await translateText(post.content.ko);
        setTranslatedContent(content);
        
        setTranslating(false);
      }
    };
    
    translateContent();
  }, [language, post, translatedTitle]);

  // 카테고리 라벨 번역
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: { ko: string; en: string } } = {
      company: { ko: '회사소식', en: 'Company' },
      award: { ko: '수상소식', en: 'Award' },
      product: { ko: '제품소식', en: 'Product' },
      media: { ko: '미디어', en: 'Media' },
      event: { ko: '이벤트', en: 'Event' },
      other: { ko: '기타', en: 'Other' }
    };

    return categoryMap[category]?.[language] || category;
  };

  // 카테고리 배지 색상
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'company':
        return 'bg-blue-100 text-blue-800';
      case 'award':
        return 'bg-yellow-100 text-yellow-800';
      case 'product':
        return 'bg-purple-100 text-purple-800';
      case 'media':
        return 'bg-indigo-100 text-indigo-800';
      case 'event':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 페이지 공유하기
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 작성자 이름을 가져오는 함수
  const getAuthorName = (): string => {
    if (!post.author) return '미지정';
    
    if (typeof post.author === 'string') {
      try {
        // JSON 문자열인지 확인
        const parsedAuthor = JSON.parse(post.author);
        if (parsedAuthor && parsedAuthor.name) {
          const roleName = parsedAuthor.role === 'admin' ? '관리자' : 
                          parsedAuthor.role === 'editor' ? '편집자' : '조회자';
          return `${parsedAuthor.name}(${roleName})`;
        }
      } catch (e) {
        // JSON이 아니면 무시
        return '미지정';
      }
    }
    
    if (typeof post.author === 'object') {
      // name과 role이 있는 경우 'name(role)' 형식으로 표시
      if (post.author.name && post.author.role) {
        const roleName = post.author.role === 'admin' ? '관리자' : 
                        post.author.role === 'editor' ? '편집자' : '조회자';
        return `${post.author.name}(${roleName})`;
      }
      
      // name만 있는 경우
      if (post.author.name) {
        return post.author.name;
      }
      
      // username만 있는 경우
      if (post.author.username) {
        return post.author.username;
      }
    }
    
    return '미지정';
  };

  // 작성자 부서를 가져오는 함수
  const getAuthorDepartment = (): string => {
    return '';
  };

  // HTML 변환 함수
  const createMarkup = (content: string) => {
    return { __html: content };
  };

  const backToList = language === 'ko' ? '목록으로 돌아가기' : 'Back to List';

  // 국제화된 콘텐츠 안전하게 가져오기 (번역 데이터 활용)
  const getLocalizedContent = (content?: MultiLingual, translated?: string | null) => {
    if (!content) return '';
    
    // 영어 요청 & 번역된 콘텐츠가 있는 경우
    if (language === 'en' && translated) {
      return translated;
    }
    
    // 기존 다국어 콘텐츠
    return content[language as keyof MultiLingual] || content.ko || '';
  };

  // 이미지 URL 결정 함수
  const getImageUrl = (): string => {
    // 1. ImageSource 객체가 있는 경우
    if (post.imageSource) {
      return post.imageSource.original || 
             post.imageSource.medium || 
             post.imageSource.thumbnail || '';
    }
    
    // 2. 개별 경로 필드가 있는 경우
    return post.originalPath || post.mediumPath || post.thumbnailPath || '';
  }

  // 이미지 렌더링 함수
  const renderImage = () => {
    const imageUrl = getImageUrl();
    
    if (!imageUrl) return null;
    
    return (
      <div className="mb-8 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={getLocalizedContent(post.title, translatedTitle)}
          width={1000}
          height={600}
          className="w-full h-auto"
        />
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="echoit-container">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 뒤로 가기 링크 */}
          <div className="px-6 pt-6 flex justify-between items-center">
            <Link href="/notice/news" className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {backToList}
            </Link>
            
            {/* 번역 상태 표시 */}
            {translating && (
              <div className="flex items-center text-sm text-blue-600">
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                <span>{language === 'ko' ? '번역 중...' : 'Translating...'}</span>
              </div>
            )}
          </div>

          {/* 메인 콘텐츠 */}
          <article className="p-6 md:p-8">
            {/* 헤더 섹션 */}
            <header className="mb-8">
              <div className="flex items-center space-x-2 mb-3">
                <Badge className={getCategoryColor(post.category)}>
                  {getCategoryLabel(post.category)}
                </Badge>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {getLocalizedContent(post.title, translatedTitle)}
              </h1>

              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1.5" />
                  <span>조회 {post.viewCount || 0}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">{getAuthorName()}</span>
                  {getAuthorDepartment() && (
                    <span className="ml-1 text-gray-400">({getAuthorDepartment()})</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShare}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  {copied ? (language === 'ko' ? '복사됨' : 'Copied') : (language === 'ko' ? '공유하기' : 'Share')}
                </Button>
              </div>
            </header>

            <hr className="mb-8 border-t border-gray-200" />

            {/* 요약 섹션 */}
            {post.summary && (
              <div className="mb-8 bg-gray-50 p-4 rounded-lg border-l-4 border-echoit-primary">
                <p className="text-lg italic text-gray-700">
                  {getLocalizedContent(post.summary, translatedSummary)}
                </p>
              </div>
            )}

            {/* 원본 URL이 있는 경우 링크 표시 */}
            {post.originalUrl && (
              <div className="mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-700 flex items-center">
                  <span className="font-semibold mr-2">{language === 'ko' ? '원본 출처:' : 'Original Source:'}</span>
                  <a 
                    href={post.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {post.originalUrl}
                  </a>
                </p>
              </div>
            )}

            {/* 이미지 */}
            {renderImage()}

            {/* 본문 섹션 */}
            <div 
              className="prose prose-lg max-w-none prose-img:rounded-lg prose-headings:font-bold prose-a:text-echoit-primary"
              dangerouslySetInnerHTML={createMarkup(getLocalizedContent(post.content, translatedContent))}
            />
          </article>

          {/* 푸터 섹션 */}
          <div className="px-6 md:px-8 pb-8">
            <hr className="mb-6 border-t border-gray-200" />
            <div className="flex justify-between items-center">
              <Link href="/notice/news" className="inline-flex items-center text-sm font-medium text-echoit-primary hover:text-echoit-secondary">
                <ArrowLeft className="w-4 h-4 mr-1" />
                {language === 'ko' ? '목록으로' : 'Back to list'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
