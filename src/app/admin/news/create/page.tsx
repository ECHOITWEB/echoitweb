"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TinyEditor } from '@/components/editor/tiny-editor';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthorSelect } from '@/components/forms/author-select';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';

// Tagify 컴포넌트 동적 임포트
const TagifyComponent = dynamic(() => 
  import('@yaireo/tagify/dist/react.tagify').then((mod) => mod.default), 
  { ssr: false }
);

// CSS 클라이언트 사이드에서만 로드
const TagifyCss = (): null => {
  useEffect(() => {
    import('@yaireo/tagify/dist/tagify.css');
  }, []);
  return null;
};

// 뉴스 카테고리 목록
const CATEGORIES = [
  { value: 'tech', label: '기술' },
  { value: 'industry', label: '산업' },
  { value: 'company', label: '기업' },
  { value: 'finance', label: '금융' },
  { value: 'policy', label: '정책' },
  { value: 'event', label: '이벤트' },
  { value: 'other', label: '기타' }
] as const;

type CategoryType = typeof CATEGORIES[number]['value'];

// 부서 목록
const DEPARTMENTS = [
  { value: 'tech_team', label: '기술팀' },
  { value: 'management', label: '경영진' },
  { value: 'marketing', label: '마케팅' },
  { value: 'sales', label: '영업' },
  { value: 'hr', label: '인사' },
  { value: 'operation', label: '운영' },
  { value: 'other', label: '기타' }
] as const;

type DepartmentType = typeof DEPARTMENTS[number]['value'];

interface NewsFormData {
  title: string;
  summary: string;
  content: string;
  category: CategoryType;
  author: string;
  publishDate: Date;
  imageSource: string;
  authorDepartment: DepartmentType;
  tags: string[];
  originalUrl: string;
  isPublished: boolean;
  isMainFeatured: boolean;
}

interface FormError {
  field: string;
  message: string;
}

interface TagifyEvent {
  detail: {
    tagify: {
      value: Array<{
        value: string;
        [key: string]: unknown;
      }>;
    };
  };
}

interface ApiData {
  title: { ko: string };
  summary: { ko: string };
  content: { ko: string };
  category: string;
  author: string;
  publishDate: Date;
  imageSource: string;
  authorDepartment: string;
  tags: string[];
  originalUrl: string;
  isPublished: boolean;
  isMainFeatured: boolean;
}

interface DecodedToken {
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}

// 로딩 스피너 컴포넌트
function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      <span className="ml-2">로딩 중...</span>
    </div>
  );
}

