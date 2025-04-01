"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TinyEditor } from '@/components/editor/tiny-editor';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthorSelect } from '@/components/forms/author-select';
import { AlertCircle, ArrowLeft, Check, Loader2 } from 'lucide-react';
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

// ESG 카테고리 목록
const CATEGORIES = [
  { value: 'environment', label: '환경' },
  { value: 'social', label: '사회' },
  { value: 'governance', label: '지배구조' },
  { value: 'sustainability', label: '지속가능성' },
  { value: 'report', label: '보고서' },
  { value: 'other', label: '기타' }
] as const;

type CategoryType = typeof CATEGORIES[number]['value'];

// 부서 목록
const DEPARTMENTS = [
  { value: 'management', label: '경영진' },
  { value: 'esg_team', label: 'ESG팀' },
  { value: 'sustainability', label: '지속가능경영팀' },
  { value: 'csr', label: '사회공헌팀' },
  { value: 'strategy', label: '전략기획' },
  { value: 'other', label: '기타' }
] as const;

type DepartmentType = typeof DEPARTMENTS[number]['value'];

interface ESGFormData {
  title: string;
  summary: string;
  content: string;
  category: CategoryType;
  author: string;
  publishDate: Date;
  thumbnailUrl: string;
  authorDepartment: DepartmentType;
  tags: string[];
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
  imageSource?: string;
  isPublished?: boolean;
  isMainFeatured?: boolean;
  tags?: string[];
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

// 폼 컴포넌트
function ESGEditForm({
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
  formData: ESGFormData;
  setFormData: React.Dispatch<React.SetStateAction<ESGFormData>>;
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
    placeholder: "예: 환경, 사회공헌, 지배구조",
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
          <h1 className="text-2xl font-bold">ESG 콘텐츠 수정</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                변경사항 저장
              </>
            )}
          </Button>
        </div>
      </div>
      
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ESG 콘텐츠 제목을 입력하세요"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
              요약 <span className="text-red-500">*</span>
            </label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="내용을 간략하게 요약해 주세요"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              내용 <span className="text-red-500">*</span>
            </label>
            <TinyEditor
              value={formData.content}
              onChange={(content: string) => setFormData({ ...formData, content })}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              태그
            </label>
            <TagifyComponent
              settings={tagifySettings}
              onChange={handleTagChange}
              value={formData.tags}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              내용과 관련된 키워드를 입력하세요 (최대 10개). 쉼표로 구분됩니다.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as CategoryType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
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
              작성자 <span className="text-red-500">*</span>
            </label>
            <AuthorSelect 
              value={selectedAuthor} 
              onChange={handleAuthorChange}
            />
          </div>

          <div>
            <label htmlFor="authorDepartment" className="block text-sm font-medium text-gray-700 mb-1">
              부서
            </label>
            <Select
              value={formData.authorDepartment}
              onValueChange={(value) => setFormData({ ...formData, authorDepartment: value as DepartmentType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((department) => (
                  <SelectItem key={department.value} value={department.value}>
                    {department.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
              발행일 <span className="text-red-500">*</span>
            </label>
            <DatePicker
              date={formData.publishDate || new Date()}
              setDate={(date) => setFormData({ ...formData, publishDate: date as Date })}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-1">
              대표 이미지
            </label>
            <FileUpload
              onUploadComplete={(url) => setFormData({ ...formData, thumbnailUrl: url })}
              currentImage={formData.thumbnailUrl}
              variant="image"
              label="대표 이미지 업로드"
              description="ESG 포스트의 대표 이미지를 업로드하세요."
            />
            <p className="text-xs text-gray-500 mt-1">
              권장 크기: 800x600px, 최대 2MB
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isPublished: checked === true })
              }
            />
            <label
              htmlFor="isPublished"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              콘텐츠 발행하기
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMainFeatured"
              checked={formData.isMainFeatured}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isMainFeatured: checked === true })
              }
            />
            <label
              htmlFor="isMainFeatured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              메인 페이지에 노출하기
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function EditESGPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');

  // 폼 데이터 초기 상태
  const [formData, setFormData] = useState<ESGFormData>({
    title: '',
    summary: '',
    content: '',
    category: 'environment',
    author: '',
    publishDate: new Date(),
    thumbnailUrl: '',
    authorDepartment: 'esg_team',
    tags: [],
    isPublished: false,
    isMainFeatured: false
  });

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

        setFormData({
          title: post.title?.ko || '',
          summary: post.summary?.ko || '',
          content: post.content?.ko || '',
          category: (post.category as CategoryType) || 'environment',
          author: authorId,
          publishDate: post.publishDate ? new Date(post.publishDate) : new Date(),
          thumbnailUrl: post.thumbnailUrl || '',
          authorDepartment: (post.author?.department as DepartmentType) || 'esg_team',
          tags: post.tags || [],
          isPublished: post.isPublished || false,
          isMainFeatured: post.isMainFeatured || false
        });
      } catch (error) {
        console.error('ESG 데이터 로드 오류:', error);
        toast({
          title: "데이터 로드 오류",
          description: `데이터를 불러오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadESGData();
  }, [id, router, toast]);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // 필수 항목 검증
    const newErrors: FormError[] = [];
    
    if (!formData.title) {
      newErrors.push({ field: 'title', message: '제목을 입력해주세요.' });
    }
    
    if (!formData.content) {
      newErrors.push({ field: 'content', message: '내용을 입력해주세요.' });
    }
    
    if (!formData.category) {
      newErrors.push({ field: 'category', message: '카테고리를 선택해주세요.' });
    }
    
    // 오류가 있으면 처리 중단
    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast({
        title: "필수 정보 누락",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setErrors([]);
    
    try {
      const token = getToken();
      if (!token) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      // 다국어 제목, 요약, 내용 구성
      const postData = {
        title: {
          ko: formData.title,
          en: formData.title // 영문 버전은 한글과 동일하게 설정 (나중에 필요시 변경)
        },
        summary: {
          ko: formData.summary,
          en: formData.summary
        },
        content: {
          ko: formData.content,
          en: formData.content
        },
        category: formData.category,
        publishDate: formData.publishDate,
        thumbnailUrl: formData.thumbnailUrl,
        imageSource: formData.thumbnailUrl,
        isPublished: formData.isPublished,
        isMainFeatured: formData.isMainFeatured,
        tags: formData.tags,
        author: selectedAuthor, // 선택된 작성자 ID
        authorDepartment: formData.authorDepartment
      };
      
      console.log('ESG 업데이트 데이터:', postData);

      const response = await fetch(`/api/posts/esg/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '업데이트 중 오류가 발생했습니다.');
      }

      toast({
        title: "업데이트 완료",
        description: "ESG 콘텐츠가 성공적으로 업데이트되었습니다.",
      });
      
      // 저장 후 목록 페이지로 이동
      setTimeout(() => {
        router.push('/admin/esg');
      }, 1000);
    } catch (error) {
      console.error('ESG 업데이트 오류:', error);
      toast({
        title: "업데이트 오류",
        description: `업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive"
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
    <div className="min-h-screen bg-gray-50 py-8">
      <ESGEditForm
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