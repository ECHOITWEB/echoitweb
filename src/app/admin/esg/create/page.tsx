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
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  department: AuthorDepartment;
}

interface IFormData {
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishDate: Date;
  imageSource: string;
  tags: string[];
  originalUrl: string;
}

interface FormError {
  field: string;
  message: string;
}

export default function CreateESGPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState('current_user');

  const [formData, setFormData] = useState<IFormData>({
    title: '',
    summary: '',
    content: '',
    category: 'environment',
    author: 'current_user',
    publishDate: new Date(),
    imageSource: '',
    tags: [],
    originalUrl: ''
  });

  const validateForm = () => {
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
      // 작성자 정보 처리
      let authorData = selectedAuthor;
      
      // 기본값이 'current_user'인 경우 공백으로 설정하여 API가 현재 사용자를 사용하도록 함
      if (selectedAuthor === 'current_user') {
        authorData = '';
      }
      
      console.log('선택된 작성자:', selectedAuthor);
      
      // 백엔드에 맞게 데이터 형식 변환
      const apiData = {
        ...formData,
        title: { ko: formData.title },
        summary: { ko: formData.summary },
        content: { ko: formData.content },
        author: authorData  // 작성자 ID 설정
      };
      
      console.log('제출하는 데이터:', apiData);
      
      // 인증 토큰 가져오기
      const session = localStorage.getItem('echoit_auth_token');
      let accessToken = '';
      let decodedToken = null;
      
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          accessToken = sessionData.accessToken;
          
          // 토큰 디코딩 시도 (base64 디코딩)
          if (accessToken) {
            const tokenParts = accessToken.split('.');
            if (tokenParts.length === 3) {
              const payload = tokenParts[1];
              const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
              const decodedPayload = atob(base64);
              decodedToken = JSON.parse(decodedPayload);
              console.log('디코딩된 토큰 페이로드:', decodedToken);
              console.log('사용자 역할:', decodedToken.role, decodedToken.roles);
            }
          }
          
          console.log('인증 토큰 확인:', accessToken ? '존재함' : '없음');
        } catch (e) {
          console.error('세션 파싱 오류:', e);
        }
      }
      
      // API 요청 보내기
      console.log('API 요청 헤더:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      });
      
      const response = await fetch('/api/posts/esg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(apiData),
      });

      // 자세한 응답 로깅
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('응답을 JSON으로 파싱할 수 없습니다:', responseText);
        responseData = { error: '서버 응답을 처리할 수 없습니다' };
      }
      
      console.log('API 응답 상태:', response.status, response.statusText);
      console.log('API 응답 내용:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'ESG 포스트 생성에 실패했습니다.');
      }

      toast({
        title: '성공',
        description: 'ESG 포스트가 성공적으로 생성되었습니다.'
      });

      router.push('/admin/esg');
    } catch (error) {
      console.error('ESG 포스트 생성 오류:', error);
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: error instanceof Error ? error.message : 'ESG 포스트 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorChange = (authorId: string) => {
    setSelectedAuthor(authorId);
    setFormData(prev => ({
      ...prev,
      author: authorId
    }));
  };

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
    }
  };

  const handleTagChange = (e: any) => {
    const tags = e.detail.tagify.value.map((tag: any) => tag.value);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <TagifyCss />
      <h1 className="text-2xl font-bold mb-6">ESG 포스트 작성</h1>
      
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
            onValueChange={(category) => setFormData({ ...formData, category })}
          >
            <SelectTrigger>
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
          {typeof window !== 'undefined' && (
            <TagifyComponent
              value={formData.tags}
              settings={tagifySettings}
              onChange={handleTagChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          )}
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
          <label className="text-sm font-medium">작성자</label>
          <AuthorSelect 
            value={selectedAuthor} 
            onChange={handleAuthorChange} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">내용</label>
          <TinyEditor
            initialValue={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
          {errors.some(e => e.field === 'content') && (
            <p className="text-sm text-red-500 mt-1">내용을 입력해주세요.</p>
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

        <div className="flex justify-end space-x-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/esg')}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}
