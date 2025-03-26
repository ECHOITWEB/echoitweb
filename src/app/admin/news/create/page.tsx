"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TinyEditor } from '@/components/editor/tiny-editor';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthorSelect } from '@/components/forms/author-select';
import { NewsCategory, AuthorDepartment } from '@/types/news';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Tags from '@yaireo/tagify/dist/react.tagify';
import "@yaireo/tagify/dist/tagify.css";

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
}

interface FormError {
  field: string;
  message: string;
}

export default function CreateNewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const [formData, setFormData] = useState<IFormData>({
    title: '',
    summary: '',
    content: '',
    category: 'company',
    author: '',
    publishDate: new Date(),
    imageSource: '',
    tags: []
  });

  const validateForm = () => {
    const newErrors: FormError[] = [];

    if (!formData.title) {
      newErrors.push({ field: 'title', message: '제목을 입력해주세요.' });
    }
    if (!formData.content) {
      newErrors.push({ field: 'content', message: '내용을 입력해주세요.' });
    }
    if (!formData.author) {
      newErrors.push({ field: 'author', message: '작성자를 입력해주세요.' });
    }
    if (!formData.imageSource) {
      newErrors.push({ field: 'image', message: '대표 이미지를 업로드해주세요.' });
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
      const response = await fetch('/api/posts/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '뉴스 포스트 생성에 실패했습니다.');
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

  const handleAuthorChange = (authorName: string) => {
    setFormData(prev => ({
      ...prev,
      author: authorName
    }));
  };

  const categories = Object.entries(NewsCategory).map(([key, value]) => ({
    value,
    label: (() => {
      switch (value) {
        case 'company': return '회사 소식';
        case 'product': return '제품 소식';
        case 'award': return '수상 소식';
        case 'partnership': return '파트너십';
        case 'newsletter': return '뉴스레터';
        case 'investment': return '투자 소식';
        default: return key;
      }
    })()
  }));

  const tagifySettings = {
    maxTags: 10,
    placeholder: "예: 에코아이티, IT서비스, 테크",
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
      <h1 className="text-2xl font-bold mb-6">뉴스 포스트 작성</h1>
      
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
          <Tags
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
          <label className="text-sm font-medium">작성자</label>
          <AuthorSelect
            value={formData.author}
            onChange={handleAuthorChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">내용</label>
          <TinyEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
          {errors.some(e => e.field === 'content') && (
            <p className="text-sm text-red-500 mt-1">내용을 입력해주세요.</p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '게시하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}
