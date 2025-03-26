"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TinyEditor } from '@/components/editor/tiny-editor';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthorSelect } from '@/components/forms/author-select';
import { ESGCategory, AuthorDepartment } from '@/types/esg';
import { AlertCircle, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Switch } from "@/components/ui/switch";
import dynamic from 'next/dynamic';

// Tagify 컴포넌트 동적 임포트
const TagifyComponent = dynamic(() => 
  import('@yaireo/tagify/dist/react.tagify').then((mod) => mod.default), 
  { ssr: false }
);

// CSS 클라이언트 사이드에서만 로드
const TagifyCss = () => {
  useEffect(() => {
    import('@yaireo/tagify/dist/tagify.css');
  }, []);
  return null;
};

interface Author {
  name: string;
  department: string;
}

interface IFormData {
  title: { ko: string };
  summary: { ko: string };
  content: { ko: string };
  category: string;
  author: {
    name: string;
    department: string;
  };
  publishDate: string;
  imageSource: string;
  tags: string[];
  isPublished: boolean;
  isMainFeatured: boolean;
  originalUrl?: string;
}

interface FormError {
  field: string;
  message: string;
}

// 토큰을 가져오는 함수
function getToken() {
  // 직접 localStorage에서 시도
  const directToken = localStorage.getItem('accessToken');
  if (directToken) return directToken;
  
  // 세션 유틸리티에서 시도
  try {
    const sessionStr = localStorage.getItem('echoit_auth_token');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.accessToken) return session.accessToken;
    }
  } catch (e) {
    console.error('세션 파싱 오류:', e);
  }
  
  return null;
}

