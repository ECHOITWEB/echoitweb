import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { getAccessToken } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

interface ImageUploadWithAIProps {
  type: string;
  title: string;
  summary?: string;
  onImageProcessed: (data: any) => void;
  onUpdate?: () => void;
  defaultImageUrl?: string;
}

export function ImageUploadWithAI({ 
  type, 
  title, 
  summary,
  onImageProcessed, 
  onUpdate,
  defaultImageUrl 
}: ImageUploadWithAIProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultImageUrl || '');
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      const token = getAccessToken();
      if (!token) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('title', title);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '업로드 실패');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '업로드 실패');
      }

      setPreviewUrl(data.data.originalPath);
      onImageProcessed(data.data);
      onUpdate?.();
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      setError(error instanceof Error ? error.message : '업로드 실패');
      toast({
        title: "이미지 업로드 실패",
        description: error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateAI = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const token = getAccessToken();
      if (!token) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          type,
          title,
          summary
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '생성 실패');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '생성 실패');
      }

      setPreviewUrl(data.data.originalPath);
      onImageProcessed(data.data);
      onUpdate?.();
    } catch (error) {
      console.error('AI 이미지 생성 오류:', error);
      setError(error instanceof Error ? error.message : '생성 실패');
      toast({
        title: "이미지 생성 실패",
        description: error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onDrop = useCallback((files: File[]) => {
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const showPreview = () => {
    if (previewUrl) {
      return (
        <div className="relative w-full h-48 mb-4">
          <Image
            src={previewUrl}
            alt="미리보기"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-white/70 hover:bg-white"
            onClick={() => {
              setPreviewUrl('');
              onImageProcessed({
                thumbnailPath: '',
                mediumPath: '',
                largePath: '',
                originalPath: ''
              });
            }}
          >
            변경
          </Button>
        </div>
      );
    }
    return null;
  };

  const showUploadOptions = () => {
    if (!previewUrl) {
      return (
        <>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary hover:bg-gray-50"
            )}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-primary mb-2" />
                <p>파일을 여기에 놓으세요</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p>업로드할 이미지를 끌어다 놓거나 클릭하세요</p>
                <p className="text-xs text-gray-500 mt-1">
                  지원 형식: PNG, JPG, GIF, WEBP (최대 10MB)
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 flex items-center justify-center"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  이미지 업로드
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 flex items-center justify-center"
              onClick={handleGenerateAI}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI 이미지 생성
                </>
              )}
            </Button>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {showPreview()}
      {showUploadOptions()}
      {error && (
        <div className="text-sm text-red-500 mt-1">
          {error}
        </div>
      )}
    </div>
  );
} 