"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ContentForm, ContentFormData, FormError, TagifyEvent } from '@/components/admin/ContentForm';
import { Loader2 } from 'lucide-react';
import { ImageSource } from '@/types/common';

// ESG 카테고리 목록
const ESG_CATEGORIES = [
  { value: 'environment', label: '환경' },
  { value: 'social', label: '사회' },
  { value: 'governance', label: '지배구조' },
  { value: 'esg_management', label: 'ESG 경영' },
  { value: 'sustainability', label: '지속가능성' },
  { value: 'csr', label: '사회공헌' },
  { value: 'other', label: '기타' }
];

interface DecodedToken {
  role?: string;
  roles?: string[];
  [key: string]: unknown;
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
    console.error('토큰 처리 중 오류:', e);
    return null;
  }
  
  return null;
}

// 로딩 컴포넌트
function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <span className="ml-2">로딩 중...</span>
    </div>
  );
}

export default function CreateESGPage(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  
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

  // 필요시, 실제 사용자 목록을 API로 불러오는 예제
  /*
  useEffect(() => {
    async function fetchAuthors() {
      try {
        const res = await fetch('/api/users'); // 실제 API 경로로 수정
        const users = await res.json();
        const options = users
          .filter((user: any) => ['admin', 'editor'].includes(user.role))
          .map((user: any) => ({
            label: user.name,
            value: user.id,
          }));
        setAuthorOptions(options);
      } catch (err) {
        console.error('작성자 목록 불러오기 실패:', err);
      }
    }
    fetchAuthors();
  }, []);
  */

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
      const response = await fetch('/api/posts/esg', {
        method: 'POST',
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
        console.error('ESG 생성 오류:', data);
        throw new Error(data.message || '생성 중 오류가 발생했습니다.');
      }

      toast({
        title: "성공",
        description: "ESG 콘텐츠가 성공적으로 생성되었습니다.",
      });

      // 목록 페이지로 이동
      router.push('/admin/esg');
    } catch (error) {
      console.error('ESG 생성 오류:', error);
      toast({
        title: "생성 실패",
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
    router.push('/admin/esg');
  };

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
        isEditMode={false}
        categories={ESG_CATEGORIES}
        authorOptions={authorOptions}
      />
    </div>
  );
}
