import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  type: 'news' | 'esg';
  title: string;
  onImageProcessed: (imageUrls: {
    thumbnailPath: string;
    mediumPath: string;
    largePath: string;
    originalPath: string;
  }) => void;
  defaultImageUrl?: string;
}

export function ImageUpload({ type, title, onImageProcessed, defaultImageUrl }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultImageUrl || '');
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);

      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('title', title);

      // 파일 업로드 API 호출
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '이미지 업로드 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      
      // 미리보기 URL 설정
      setPreviewUrl(result.data.originalPath);
      
      // 부모 컴포넌트에 처리된 이미지 URL 전달
      onImageProcessed(result.data);

      toast({
        title: "업로드 완료",
        description: "이미지가 성공적으로 업로드되었습니다.",
      });
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [type, title, onImageProcessed, toast]);

  const handleGenerateImage = useCallback(async () => {
    try {
      setIsUploading(true);

      const response = await fetch('/api/images/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '이미지 생성 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      
      // 미리보기 URL 설정
      setPreviewUrl(result.data.originalPath);
      
      // 부모 컴포넌트에 처리된 이미지 URL 전달
      onImageProcessed(result.data);

      toast({
        title: "이미지 생성 완료",
        description: "AI가 이미지를 생성했습니다.",
      });
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      toast({
        title: "생성 실패",
        description: error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [type, title, onImageProcessed, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    } else {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
    }
  }, [handleFileUpload, toast]);

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />
        <div className="flex flex-col items-center justify-center py-4">
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            이미지를 드래그하여 놓거나 클릭하여 업로드하세요
          </p>
          <p className="text-xs text-gray-500 mt-1">
            지원 형식: JPG, PNG, GIF (최대 10MB)
          </p>
        </div>
      </div>

      {!previewUrl && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI가 이미지 생성 중...
              </>
            ) : (
              'AI로 이미지 생성하기'
            )}
          </Button>
        </div>
      )}

      {previewUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
          <Image
            src={previewUrl}
            alt="미리보기"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
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
            이미지 변경
          </Button>
        </div>
      )}
    </div>
  );
} 