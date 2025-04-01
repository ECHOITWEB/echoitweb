"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TinyEditor } from '@/components/editor/tiny-editor';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthorSelect } from '@/components/forms/author-select';
import { AlertCircle, Check, Loader2, ArrowLeft } from 'lucide-react';
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

// 토큰 갱신 함수
const refreshToken = async () => {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('echoit_auth_token', JSON.stringify(data));
        }
        return data.accessToken;
      }
    }
    return null;
  } catch (error) {
    console.error('토큰 갱신 중 오류:', error);
    return null;
  }
};

// 로딩 컴포넌트
function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-lg">뉴스 데이터를 불러오는 중...</span>
    </div>
  );
}

// AuthorSelect 컴포넌트 props 타입 정의
interface AuthorSelectProps {
  value: string;
  onChange: (value: string) => void;
}

// TinyEditor 컴포넌트 props 타입 정의
interface TinyEditorProps {
  value: string;
  onChange: (content: string) => void;
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
  handleTagChange,
  handleBackClick
}: {
  formData: NewsFormData;
  setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  errors: FormError[];
  selectedAuthor: string;
  handleAuthorChange: (authorId: string) => void;
  handleTagChange: (e: TagifyEvent) => void;
  handleBackClick: () => void;
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <TagifyCss />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            className="mr-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            뒤로
          </Button>
          <h1 className="text-2xl font-bold">뉴스 콘텐츠 수정</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                저장하기
              </>
            )}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="뉴스 제목을 입력하세요"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            요약
          </label>
          <Input
            type="text"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="뉴스 요약을 입력하세요"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <Select
            value={formData.category}
            onValueChange={(value: CategoryType) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            작성자
          </label>
          <AuthorSelect
            value={selectedAuthor}
            onChange={handleAuthorChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            발행일
          </label>
          <DatePicker
            date={formData.publishDate || new Date()}
            setDate={(date) => setFormData({ ...formData, publishDate: date || new Date() })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            태그
          </label>
          <TagifyComponent
            settings={tagifySettings}
            value={formData.tags}
            onChange={handleTagChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이미지 URL
          </label>
          <Input
            type="text"
            value={formData.imageSource}
            onChange={(e) => setFormData({ ...formData, imageSource: e.target.value })}
            placeholder="이미지 URL을 입력하세요"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            원본 URL
          </label>
          <Input
            type="text"
            value={formData.originalUrl}
            onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
            placeholder="원본 URL을 입력하세요"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            본문
          </label>
          <TinyEditor
            value={formData.content}
            onChange={(content: string) => setFormData({ ...formData, content })}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
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
              발행하기
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
              메인 노출
            </label>
          </div>
        </div>
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
    
    try {
      setIsSubmitting(true);
      setErrors([]);

      // 토큰 가져오기
      const token = getToken();
      if (!token) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      // API 요청 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // API 요청
      const response = await fetch(`/api/posts/news/${params.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: { ko: formData.title },
          summary: { ko: formData.summary },
          content: { ko: formData.content },
          category: formData.category,
          author: formData.author,
          publishDate: formData.publishDate,
          imageSource: formData.imageSource,
          tags: formData.tags,
          originalUrl: formData.originalUrl,
          isPublished: formData.isPublished,
          isMainFeatured: formData.isMainFeatured
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // 토큰 갱신 시도
          const newToken = await refreshToken();
          if (newToken) {
            // 새 토큰으로 재시도
            const retryResponse = await fetch(`/api/posts/news/${params.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              },
              body: JSON.stringify({
                title: { ko: formData.title },
                summary: { ko: formData.summary },
                content: { ko: formData.content },
                category: formData.category,
                author: formData.author,
                publishDate: formData.publishDate,
                imageSource: formData.imageSource,
                tags: formData.tags,
                originalUrl: formData.originalUrl,
                isPublished: formData.isPublished,
                isMainFeatured: formData.isMainFeatured
              })
            });

            if (retryResponse.ok) {
              toast({
                title: "성공",
                description: "뉴스가 성공적으로 수정되었습니다.",
              });
              router.push('/admin/news');
              return;
            }
          }
        }

        // 에러 처리
        const message = errorData.message || '저장 중 오류가 발생했습니다.';
        toast({
          title: "오류",
          description: message,
          variant: "destructive",
        });
        return;
      }

      // 성공
      toast({
        title: "성공",
        description: "뉴스가 성공적으로 수정되었습니다.",
      });
      router.push('/admin/news');
    } catch (error) {
      console.error('뉴스 수정 중 오류:', error);
      toast({
        title: "오류",
        description: "뉴스 수정 중 오류가 발생했습니다.",
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
    router.back();
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
        handleBackClick={handleBackClick}
      />
    </div>
  );
} 