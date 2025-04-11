"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthorSelect } from '@/components/forms/author-select';
import { useToast } from '@/hooks/use-toast';
import { ContentForm, ContentFormData, FormError, TagifyEvent } from '@/components/admin/ContentForm';
import { Loader2 } from 'lucide-react';
import { ImageSource } from '@/types/common';

// 뉴스 카테고리 목록
const NEWS_CATEGORIES = [
  { value: 'tech', label: '기술' },
  { value: 'industry', label: '산업' },
  { value: 'company', label: '기업' },
  { value: 'finance', label: '금융' },
  { value: 'policy', label: '정책' },
  { value: 'event', label: '이벤트' },
  { value: 'other', label: '기타' }
];

// API 응답 타입
interface NewsPost {
  _id?: string;
  title?: {
    ko: string;
    en: string;
  };
  summary?: {
    ko: string;
    en: string;
  };
  content?: {
    ko: string;
    en: string;
  };
  category?: string;
  author?: {
    _id?: string;
    department?: string;
    name?: string;
  };
  publishDate?: string;
  imageSource?: ImageSource;
  isPublished?: boolean;
  isMainFeatured?: boolean;
  tags?: string[];
  originalUrl?: string;
}

interface NewsApiResponse {
  success: boolean;
  post: NewsPost;
  message?: string;
}

// 토큰을 가져오는 함수
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionStr = localStorage.getItem('echoit_auth_token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.accessToken) {
        return session.accessToken;
      }
    }
    return null;
  } catch (e) {
    console.error('토큰 처리 중 오류:', e);
    return null;
  }
}

// 로딩 컴포넌트
function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-lg">뉴스 데이터를 불러오는 중...</span>
    </div>
  );
}

export default function EditNewsPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const newsId = params.id as string;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('current_user');

  // 폼 데이터 초기 상태
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    summary: '',
    content: '',
    category: 'tech',
    author: 'current_user',
    publishDate: new Date(),
    imageSource: {
      thumbnail: '',
      medium: '',
      large: '',
      original: ''
    },
    tags: [],
    originalUrl: '',
    isPublished: true,
    isMainFeatured: false,
    thumbnailPath: '',
    mediumPath: '',
    largePath: '',
    originalPath: ''
  });

  // 데이터 로드
  useEffect(() => {
    async function loadNewsData(): Promise<void> {
      if (!newsId) return;
      
      setIsLoading(true);
      try {
        const token = getToken();
        if (!token) {
          toast({
            title: "인증 오류",
            description: "로그인이 필요합니다.",
            variant: "destructive"
          });
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`/api/posts/news/${newsId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('뉴스 데이터를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json() as NewsApiResponse;
        const post = data.post;
        
        if (!post) {
          throw new Error('뉴스 데이터가 없습니다.');
        }
        
        console.log('[디버그] 로드된 뉴스 데이터:', post);
        
        // 작성자 정보 설정
        let authorId = 'current_user';
        if (post.author) {
          if (typeof post.author === 'string') {
            authorId = post.author;
          } else if (post.author._id) {
            authorId = post.author._id;
          }
        }
        setSelectedAuthor(authorId);
        
        // 이미지 소스 처리
        let imageSourceObj: ImageSource = {
          thumbnail: '',
          medium: '',
          large: '',
          original: ''
        };
        
        if (post.imageSource) {
          if (typeof post.imageSource === 'string') {
            imageSourceObj = {
              thumbnail: post.imageSource,
              medium: post.imageSource,
              large: post.imageSource,
              original: post.imageSource
            };
          } else {
            imageSourceObj = post.imageSource;
          }
        }
        
        // 폼 데이터 설정
        setFormData({
          title: post.title?.ko || '',
          summary: post.summary?.ko || '',
          content: post.content?.ko || '',
          category: post.category || 'tech',
          author: authorId,
          publishDate: post.publishDate ? new Date(post.publishDate) : new Date(),
          imageSource: imageSourceObj,
          tags: post.tags || [],
          originalUrl: post.originalUrl || '',
          isPublished: post.isPublished || false,
          isMainFeatured: post.isMainFeatured || false,
          thumbnailPath: typeof imageSourceObj === 'object' ? imageSourceObj.thumbnail : '',
          mediumPath: typeof imageSourceObj === 'object' ? imageSourceObj.medium : '',
          largePath: typeof imageSourceObj === 'object' ? imageSourceObj.large : '',
          originalPath: typeof imageSourceObj === 'object' ? imageSourceObj.original : ''
        });
      } catch (error) {
        console.error('뉴스 로딩 오류:', error);
        toast({
          title: "데이터 로딩 실패",
          description: "뉴스 데이터를 불러오는데 실패했습니다.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadNewsData();
  }, [newsId, router, toast]);

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!formData.title) {
      newErrors.push({ field: 'title', message: '제목을 입력해주세요.' });
    }
    if (!formData.content) {
      newErrors.push({ field: 'content', message: '내용을 입력해주세요.' });
    }
    
    // 이미지 경로 검사
    const hasImage = formData.thumbnailPath || formData.originalPath || 
                     formData.imageSource?.thumbnail || formData.imageSource?.original;
    
    if (!hasImage) {
      newErrors.push({ field: 'image', message: '대표 이미지를 업로드해주세요.' });
    }
    
    if (formData.originalUrl && !/^https?:\/\/.+/.test(formData.originalUrl)) {
      newErrors.push({ field: 'originalUrl', message: '올바른 URL 형식이 아닙니다. (예: https://example.com)' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (!validateForm()) {
        setIsSubmitting(false);
        toast({
          title: "입력 오류",
          description: "필수 정보를 모두 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 토큰 가져오기
      const token = getToken();
      if (!token) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      // 이미지 소스 구성
      const imageSource = {
        thumbnail: formData.thumbnailPath || formData.imageSource.thumbnail || '',
        medium: formData.mediumPath || formData.imageSource.medium || '',
        large: formData.largePath || formData.imageSource.large || '',
        original: formData.originalPath || formData.imageSource.original || ''
      };

      // API 요청
      const response = await fetch(`/api/posts/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: { ko: formData.title },
          summary: { ko: formData.summary },
          content: { ko: formData.content },
          category: formData.category,
          author: formData.author,
          publishDate: formData.publishDate,
          imageSource,
          tags: formData.tags,
          isPublished: formData.isPublished,
          isMainFeatured: formData.isMainFeatured,
          originalUrl: formData.originalUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('뉴스 업데이트 오류:', data);
        throw new Error(data.message || '업데이트 중 오류가 발생했습니다.');
      }

      toast({
        title: "성공",
        description: "뉴스가 성공적으로 업데이트되었습니다.",
      });

      // 목록 페이지로 이동
      router.push('/admin/news');
    } catch (error) {
      console.error('뉴스 업데이트 오류:', error);
      toast({
        title: "업데이트 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorChange = (authorId: string): void => {
    setSelectedAuthor(authorId);
    setFormData(prev => ({
      ...prev,
      author: authorId
    }));
  };

  const handleTagChange = (e: TagifyEvent): void => {
    const tags = e.detail.tagify.value.map(tag => tag.value);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleBackClick = () => {
    router.push('/admin/news');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <ContentForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errors={errors}
        selectedAuthor={selectedAuthor}
        handleAuthorChange={handleAuthorChange}
        handleTagChange={handleTagChange}
        handleBackClick={handleBackClick}
        contentType="news"
        isEditMode={true}
        categories={NEWS_CATEGORIES}
      />
    </div>
  );
} 