// 폼 컴포넌트
function NewsCreateForm({
  formData,
  setFormData,
  handleSubmit,
  isSubmitting,
  errors,
  selectedAuthor,
  handleAuthorChange,
  handleTagChange
}: {
  formData: NewsFormData;
  setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  errors: FormError[];
  selectedAuthor: string;
  handleAuthorChange: (authorId: string) => void;
  handleTagChange: (e: TagifyEvent) => void;
}): JSX.Element {
  // Tagify 설정
  const tagifySettings = {
    maxTags: 10,
    placeholder: "예: AI, 블록체인, 핀테크",
    delimiters: ",",
    dropdown: {
      enabled: 0
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TagifyCss />
      <h1 className="text-2xl font-bold mb-6">뉴스 작성</h1>
      
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                입력 오류가 있습니다
              </h3>
              <ul className="mt-2 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">제목</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="제목을 입력하세요"
          required
          className={errors.some(e => e.field === 'title') ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">카테고리</label>
        <Select
          value={formData.category}
          onValueChange={(category) => setFormData({ ...formData, category: category as CategoryType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">요약</label>
        <Input
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="요약을 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">태그 (최대 10개, 쉼표로 구분)</label>
        <TagifyComponent
          value={formData.tags}
          settings={tagifySettings}
          onChange={handleTagChange}
          className="tagify-custom"
        />
        <p className="mt-1 text-sm text-gray-500">
          현재 {formData.tags.length}/10개 태그가 입력되었습니다.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">대표 이미지</label>
        <FileUpload
          onUploadComplete={(url) => setFormData({ ...formData, imageSource: url })}
          accept="image/*"
          variant="image"
          currentImage={formData.imageSource}
        />
        {errors.some(e => e.field === 'image') && (
          <p className="text-sm text-red-500 mt-1">대표 이미지를 업로드해주세요.</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">원본 URL</label>
        <Input
          value={formData.originalUrl}
          onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
          placeholder="https://example.com"
          className={errors.some(e => e.field === 'originalUrl') ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500 mt-1">
          원본 출처가 있는 경우 URL을 입력하세요. (선택사항)
        </p>
        {errors.some(e => e.field === 'originalUrl') && (
          <p className="text-sm text-red-500 mt-1">올바른 URL 형식이 아닙니다. (예: https://example.com)</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">작성자</label>
        <AuthorSelect 
          value={selectedAuthor} 
          onChange={handleAuthorChange} 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">부서</label>
        <Select
          value={formData.authorDepartment}
          onValueChange={(department) => setFormData({ ...formData, authorDepartment: department as DepartmentType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="부서 선택" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">게시일</label>
        <DatePicker
          date={formData.publishDate}
          setDate={(date: Date | undefined) => date && setFormData({ ...formData, publishDate: date })}
        />
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id="isPublished"
          checked={formData.isPublished}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, isPublished: checked as boolean })
          }
        />
        <label
          htmlFor="isPublished"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          바로 게시하기
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isMainFeatured"
          checked={formData.isMainFeatured}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, isMainFeatured: checked as boolean })
          }
        />
        <label
          htmlFor="isMainFeatured"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          주요 뉴스로 설정
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">내용</label>
        <TinyEditor
          value={formData.content}
          onChange={(content: string) => setFormData({ ...formData, content })}
        />
        {errors.some(e => e.field === 'content') && (
          <p className="text-sm text-red-500 mt-1">내용을 입력해주세요.</p>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </form>
  );
}

export default function CreateNewsPage(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('current_user');

  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    summary: '',
    content: '',
    category: 'tech',
    author: 'current_user',
    publishDate: new Date(),
    imageSource: '',
    authorDepartment: 'tech_team',
    tags: [],
    originalUrl: '',
    isPublished: true,
    isMainFeatured: false
  });

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!formData.title) {
      newErrors.push({ field: 'title', message: '제목을 입력해주세요.' });
    }
    if (!formData.content) {
      newErrors.push({ field: 'content', message: '내용을 입력해주세요.' });
    }
    if (!formData.imageSource) {
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

    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: '입력 오류',
        description: '필수 항목을 모두 입력해주세요.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 작성자 정보 처리
      let authorData = selectedAuthor;
      
      // 기본값이 'current_user'인 경우 공백으로 설정하여 API가 현재 사용자를 사용하도록 함
      if (selectedAuthor === 'current_user') {
        authorData = '';
      }
      
      console.log('선택된 작성자:', selectedAuthor);
      
      // 백엔드에 맞게 데이터 형식 변환
      const apiData: ApiData = {
        ...formData,
        title: { ko: formData.title },
        summary: { ko: formData.summary },
        content: { ko: formData.content },
        author: authorData  // 작성자 ID 설정
      };
      
      console.log('제출하는 데이터:', apiData);
      
      // 인증 토큰 가져오기
      const token = getToken();
      
      if (!token) {
        throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      // API 요청 보내기
      const response = await fetch('/api/posts/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData),
      });

      // 자세한 응답 로깅
      const responseText = await response.text();
      let responseData: Record<string, unknown>;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('응답을 JSON으로 파싱할 수 없습니다:', responseText);
        responseData = { error: '서버 응답을 처리할 수 없습니다' };
      }
      
      console.log('API 응답 상태:', response.status, response.statusText);
      console.log('API 응답 내용:', responseData);

      if (!response.ok) {
        throw new Error((responseData.error as string) || 
                        (responseData.message as string) || 
                        '뉴스 포스트 생성에 실패했습니다.');
      }

      toast({
        title: '성공',
        description: '뉴스 포스트가 성공적으로 생성되었습니다.'
      });

      router.push('/admin/news');
    } catch (error) {
      console.error('뉴스 포스트 생성 오류:', error);
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: error instanceof Error ? error.message : '뉴스 포스트 생성 중 오류가 발생했습니다.'
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

  // 토큰 가져오기 함수
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('echoit_auth_token');
    if (!session) return null;
    
    try {
      const sessionData = JSON.parse(session);
      return sessionData.accessToken || null;
    } catch (e) {
      console.error('세션 파싱 오류:', e);
      return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <NewsCreateForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errors={errors}
        selectedAuthor={selectedAuthor}
        handleAuthorChange={handleAuthorChange}
        handleTagChange={handleTagChange}
      />
    </div>
  );
}
