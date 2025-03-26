import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon, LinkIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
}

type UploadMethod = 'file' | 'url';

export default function ImageUpload({ onUpload, currentImage }: ImageUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file');
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const data = await response.json();
      setImageUrl(data.url);
      onUpload(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      onUpload(imageUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button
          type="button"
          variant={uploadMethod === 'file' ? 'default' : 'outline'}
          onClick={() => setUploadMethod('file')}
        >
          <UploadIcon className="w-4 h-4 mr-2" />
          파일 업로드
        </Button>
        <Button
          type="button"
          variant={uploadMethod === 'url' ? 'default' : 'outline'}
          onClick={() => setUploadMethod('url')}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          URL 입력
        </Button>
      </div>

      {uploadMethod === 'file' ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          <ImageIcon className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          {uploading ? (
            <p>업로드 중...</p>
          ) : isDragActive ? (
            <p>이미지를 여기에 놓으세요</p>
          ) : (
            <p>이미지를 드래그하거나 클릭하여 업로드하세요</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleUrlSubmit} className="flex space-x-2">
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="이미지 URL을 입력하세요"
          />
          <Button type="submit">확인</Button>
        </form>
      )}

      {imageUrl && (
        <div className="mt-4">
          <img
            src={imageUrl}
            alt="업로드된 이미지"
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
} 