export default function EditESGPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');

  const [formData, setFormData] = useState<IFormData>({
    title: { ko: '' },
    summary: { ko: '' },
    content: { ko: '' },
    category: '',
    author: {
      name: '',
      department: ''
    },
    publishDate: new Date().toISOString(),
    imageSource: '',
    tags: [],
    isPublished: true,
    isMainFeatured: false,
    originalUrl: ''
  });

  // ESG 데이터 불러오기
  useEffect(() => {
    const fetchESGPost = async () => {
      try {
        console.log('[디버그] ESG 데이터 불러오기 시작:', params.id);
        
        // 기본 헤더
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // localStorage에서 토큰 가져오기 (있는 경우에만)
        const token = getToken();
        if (token) {
          console.log('[디버그] 토큰 존재함:', token.substring(0, 10) + '...');
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.log('[디버그] 경고: 토큰이 없습니다. API 호출이 실패할 수 있습니다.');
        }
        
        const response = await fetch(`/api/posts/esg/${params.id}`, {
          headers
        });
        
        console.log(`[디버그] API 응답 상태: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          }
          throw new Error('ESG 데이터를 불러올 수 없습니다.');
        }
        
        const data = await response.json();
        console.log('[디버그] API 응답 데이터:', data);
        
        if (data.success && data.post) {
          // API에서 받은 데이터로 폼 초기화
          const post = data.post;
          setFormData({
            title: post.title || { ko: '' },
            summary: post.summary || { ko: '' },
            content: post.content || { ko: '' },
            category: post.category || '',
            author: post.author || { name: '', department: '' },
            publishDate: post.publishDate || new Date().toISOString(),
            imageSource: post.imageSource || '',
            tags: post.tags || [],
            isPublished: post.isPublished !== undefined ? post.isPublished : true,
            isMainFeatured: post.isMainFeatured !== undefined ? post.isMainFeatured : false,
            originalUrl: post.originalUrl || ''
          });
          
          // 작성자 ID가 있다면 설정
          if (post.author?._id) {
            setSelectedAuthor(post.author._id);
          }
        } else {
          throw new Error('ESG 데이터를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('[디버그] ESG 불러오기 오류:', error);
        toast({
          variant: 'destructive',
          title: '데이터 로딩 오류',
          description: '게시물 데이터를 불러오는데 실패했습니다.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchESGPost();
  }, [params.id, toast]);

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: FormError[] = [];

    if (!formData.title.ko) {
      newErrors.push({ field: 'title', message: '제목을 입력해주세요.' });
    }
    if (!formData.content.ko) {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      console.log('[디버그] ESG 수정 요청 시작');
      
      // 기본 헤더
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // localStorage에서 토큰 가져오기 (있는 경우에만)
      const token = getToken();
      if (token) {
        console.log('[디버그] 토큰 존재함:', token.substring(0, 10) + '...');
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('[디버그] 경고: 토큰이 없습니다. API 호출이 실패할 수 있습니다.');
      }
      
      // 작성자 정보가 ID 형태인 경우 처리
      const apiData = { ...formData };
      if (selectedAuthor && selectedAuthor !== 'current_user') {
        apiData.author = selectedAuthor;
      }
      
      console.log('[디버그] API 요청 데이터:', apiData);
      
      const response = await fetch(`/api/posts/esg/${params.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(apiData),
      });

      console.log(`[디버그] API 응답 상태: ${response.status} ${response.statusText}`);
      
      const responseData = await response.json();
      console.log('[디버그] API 응답 데이터:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'ESG 포스트 수정에 실패했습니다.');
      }

      toast({
        title: '성공',
        description: 'ESG 포스트가 성공적으로 수정되었습니다.'
      });

      router.push('/admin/esg');
    } catch (error) {
      console.error('[디버그] ESG 포스트 수정 오류:', error);
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: error instanceof Error ? error.message : 'ESG 포스트 수정 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title' || name === 'summary') {
      setFormData(prev => {
        const updatedData = { ...prev };
        if (name === 'title') {
          updatedData.title = { ko: value };
        } else if (name === 'summary') {
          updatedData.summary = { ko: value };
        }
        return updatedData;
      });
    } else if (name === 'originalUrl') {
      setFormData(prev => ({
        ...prev,
        originalUrl: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, ko: content }
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleAuthorChange = (authorId: string) => {
    setSelectedAuthor(authorId);
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageSource: url
    }));
  };

  const handleTagChange = (e: any) => {
    const tags = e.detail.tagify.value.map((tag: any) => tag.value);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleVisibilityChange = (isPublished: boolean) => {
    setFormData(prev => ({
      ...prev,
      isPublished
    }));
  };

  const handleMainVisibilityChange = (isMainFeatured: boolean) => {
    setFormData(prev => ({
      ...prev,
      isMainFeatured
    }));
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-500">ESG 데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // ESG를 찾을 수 없음
  if (notFound) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                ESG 게시물을 찾을 수 없습니다
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                요청한 ESG 포스트를 찾을 수 없습니다. 삭제되었거나 잘못된 ID일 수 있습니다.
              </p>
              <div className="mt-4">
                <Link href="/admin/esg" className="text-sm font-medium text-yellow-800 hover:text-yellow-900">
                  ESG 목록으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 카테고리 목록
  const categories = Object.entries(ESGCategory).map(([key, value]) => ({
    value,
    label: (() => {
      switch (value) {
        case 'environment': return '환경';
        case 'social': return '사회';
        case 'governance': return '지배구조';
        case 'esg_management': return 'ESG 경영';
        case 'sustainability': return '지속가능성';
        case 'csr': return '사회공헌';
        case 'other': return '기타';
        default: return key;
      }
    })()
  }));

  const tagifySettings = {
    maxTags: 10,
    placeholder: "예: ESG, 지속가능경영, 탄소중립",
    delimiters: ",",
    dropdown: {
      enabled: 0
    },
    originalInputValueFormat: (valuesArr: any) => valuesArr.map((item: any) => item.value).join(',')
  };

  return (
    <div className="container mx-auto p-6">
      <TagifyCss />
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/esg" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">ESG 포스트 수정</h1>
        </div>
      </div>
      
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title.ko}
                onChange={handleInputChange}
                placeholder="ESG 제목을 입력하세요"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                요약
              </label>
              <Input
                id="summary"
                name="summary"
                value={formData.summary.ko}
                onChange={handleInputChange}
                placeholder="ESG 요약을 입력하세요"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                원본 URL
              </label>
              <Input
                id="originalUrl"
                name="originalUrl"
                value={formData.originalUrl || ""}
                onChange={handleInputChange}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                내용 <span className="text-red-500">*</span>
              </label>
              <TinyEditor 
                initialValue={formData.content.ko}
                onChange={handleContentChange}
                height={400}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                대표 이미지 <span className="text-red-500">*</span>
              </label>
              <FileUpload
                onUploadComplete={handleImageUpload}
                accept="image/*"
                variant="image"
                currentImage={formData.imageSource}
              />
              {errors.some(e => e.field === 'image') && (
                <p className="text-sm text-red-500 mt-1">대표 이미지를 업로드해주세요.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                작성자
              </label>
              <AuthorSelect
                value={selectedAuthor}
                onChange={handleAuthorChange}
                required={false}
              />
              <p className="text-xs text-gray-500 mt-1">작성자를 변경할 수 있습니다.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                태그 (최대 10개, 쉼표로 구분)
              </label>
              {typeof window !== 'undefined' && (
                <TagifyComponent
                  value={formData.tags}
                  settings={tagifySettings}
                  onChange={handleTagChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              )}
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-medium text-gray-700">게시 옵션</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium text-gray-900">메인 노출</h4>
                  <p className="text-xs text-gray-500">메인 페이지에 이 포스트를 노출합니다.</p>
                </div>
                <Switch
                  checked={formData.isMainFeatured}
                  onCheckedChange={handleMainVisibilityChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/esg')}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </form>
    </div>
  );
} 