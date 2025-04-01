"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TinyEditor } from '@/components/editor/tiny-editor';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthorSelect } from '@/components/forms/author-select';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  imageSource?: string;
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
      <span className="ml-2 text-lg">뉴스 데이터를 불러오는 중...</span>
    </div>
  );
}

// 폼 컴포넌트
function NewsEditForm({
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
      <h1 className="text-2xl font-bold mb-6">뉴스 수정</h1>
      
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

/**
 * 작성자 이름을 가져오는 함수
 */
function getAuthorName(author: any): string {
  if (!author) return '미지정';
  
  if (typeof author === 'string') {
    return author;
  }
  
  if (typeof author === 'object') {
    if (author.name) return author.name;
    if (author._id) return author._id;
  }
  
  return '미지정';
}

/**
 * 작성자 부서를 가져오는 함수
 */
function getAuthorDepartment(author: any): DepartmentType {
  if (!author) return 'other';
  
  if (typeof author === 'object' && author.department) {
    // 부서명이 DepartmentType에 있는지 확인
    const dept = author.department as string;
    const isValidDept = DEPARTMENTS.some(d => d.value === dept);
    return isValidDept ? (dept as DepartmentType) : 'other';
  }
  
  return 'other';
}

export default function EditNewsPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('current_user');
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  // 데이터 로드
  useEffect(() => {
    async function loadNewsData(): Promise<void> {
      if (!newsId) return;
      
      setIsLoading(true);
      try {
        // 기본 헤더
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // localStorage에서 토큰 가져오기 (있는 경우에만)
        const token = getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/posts/news/${newsId}`, { headers });
        
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
        
        // 부서 정보 확인
        const authorDepartment = getAuthorDepartment(post.author);
        
        // 폼 데이터 설정
        setFormData({
          title: post.title?.ko || '',
          summary: post.summary?.ko || '',
          content: post.content?.ko || '',
          category: (post.category as CategoryType) || 'tech',
          author: authorId,
          publishDate: post.publishDate ? new Date(post.publishDate) : new Date(),
          imageSource: post.imageSource || '',
          authorDepartment: authorDepartment,
          tags: post.tags || [],
          originalUrl: post.originalUrl || '',
          isPublished: post.isPublished || false,
          isMainFeatured: post.isMainFeatured || false
        });
        
        setErrorMessage('');
      } catch (error) {
        console.error('뉴스 로딩 오류:', error);
        setErrorMessage('뉴스 데이터를 불러오는데 실패했습니다.');
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
  }, [newsId, toast]);

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
      // 백엔드에 맞게 데이터 형식 변환
      const apiData = {
        title: { ko: formData.title },
        summary: { ko: formData.summary },
        content: { ko: formData.content },
        category: formData.category,
        author: selectedAuthor !== 'current_user' ? selectedAuthor : '',
        publishDate: formData.publishDate,
        imageSource: formData.imageSource,
        authorDepartment: formData.authorDepartment,
        tags: formData.tags,
        originalUrl: formData.originalUrl,
        isPublished: formData.isPublished,
        isMainFeatured: formData.isMainFeatured
      };
      
      console.log('[디버그] 뉴스 수정 요청 데이터:', apiData);
      
      // 인증 토큰 가져오기
      const token = getToken();
      
      if (!token) {
        throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');
      }
      
      // API 요청 보내기
      const response = await fetch(`/api/posts/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || '뉴스 업데이트에 실패했습니다.');
      }
      
      const result = await response.json();
      console.log('[디버그] 뉴스 수정 결과:', result);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      toast({
        title: "저장 성공",
        description: "뉴스 내용이 성공적으로 저장되었습니다.",
      });
      
      // 성공 후 목록 페이지로 이동
      router.push('/admin/news');
    } catch (error: unknown) {
      console.error('뉴스 저장 오류:', error);
      const errorMsg = error instanceof Error ? error.message : '뉴스 저장 중 오류가 발생했습니다.';
      setErrorMessage(errorMsg);
      
      toast({
        title: "저장 실패",
        description: errorMsg,
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {showSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">저장 완료</AlertTitle>
          <AlertDescription className="text-green-700">
            뉴스 내용이 성공적으로 저장되었습니다.
          </AlertDescription>
        </Alert>
      )}
      
      <NewsEditForm
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