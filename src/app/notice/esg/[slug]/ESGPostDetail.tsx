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

// MongoDB ESG 게시물 인터페이스
interface MultiLingual {
  ko: string;
  en?: string;
}

interface Author {
  name: string;
  department?: string;
}

interface ESGPostProps {
  _id: string;
  title: MultiLingual;
  summary?: MultiLingual;
  content: MultiLingual;
  category: string;
  author?: Author;
  publishDate: string;
  imageSource?: string;
  thumbnailUrl?: string;
  originalUrl?: string;
  viewCount: number;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ESGPostDetailProps {
  post: ESGPostProps;
}

export default function ESGPostDetail({ post }: ESGPostDetailProps) {
  const { language, setLanguage } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [translating, setTranslating] = useState(false);
  
  // 번역된 콘텐츠를 저장할 상태
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  if (!post) return null;

  // 날짜 형식 지정
  const formattedDate = format(
    new Date(post.publishDate),
    language === 'ko' ? 'yyyy년 MM월 dd일' : 'MMMM d, yyyy',
    { locale: language === 'ko' ? ko : enUS }
  );

  // 구글 번역 API 호출 함수
  const translateText = async (text: string, target: string = 'en'): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    
    // API 키가 없는 경우 오류 반환
    if (!apiKey) {
      console.error('번역 API 키가 설정되지 않았습니다.');
      return text;
    }
    
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target,
          format: 'html'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`번역 API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.translations && data.data.translations.length > 0) {
        return data.data.translations[0].translatedText;
      } else {
        throw new Error('번역 결과가 없습니다.');
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
      'environment': { ko: '환경', en: 'Environment' },
      'social': { ko: '사회', en: 'Social' },
      'governance': { ko: '지배구조', en: 'Governance' },
      'csr': { ko: '사회공헌사업', en: 'CSR' },
      'sustainability': { ko: '지속가능경영', en: 'Sustainability' },
      'esg_management': { ko: 'ESG경영', en: 'ESG Management' },
      'other': { ko: '기타', en: 'Other' }
    };

    return categoryMap[category]?.[language] || category;
  };

  // 카테고리 배지 색상
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environment':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'governance':
        return 'bg-purple-100 text-purple-800';
      case 'csr':
        return 'bg-yellow-100 text-yellow-800';
      case 'sustainability':
        return 'bg-teal-100 text-teal-800';
      case 'esg_management':
        return 'bg-indigo-100 text-indigo-800';
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

  // 이미지 URL 가져오기
  const getImageUrl = () => {
    return post.imageSource || post.thumbnailUrl || '/images/placeholder-esg.jpg';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="echoit-container">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 뒤로 가기 링크 */}
          <div className="px-6 pt-6 flex justify-between items-center">
            <Link href="/notice/esg" className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {backToList}
            </Link>
            
            {/* 언어 전환 버튼 */}
            <div className="flex space-x-2">
              <Button 
                variant={language === 'ko' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('ko')}
                className="text-sm"
              >
                한국어
              </Button>
              <Button 
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="text-sm"
              >
                English
              </Button>
              
              {/* 번역 상태 표시 */}
              {translating && (
                <div className="flex items-center text-sm text-blue-600 ml-2">
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  <span>{language === 'ko' ? '번역 중...' : 'Translating...'}</span>
                </div>
              )}
            </div>
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
                {post.author && (
                  <div className="flex items-center">
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                )}
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
              <div className="mb-8 bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
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

            {/* 이미지 섹션 */}
            {getImageUrl() && (
              <div className="mb-8 relative rounded-lg overflow-hidden max-w-lg mx-auto">
                <Image
                  src={getImageUrl()}
                  alt={getLocalizedContent(post.title, translatedTitle)}
                  width={500}
                  height={250}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* 본문 섹션 */}
            <div 
              className="prose prose-lg max-w-none prose-img:rounded-lg prose-headings:font-bold prose-a:text-green-600"
              dangerouslySetInnerHTML={createMarkup(getLocalizedContent(post.content, translatedContent))}
            />
          </article>

          {/* 푸터 섹션 */}
          <div className="px-6 md:px-8 pb-8">
            <hr className="mb-6 border-t border-gray-200" />
            <div className="flex justify-between items-center">
              <Link href="/notice/esg" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
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
