"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, X, File, Check, AlertCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  className?: string;
  variant?: 'image' | 'document';
  currentImage?: string;
}

export default function FileUpload({
  onUploadComplete,
  onError,
  accept = 'image/*',
  maxSizeMB = 5,
  label = '파일 업로드',
  description = '여기에 파일을 끌어다 놓거나 클릭하여 선택하세요.',
  className = '',
  variant = 'image',
  currentImage
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const resetState = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setIsError(false);
    setErrorMessage('');
  };

  const handleError = (message: string) => {
    setIsError(true);
    setErrorMessage(message);
    if (onError) onError(message);
    setIsUploading(false);

    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setIsError(false);
      setErrorMessage('');
    }, 5000);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    resetState();
    const file = files[0];

    // Check file size
    if (file.size > maxSizeBytes) {
      handleError(`파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 허용됩니다.`);
      return;
    }

    // Check file type based on variant
    if (variant === 'image' && !file.type.startsWith('image/')) {
      handleError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (variant === 'document' && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      handleError('PDF 또는 Word 문서만 업로드할 수 있습니다.');
      return;
    }

    setUploadedFile(file);

    // Create preview for images
    if (variant === 'image') {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }

    // Upload file to server
    uploadFileToServer(file);
  };

  const uploadFileToServer = async (file: File) => {
    setIsUploading(true);
    let progress = 0;

    // Simulate initial progress
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        setUploadProgress(progress);
      }
    }, 150);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '업로드 중 오류가 발생했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        setTimeout(() => {
          onUploadComplete(data.url);
          setIsUploading(false);
        }, 500);
      } else {
        throw new Error(data.message || '업로드 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      clearInterval(interval);
      handleError(error.message || '파일 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      handleError('URL을 입력해주세요.');
      return;
    }

    // Simple URL validation
    try {
      new URL(urlInput);

      if (variant === 'image' && !urlInput.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        handleError('유효한 이미지 URL을 입력해주세요.');
        return;
      }

      onUploadComplete(urlInput);
      setUrlInput('');
    } catch (error) {
      handleError('유효한 URL을 입력해주세요.');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleUploadMethod = () => {
    setUseUrlInput(!useUrlInput);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      onUploadComplete(data.url);
      setPreviewUrl(data.url);
    } catch (error) {
      console.error('파일 업로드 오류:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
  });

  const removeImage = () => {
    setPreviewUrl(null);
    onUploadComplete('');
  };

  return (
    <div className={`${className} w-full`}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}

      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={toggleUploadMethod}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          {useUrlInput ? (
            <>
              <UploadCloud className="h-4 w-4 mr-1" />
              파일 업로드로 전환
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-1" />
              URL 입력으로 전환
            </>
          )}
        </button>
      </div>

      {useUrlInput ? (
        <div className="space-y-3">
          <div className="flex rounded-md shadow-sm">
            <div className="relative flex items-stretch flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={variant === 'image' ? "이미지 URL (예: https://example.com/image.jpg)" : "문서 URL (예: https://example.com/document.pdf)"}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              사용하기
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {variant === 'image'
              ? "외부 이미지 URL을 입력하세요. JPG, PNG, GIF 등 이미지 파일의 URL이어야 합니다."
              : "외부 문서 URL을 입력하세요. PDF 또는 문서 파일의 URL이어야 합니다."}
          </p>
        </div>
      ) : !uploadedFile && !isUploading ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${
            isDragging || isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <UploadCloud className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{description}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {variant === 'image' ?
                `PNG, JPG, GIF ${maxSizeMB}MB 이하` :
                `PDF, DOC, DOCX ${maxSizeMB}MB 이하`}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          {isUploading ? (
            <div className="space-y-3">
              <div className="flex items-center">
                {variant === 'image' && previewUrl ? (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src={previewUrl}
                      alt="File preview"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <File className="h-10 w-10 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {uploadedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(uploadedFile?.size ? uploadedFile.size / 1024 : 0)} KB
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                업로드 중... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {variant === 'image' && previewUrl ? (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src={previewUrl}
                      alt="File preview"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <File className="h-10 w-10 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {uploadedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(uploadedFile?.size ? uploadedFile.size / 1024 : 0)} KB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {isError && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {errorMessage}
        </div>
      )}

      {previewUrl && (
        <div className="relative w-40 h-40 mx-auto mt-4">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
            onClick={removeImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
