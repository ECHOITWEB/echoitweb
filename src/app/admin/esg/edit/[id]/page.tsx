"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ContentForm, ContentFormData, FormError, TagifyEvent } from '@/components/admin/ContentForm';
import { Loader2 } from 'lucide-react';
import { ImageSource } from '@/types/common';

// ESG 카테고리 목록
const ESG_CATEGORIES = [
  { value: 'environment', label: '환경' },
  { value: 'social', label: '사회' },
  { value: 'governance', label: '지배구조' },
  { value: 'sustainability', label: '지속가능성' },
  { value: 'report', label: '보고서' },
  { value: 'other', label: '기타' }
];

// API 응답 타입
interface ESGPost {
  _id?: string;
  title?: {
    ko: string;
    en?: string;
  };
  summary?: {
    ko: string;
    en?: string;
  };
  content?: {
    ko: string;
    en?: string;
  };
  category?: string;
  author?: {
    _id?: string;
    department?: string;
    name?: string;
  };
  publishDate?: string;
  thumbnailUrl?: string;
  imageSource?: any;
  isPublished?: boolean;
  isMainFeatured?: boolean;
  tags?: string[];
  originalUrl?: string;
}

interface ESGApiResponse {
  success: boolean;
  post: ESGPost;
  message?: string;
}

// 토큰을 가져오는 함수
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionStr = localStorage.getItem('echoit_auth_token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.accessToken || null;
    }
  } catch (e) {
    console.error('세션 파싱 오류:', e);
  }
  
  return null;
}

// 로딩 컴포넌트
function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-lg">ESG 데이터를 불러오는 중...</span>
    </div>
  );
}

export default function EditESGPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('current_user');

  // 폼 데이터 초기 상태
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    summary: '',
    content: '',
    category: 'environment',
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
    isPublished: false,
    isMainFeatured: false,
    thumbnailPath: '',
    mediumPath: '',
    largePath: '',
    originalPath: ''
  });

  // 작성자 옵션 상태 (예제: 현재 사용자만 존재하는 옵션)
  const [authorOptions, setAuthorOptions] = useState<{ label: string; value: string }[]>([]);

  // 컴포넌트 마운트 시 ESG 데이터 로드
  useEffect(() => {
    async function loadESGData(): Promise<void> {
      if (!id) return;
      
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

        const response = await fetch(`/api/posts/esg/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('ESG 데이터를 불러오는데 실패했습니다.');
        }

        const data: ESGApiResponse = await response.json();
        if (!data.success || !data.post) {
          throw new Error(data.message || 'ESG 데이터를 불러오는데 실패했습니다.');
        }

        // API 응답에서 폼 데이터로 변환
        const post = data.post;
        console.log('불러온 ESG 데이터:', post);
        
        // 작성자 ID 추출
        let authorId = '';
        if (post.author) {
          if (typeof post.author === 'string') {
            authorId = post.author;
          } else if (post.author._id) {
            authorId = post.author._id;
          }
        }
        
        setSelectedAuthor(authorId || '');

        // 이미지 소스 정보 처리
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

        setFormData({
          title: post.title?.ko || '',
          summary: post.summary?.ko || '',
          content: post.content?.ko || '',
          category: post.category || 'environment',
          author: authorId,
          publishDate: post.publishDate ? new Date(post.publishDate) : new Date(),
          imageSource: imageSourceObj,
          tags: post.tags || [],
          isPublished: post.isPublished || false,
          isMainFeatured: post.isMainFeatured || false,
          originalUrl: post.originalUrl || '',
          thumbnailPath: typeof imageSourceObj === 'object' ? imageSourceObj.thumbnail : '',
          mediumPath: typeof imageSourceObj === 'object' ? imageSourceObj.medium : '',
          largePath: typeof imageSourceObj === 'object' ? imageSourceObj.large : '',
          originalPath: typeof imageSourceObj === 'object' ? imageSourceObj.original : ''
        });
      } catch (error) {
        console.error('ESG 데이터 로딩 오류:', error);
        toast({
          title: "데이터 로딩 실패",
          description: error instanceof Error ? error.message : "ESG 데이터를 불러오는데 실패했습니다.",
          variant: "destructive"
        });
        router.push('/admin/esg');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadESGData();
  }, [id, router, toast]);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setErrors([]);

      // 폼 유효성 검사
      const newErrors: FormError[] = [];
      if (!formData.title) {
        newErrors.push({ field: 'title', message: '제목을 입력해주세요.' });
      }
      if (!formData.content) {
        newErrors.push({ field: 'content', message: '내용을 입력해주세요.' });
      }
      
      // 이미지 경로 검사 - 썸네일 또는 원본 이미지 중 하나는 반드시 있어야 함
      const hasImage = 
        (formData.thumbnailPath && formData.thumbnailPath.length > 0) || 
        (formData.originalPath && formData.originalPath.length > 0) || 
        (formData.imageSource && typeof formData.imageSource === 'object' && 
         ((formData.imageSource.thumbnail && formData.imageSource.thumbnail.length > 0) || 
          (formData.imageSource.original && formData.imageSource.original.length > 0)));
      
      if (!hasImage) {
        newErrors.push({ field: 'image', message: '대표 이미지를 업로드해주세요.' });
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
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

      // 이미지 소스 정보 구성 - 폼에서 설정한 정보 우선 사용
      const imageSource = {
        thumbnail: formData.thumbnailPath || (formData.imageSource && typeof formData.imageSource === 'object' ? formData.imageSource.thumbnail : ''),
        medium: formData.mediumPath || (formData.imageSource && typeof formData.imageSource === 'object' ? formData.imageSource.medium : ''),
        large: formData.largePath || (formData.imageSource && typeof formData.imageSource === 'object' ? formData.imageSource.large : ''),
        original: formData.originalPath || (formData.imageSource && typeof formData.imageSource === 'object' ? formData.imageSource.original : '')
      };

      console.log('제출할 이미지 데이터:', imageSource);

      // API 요청
      const response = await fetch(`/api/posts/esg/${id}`, {
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
        console.error('ESG 업데이트 오류:', data);
        throw new Error(data.message || '업데이트 중 오류가 발생했습니다.');
      }

      toast({
        title: "성공",
        description: "ESG 게시물이 성공적으로 업데이트되었습니다.",
      });

      // 목록 페이지로 이동
      router.push('/admin/esg');
    } catch (error) {
      console.error('ESG 업데이트 오류:', error);
      toast({
        title: "업데이트 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 작성자 변경 처리
  const handleAuthorChange = (authorId: string): void => {
    setSelectedAuthor(authorId);
    setFormData({ ...formData, author: authorId });
  };

  // 태그 변경 처리
  const handleTagChange = (e: TagifyEvent): void => {
    const newTags = e.detail.tagify.value.map(tag => tag.value);
    setFormData({ ...formData, tags: newTags });
  };

  // 뒤로 가기 처리
  const handleBackClick = (): void => {
    router.push('/admin/esg');
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
        contentType="esg"
        isEditMode={true}
        categories={ESG_CATEGORIES}
        authorOptions={authorOptions}
      />
    </div>
  );
}
