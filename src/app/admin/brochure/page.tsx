"use client";

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateCompanyBrochureUrl } from '@/lib/models/site-settings';
import { AlertCircle, Check, FileText, Download, Link as LinkIcon, Trash2 } from 'lucide-react';
import FileUpload from '@/components/ui/file-upload';

export default function AdminBrochurePage() {
  const [brochureUrl, setBrochureUrl] = useState('');
  const [newBrochureUrl, setNewBrochureUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');

  // Timeout ID for clearing messages
  const messageTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const settings = getSiteSettings();
    setBrochureUrl(settings.companyBrochureUrl);

    // Cleanup timeout on unmount
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const showSuccessMessage = (message: string) => {
    clearMessages();
    setSuccessMessage(message);

    // Clear success message after 3 seconds
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    clearMessages();
    setErrorMessage(message);
  };

  const handleBrochureUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!newBrochureUrl) {
      showErrorMessage('회사 소개서 URL을 입력해주세요.');
      return;
    }

    try {
      updateCompanyBrochureUrl(newBrochureUrl);
      setBrochureUrl(newBrochureUrl);
      setNewBrochureUrl('');
      showSuccessMessage('회사 소개서가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      showErrorMessage('회사 소개서 업데이트 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const handleFileUploadComplete = (url: string) => {
    try {
      updateCompanyBrochureUrl(url);
      setBrochureUrl(url);
      showSuccessMessage('회사 소개서가 성공적으로 업로드되었습니다.');
    } catch (error) {
      showErrorMessage('회사 소개서 업로드 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const handleDeleteBrochure = () => {
    try {
      updateCompanyBrochureUrl('');
      setBrochureUrl('');
      showSuccessMessage('회사 소개서가 성공적으로 삭제되었습니다.');
    } catch (error) {
      showErrorMessage('회사 소개서 삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const handleFileUploadError = (error: string) => {
    showErrorMessage(error);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">회사 소개서 관리</h1>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md text-green-700 dark:text-green-300 mb-4 animate-fadeIn flex items-center">
          <div className="flex-shrink-0 mr-3">
            <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
          </div>
          <div>{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-300 mb-4 animate-fadeIn flex items-center">
          <div className="flex-shrink-0 mr-3">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">회사 소개서</h2>

        {brochureUrl ? (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-md mr-4">
                  <FileText className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-1">현재 회사 소개서</h3>
                  <a
                    href={brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {brochureUrl}
                  </a>
                </div>
              </div>
              <div className="flex space-x-2">
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md"
                  title="새 탭에서 열기"
                >
                  <LinkIcon className="h-5 w-5" />
                </a>
                <a
                  href={brochureUrl}
                  download
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md"
                  title="다운로드"
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  onClick={handleDeleteBrochure}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                  title="삭제"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-center">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-300">등록된 회사 소개서가 없습니다.</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setUploadMode('url')}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                uploadMode === 'url'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              URL로 추가
            </button>
            <button
              onClick={() => setUploadMode('file')}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                uploadMode === 'file'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              파일 업로드
            </button>
          </div>

          {uploadMode === 'url' ? (
            <form onSubmit={handleBrochureUpdate} className="space-y-4">
              <div>
                <label htmlFor="brochureUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  회사 소개서 URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      id="brochureUrl"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      placeholder="https://example.com/brochure.pdf"
                      value={newBrochureUrl}
                      onChange={(e) => setNewBrochureUrl(e.target.value)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  PDF나 회사 소개서 URL을 입력하세요.
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LinkIcon className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                URL 추가하기
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <FileUpload
                label="PDF 파일 업로드"
                description="회사 소개서 PDF 파일을 업로드하세요."
                variant="document"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                maxSizeMB={10}
                onUploadComplete={handleFileUploadComplete}
                onError={handleFileUploadError}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                최대 10MB의 PDF 또는 Word 문서를 업로드할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
