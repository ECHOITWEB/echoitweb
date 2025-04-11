"use client";

import React, { useState, useEffect } from 'react';
import { TinyEditor } from '@/components/editor/tiny-editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Loader2, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageUploadWithAI } from '@/components/ImageUploadWithAI';
import { Label } from "@/components/ui/label";
import { ImageSource } from '@/types/common';
import dynamic from 'next/dynamic';

const TagifyComponent = dynamic(() =>
  import('@yaireo/tagify/dist/react.tagify').then((mod) => mod.default),
  { ssr: false }
);

const TagifyCss = (): null => {
  React.useEffect(() => {
    import('@yaireo/tagify/dist/tagify.css');
  }, []);
  return null;
};

export interface ContentFormData {
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishDate: Date;
  tags: string[];
  isPublished: boolean;
  isMainFeatured: boolean;
  imageSource: ImageSource;
  originalUrl: string;
  thumbnailPath?: string;
  mediumPath?: string;
  largePath?: string;
  originalPath?: string;
  [key: string]: any;
}

export interface FormError {
  field: string;
  message: string;
}

export interface TagifyEvent {
  detail: {
    tagify: {
      value: Array<{
        value: string;
        [key: string]: unknown;
      }>;
    };
  };
}

interface AuthorOption {
  id: string;
  name: string;
  role: string;
}

interface ContentFormProps {
  formData: ContentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContentFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  errors: FormError[];
  selectedAuthor: string;
  handleAuthorChange: (authorId: string) => void;
  handleTagChange: (e: TagifyEvent) => void;
  handleBackClick: () => void;
  contentType: 'news' | 'esg';
  isEditMode: boolean;
  categories: Array<{ value: string; label: string }>;
  authorOptions: Array<{ value: string; label: string }>;
}

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return '관리자';
    case 'editor': return '편집자';
    case 'viewer': return '조회자';
    default: return role;
  }
};

export function ContentForm({
  formData,
  setFormData,
  handleSubmit,
  isSubmitting,
  errors,
  selectedAuthor,
  handleAuthorChange,
  handleTagChange,
  handleBackClick,
  contentType,
  isEditMode,
  categories,
  authorOptions = [] // 기본값 추가
}: ContentFormProps): JSX.Element {
  const tagifySettings = {
    maxTags: 10,
    placeholder: contentType === 'news'
      ? "예: AI, 블록체인, 핀테크"
      : "예: 환경, 사회공헌, 지배구조",
    delimiters: ",",
    dropdown: {
      enabled: 0
    }
  };

  const pageTitle = isEditMode
    ? `${contentType === 'news' ? '뉴스' : 'ESG'} 콘텐츠 수정`
    : `${contentType === 'news' ? '뉴스' : 'ESG'} 콘텐츠 생성`;
  
  const [authorDisplay, setAuthorDisplay] = useState<string>('작성자를 선택하세요.');

  useEffect(() => {
    console.log("selectedAuthor:", selectedAuthor);
    console.log("authorOptions:", authorOptions);

    if (!authorOptions || authorOptions.length === 0) return;
  
    if (selectedAuthor === 'current_user') {
      setAuthorDisplay('현재 로그인 계정 사용');
    } else if (selectedAuthor) {
      const matched = authorOptions.find(opt => opt.value === selectedAuthor);
      if (matched) {
        setAuthorDisplay(matched.label); // 예: ellie(편집자)
      } else {
        setAuthorDisplay('알 수 없는 사용자');
      }
    } else {
      setAuthorDisplay('작성자를 선택하세요.');
    }
  }, [selectedAuthor, authorOptions]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
      <TagifyCss />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button type="button" variant="ghost" className="mr-2" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            뒤로
          </Button>
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
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
                {isEditMode ? '변경사항 저장' : '콘텐츠 생성'}
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
          <Label>제목 <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="제목 입력"
          />
        </div>

        <div>
          <Label>요약</Label>
          <Input
            type="text"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="요약 입력"
          />
        </div>

        <div>
          <Label>카테고리</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
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
          <Select
            value={selectedAuthor}
            onValueChange={handleAuthorChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="작성자를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_user">현재 로그인 계정</SelectItem>
              {authorOptions.map((author) => (
                <SelectItem key={author.value} value={author.value}>
                  {author.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>발행일</Label>
          <DatePicker
            date={formData.publishDate}
            setDate={(date) => setFormData({ ...formData, publishDate: date || new Date() })}
          />
        </div>

        <div>
          <Label>태그</Label>
          <TagifyComponent
            settings={tagifySettings}
            value={formData.tags}
            onChange={handleTagChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label>썸네일 이미지</Label>
          <ImageUploadWithAI
            type={contentType}
            title={formData.title || ''}
            summary={formData.summary || ''}
            onImageProcessed={(imageUrls) => {
              setFormData(prev => ({
                ...prev,
                thumbnailPath: imageUrls.thumbnailPath,
                mediumPath: imageUrls.mediumPath,
                largePath: imageUrls.largePath,
                originalPath: imageUrls.originalPath,
              }));
            }}
            defaultImageUrl={formData.originalPath}
          />
        </div>

        <div>
          <Label>원본 URL</Label>
          <Input
            type="text"
            value={formData.originalUrl}
            onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <Label>본문</Label>
          <TinyEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
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
            <Label htmlFor="isPublished">발행하기</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMainFeatured"
              checked={formData.isMainFeatured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isMainFeatured: checked as boolean })
              }
            />
            <Label htmlFor="isMainFeatured">메인 노출</Label>
          </div>
        </div>
      </div>
    </form>
  );
}
