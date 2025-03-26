"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Editor } from '@/components/editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/image-upload';
import { generateSlug } from '@/lib/utils';

export default function NewsGeneratePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: {
      ko: '',
      en: ''
    },
    content: {
      ko: '',
      en: ''
    },
    excerpt: {
      ko: '',
      en: ''
    },
    coverImage: '',
    published: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 슬러그 생성
      const slug = generateSlug(formData.title.ko);

      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '성공',
          description: '뉴스 게시물이 성공적으로 생성되었습니다.',
        });
        router.push('/admin/news');
      } else {
        throw new Error(data.message || '뉴스 게시물 생성에 실패했습니다.');
      }
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">새 뉴스 게시물 작성</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 한국어 제목 */}
        <div className="space-y-2">
          <Label htmlFor="title-ko">제목 (한국어)</Label>
          <Input
            id="title-ko"
            value={formData.title.ko}
            onChange={(e) => setFormData({
              ...formData,
              title: { ...formData.title, ko: e.target.value }
            })}
            required
          />
        </div>

        {/* 영어 제목 */}
        <div className="space-y-2">
          <Label htmlFor="title-en">제목 (영어)</Label>
          <Input
            id="title-en"
            value={formData.title.en}
            onChange={(e) => setFormData({
              ...formData,
              title: { ...formData.title, en: e.target.value }
            })}
            required
          />
        </div>

        {/* 한국어 내용 */}
        <div className="space-y-2">
          <Label>내용 (한국어)</Label>
          <Editor
            value={formData.content.ko}
            onChange={(value) => setFormData({
              ...formData,
              content: { ...formData.content, ko: value }
            })}
          />
        </div>

        {/* 영어 내용 */}
        <div className="space-y-2">
          <Label>내용 (영어)</Label>
          <Editor
            value={formData.content.en}
            onChange={(value) => setFormData({
              ...formData,
              content: { ...formData.content, en: value }
            })}
          />
        </div>

        {/* 한국어 요약 */}
        <div className="space-y-2">
          <Label htmlFor="excerpt-ko">요약 (한국어)</Label>
          <Input
            id="excerpt-ko"
            value={formData.excerpt.ko}
            onChange={(e) => setFormData({
              ...formData,
              excerpt: { ...formData.excerpt, ko: e.target.value }
            })}
            required
          />
        </div>

        {/* 영어 요약 */}
        <div className="space-y-2">
          <Label htmlFor="excerpt-en">요약 (영어)</Label>
          <Input
            id="excerpt-en"
            value={formData.excerpt.en}
            onChange={(e) => setFormData({
              ...formData,
              excerpt: { ...formData.excerpt, en: e.target.value }
            })}
            required
          />
        </div>

        {/* 커버 이미지 업로드 */}
        <div className="space-y-2">
          <Label>커버 이미지</Label>
          <ImageUpload
            value={formData.coverImage}
            onChange={(url) => setFormData({ ...formData, coverImage: url })}
          />
        </div>

        {/* 공개 여부 */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) => setFormData({
              ...formData,
              published: checked as boolean
            })}
          />
          <Label htmlFor="published">즉시 공개</Label>
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
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
} 