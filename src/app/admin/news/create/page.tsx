"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNewsPost, createSlugFromTitle } from '@/lib/models/news-posts';
import { ArrowLeft, Save, Image as ImageIcon, Upload, Link, Check } from 'lucide-react';
import BlogEditor from '@/components/ui/blog-editor';
import FileUpload from '@/components/ui/file-upload';
import { translateText } from '@/lib/utils/translation';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

export default function CreateNewsPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: {
      ko: '',
      en: '',
    },
    excerpt: {
      ko: '',
      en: '',
    },
    content: {
      ko: '',
      en: '',
    },
    category: 'company',
    author: '',
    date: new Date().toISOString().split('T')[0],
    imageSrc: '',
    originalLink: '',
    featured: false,
    showOnHomepage: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'ko' | 'en'>('ko');
  const [isTitleTranslating, setIsTitleTranslating] = useState(false);
  const [isExcerptTranslating, setIsExcerptTranslating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.ko) newErrors['title.ko'] = '한글 제목을 입력해주세요.';
    if (!formData.title.en) newErrors['title.en'] = '영문 제목을 입력해주세요.';
    if (!formData.excerpt.ko) newErrors['excerpt.ko'] = '한글 요약을 입력해주세요.';
    if (!formData.excerpt.en) newErrors['excerpt.en'] = '영문 요약을 입력해주세요.';
    if (!formData.content.ko) newErrors['content.ko'] = '한글 내용을 입력해주세요.';
    if (!formData.content.en) newErrors['content.en'] = '영문 내용을 입력해주세요.';
    if (!formData.category) newErrors.category = '카테고리를 선택해주세요.';
    if (!formData.author) newErrors.author = '작성자를 입력해주세요.';
    if (!formData.imageSrc) newErrors.imageSrc = '대표 이미지를 업로드하거나 URL을 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [field, lang] = name.split('.');
      setFormData({
        ...formData,
        [field]: {
          ...formData[field as keyof typeof formData],
          [lang]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleContentChange = (content: string, lang: 'ko' | 'en') => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [lang]: content,
      },
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleTitleTranslate = async () => {
    if (!formData.title.ko.trim() || isTitleTranslating) return;

    try {
      setIsTitleTranslating(true);
      const translatedTitle = await translateText(formData.title.ko);
      setFormData({
        ...formData,
        title: {
          ...formData.title,
          en: translatedTitle,
        },
      });
    } catch (error) {
      console.error('Title translation error:', error);
    } finally {
      setIsTitleTranslating(false);
    }
  };

  const handleExcerptTranslate = async () => {
    if (!formData.excerpt.ko.trim() || isExcerptTranslating) return;

    try {
      setIsExcerptTranslating(true);
      const translatedExcerpt = await translateText(formData.excerpt.ko);
      setFormData({
        ...formData,
        excerpt: {
          ...formData.excerpt,
          en: translatedExcerpt,
        },
      });
    } catch (error) {
      console.error('Excerpt translation error:', error);
    } finally {
      setIsExcerptTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Generate slug from Korean title
      const slug = createSlugFromTitle(formData.title.ko);

      createNewsPost({
        ...formData,
        slug,
      });

      setIsSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin/news');
      }, 1500);
    } catch (error) {
      console.error('Error creating news post:', error);
      setErrors({
        form: '뉴스 게시물 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 이미지 업로드 완료 핸들러
  const handleImageUploadComplete = (url: string) => {
    setFormData({
      ...formData,
      imageSrc: url,
    });
    // 이미지가 설정되면 에러 메시지 제거
    if (errors.imageSrc) {
      const { imageSrc, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  // 한글 내용이 변경될 때마다 자동 번역
  useEffect(() => {
    const translateContent = async () => {
      if (!formData.title.ko || isTranslating) return;
      
      setIsTranslating(true);
      try {
        const [translatedTitle, translatedContent] = await Promise.all([
          translateText(formData.title.ko, 'ko', 'en'),
          translateText(formData.content.ko, 'ko', 'en')
        ]);
        
        setFormData({
          ...formData,
          title: {
            ...formData.title,
            en: translatedTitle,
          },
          content: {
            ...formData.content,
            en: translatedContent
          },
        });
      } catch (error) {
        console.error('번역 중 오류 발생:', error);
        toast({
          title: '번역 오류',
          description: '자동 번역 중 오류가 발생했습니다. 수동으로 입력해주세요.',
          variant: 'destructive'
        });
      } finally {
        setIsTranslating(false);
      }
    };

    const debounceTimeout = setTimeout(translateContent, 1000);
    return () => clearTimeout(debounceTimeout);
  }, [formData.title.ko, formData.content.ko]);

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">뉴스가 성공적으로 생성되었습니다!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">뉴스 관리 페이지로 이동합니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>뒤로 가기</span>
        </button>
        <h1 className="text-2xl font-bold dark:text-white">새 뉴스 작성</h1>
      </div>

      {errors.form && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-300">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, featured: checked }))
                }
              />
              <Label htmlFor="featured">주요 소식으로 지정</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="showOnHomepage"
                checked={formData.showOnHomepage}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, showOnHomepage: checked }))
                }
              />
              <Label htmlFor="showOnHomepage">홈페이지에 표시</Label>
            </div>
          </div>
          <Button type="submit">저장</Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="thumbnailUrl">썸네일 URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.imageSrc}
              onChange={(e) => setFormData({ ...formData, imageSrc: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <Label htmlFor="originalLink">원본 링크</Label>
            <Input
              id="originalLink"
              value={formData.originalLink}
              onChange={(e) => setFormData({ ...formData, originalLink: e.target.value })}
              placeholder="https://example.com/news"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ko">한국어</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="ko" className="space-y-4">
            <div>
              <Label htmlFor="title.ko">제목 (한글)</Label>
              <Input
                id="title.ko"
                name="title.ko"
                value={formData.title.ko}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="author">작성자</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">날짜</Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>내용 (한글)</Label>
              <BlogEditor
                content={formData.content.ko}
                onChange={(content) => handleContentChange(content, 'ko')}
                label="게시글 내용"
                placeholder="내용을 입력하세요..."
                isInvalid={Boolean(errors['content.ko'])}
                errorMessage={errors['content.ko']}
              />
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-4">
            <div>
              <Label htmlFor="title.en">제목 (영문)</Label>
              <Input
                id="title.en"
                name="title.en"
                value={formData.title.en}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="excerpt.en">요약 (영문)</Label>
              <textarea
                id="excerpt.en"
                name="excerpt.en"
                rows={3}
                value={formData.excerpt.en}
                onChange={handleInputChange}
                placeholder="Enter a summary for the news thumbnail."
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors['excerpt.en']
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors['excerpt.en'] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors['excerpt.en']}</p>
              )}
            </div>
            <div>
              <Label>내용 (영문)</Label>
              <BlogEditor
                content={formData.content.en}
                onChange={(content) => handleContentChange(content, 'en')}
                label="게시글 내용"
                placeholder="내용을 입력하세요..."
                isInvalid={Boolean(errors['content.en'])}
                errorMessage={errors['content.en']}
              />
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
