"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ContentForm, ContentFormData, FormError, TagifyEvent } from '@/components/admin/ContentForm';
import { Loader2 } from 'lucide-react';
import { ImageSource } from '@/types/common';

const NEWS_CATEGORIES = [
  { value: 'tech', label: '기술' },
  { value: 'industry', label: '산업' },
  { value: 'company', label: '기업' },
  { value: 'finance', label: '금융' },
  { value: 'policy', label: '정책' },
  { value: 'event', label: '이벤트' },
  { value: 'other', label: '기타' }
];

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('accessToken');
    if (token) return token;

    const sessionStr = localStorage.getItem('echoit_auth_token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.accessToken) return session.accessToken;
    }
    return null;
  } catch (e) {
    console.error('토큰 처리 중 오류:', e);
    return null;
  }
}

export default function CreateNewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('current_user');
  const [authorOptions, setAuthorOptions] = useState<{ value: string; label: string }[]>([]);

  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    summary: '',
    content: '',
    category: 'tech',
    author: 'current_user',
    publishDate: new Date(),
    imageSource: { thumbnail: '', medium: '', large: '', original: '' },
    tags: [],
    originalUrl: '',
    isPublished: false,
    isMainFeatured: false,
    thumbnailPath: '',
    mediumPath: '',
    largePath: '',
    originalPath: ''
  });

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const token = getToken();
        if (!token) return;
  
        const response = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        console.log("작성자 raw 데이터:", data.users);
  
        const filtered = data.users.filter(
          (u: any) => u.role === 'admin' || u.role === 'editor'
        );
  
        const getRoleDisplayName = (role: string): string => {
          switch (role) {
            case 'admin': return '관리자';
            case 'editor': return '편집자';
            case 'viewer': return '조회자';
            default: return role;
          }
        };
  
        const options = filtered.map((u: any) => ({
          value: u.id,
          label: `${u.username} (${getRoleDisplayName(u.role)})`
        }));
  
        setAuthorOptions(options);
      } catch (e) {
        console.error('작성자 목록 불러오기 실패:', e);
      }
    };
    fetchAuthors();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];
    if (!formData.title) newErrors.push({ field: 'title', message: '제목을 입력해주세요.' });
    if (!formData.content) newErrors.push({ field: 'content', message: '내용을 입력해주세요.' });
    if (!(formData.thumbnailPath || formData.originalPath || formData.imageSource?.thumbnail)) {
      newErrors.push({ field: 'image', message: '대표 이미지를 업로드해주세요.' });
    }
    if (formData.originalUrl && !/^https?:\/\/.+/.test(formData.originalUrl)) {
      newErrors.push({ field: 'originalUrl', message: '올바른 URL 형식이 아닙니다.' });
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      toast({ title: "입력 오류", description: "필수 정보를 입력해주세요.", variant: "destructive" });
      return;
    }

    const token = getToken();
    if (!token) {
      toast({ title: "인증 오류", description: "로그인이 필요합니다.", variant: "destructive" });
      router.push('/admin/login');
      return;
    }

    const imageSource = {
      thumbnail: formData.thumbnailPath || formData.imageSource.thumbnail || '',
      medium: formData.mediumPath || formData.imageSource.medium || '',
      large: formData.largePath || formData.imageSource.large || '',
      original: formData.originalPath || formData.imageSource.original || ''
    };

    try {
      const response = await fetch('/api/posts/news', {
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
      if (!response.ok) throw new Error(data.message || '생성 실패');

      toast({ title: "성공", description: "뉴스가 생성되었습니다." });
      router.push('/admin/news');
    } catch (error: any) {
      toast({ title: "생성 실패", description: error.message || "알 수 없는 오류", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorChange = (authorId: string) => {
    setSelectedAuthor(authorId);
    setFormData(prev => ({ ...prev, author: authorId }));
  };

  const handleTagChange = (e: TagifyEvent) => {
    const tags = e.detail.tagify.value.map(tag => tag.value);
    setFormData(prev => ({ ...prev, tags }));
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
        handleBackClick={() => router.push('/admin/news')}
        contentType="news"
        isEditMode={false}
        categories={NEWS_CATEGORIES}
        authorOptions={authorOptions}
      />
    </div>
  );
}
