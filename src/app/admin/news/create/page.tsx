"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createNewsPost, createSlugFromTitle } from '@/lib/models/news-posts';
import { ArrowLeft, Save, Image as ImageIcon, Upload, Link, Check } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import ModernEditor from '@/components/ui/modern-editor';
import FileUpload from '@/components/ui/file-upload';

export default function CreateNewsPostPage() {
  const router = useRouter();
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
    date: new Date().toISOString().split('T')[0],
    imageSrc: '',
    featured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'ko' | 'en'>('ko');

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.ko) newErrors['title.ko'] = '한글 제목을 입력해주세요.';
    if (!formData.title.en) newErrors['title.en'] = '영문 제목을 입력해주세요.';
    if (!formData.excerpt.ko) newErrors['excerpt.ko'] = '한글 요약을 입력해주세요.';
    if (!formData.excerpt.en) newErrors['excerpt.en'] = '영문 요약을 입력해주세요.';
    if (!formData.content.ko) newErrors['content.ko'] = '한글 내용을 입력해주세요.';
    if (!formData.content.en) newErrors['content.en'] = '영문 내용을 입력해주세요.';
    if (!formData.category) newErrors.category = '카테고리를 선택해주세요.';
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title.ko" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                제목 (한글) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title.ko"
                name="title.ko"
                value={formData.title.ko}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors['title.ko']
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors['title.ko'] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors['title.ko']}</p>
              )}
            </div>

            <div>
              <label htmlFor="title.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                제목 (영문) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title.en"
                name="title.en"
                value={formData.title.en}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors['title.en']
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors['title.en'] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors['title.en']}</p>
              )}
            </div>

            <div>
              <label htmlFor="excerpt.ko" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                요약 (한글) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="excerpt.ko"
                name="excerpt.ko"
                rows={2}
                value={formData.excerpt.ko}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors['excerpt.ko']
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors['excerpt.ko'] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors['excerpt.ko']}</p>
              )}
            </div>

            <div>
              <label htmlFor="excerpt.en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                요약 (영문) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="excerpt.en"
                name="excerpt.en"
                rows={2}
                value={formData.excerpt.en}
                onChange={handleInputChange}
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
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.category
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500'
                }`}
              >
                <option value="company">회사 뉴스</option>
                <option value="award">수상 소식</option>
                <option value="partnership">파트너십</option>
                <option value="product">제품 소식</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <FileUpload
                label="대표 이미지 (썸네일) *"
                description="이미지를 업로드하거나 URL을 입력하세요"
                variant="image"
                onUploadComplete={handleImageUploadComplete}
                onError={(errorMsg) => setErrors({...errors, imageSrc: errorMsg})}
                maxSizeMB={5}
              />
              {formData.imageSrc && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    이미지 설정됨: {formData.imageSrc}
                  </p>
                </div>
              )}
              {errors.imageSrc && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.imageSrc}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                중요 뉴스로 표시 (메인 페이지에 노출)
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('ko')}
                className={`${
                  activeTab === 'ko'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                한글 내용
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`${
                  activeTab === 'en'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                영문 내용
              </button>
            </nav>
          </div>

          {activeTab === 'ko' && (
            <ModernEditor
              value={formData.content.ko}
              onChange={(content) => handleContentChange(content, 'ko')}
              label="내용 (한글)"
              placeholder="뉴스 내용을 입력하세요..."
              isInvalid={Boolean(errors['content.ko'])}
              errorMessage={errors['content.ko']}
            />
          )}

          {activeTab === 'en' && (
            <ModernEditor
              value={formData.content.en}
              onChange={(content) => handleContentChange(content, 'en')}
              label="내용 (영문)"
              placeholder="Enter the news content..."
              isInvalid={Boolean(errors['content.en'])}
              errorMessage={errors['content.en']}
            />
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장하기
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
