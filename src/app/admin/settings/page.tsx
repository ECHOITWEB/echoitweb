"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Check, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { getSiteSettings, updateLogoUrl, updateOgImageUrl, updateFaviconUrl, updateCompanyBrochureUrl } from '@/lib/models/site-settings';

export default function AdminSettingsPage() {
  // Site settings state
  const [logoUrl, setLogoUrl] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');

  // Form state
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [newOgImageUrl, setNewOgImageUrl] = useState('');
  const [newFaviconUrl, setNewFaviconUrl] = useState('');
  const [newBrochureUrl, setNewBrochureUrl] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('branding');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeUpload, setActiveUpload] = useState<string | null>(null);

  // Timeout ID for clearing messages
  const messageTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const settings = getSiteSettings();
    setLogoUrl(settings.logoUrl);
    setOgImageUrl(settings.ogImageUrl);
    setFaviconUrl(settings.faviconUrl || '');
    setBrochureUrl(settings.companyBrochureUrl);

    // Cleanup timeout on unmount
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const handleLogoUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setActiveUpload('logo');

    if (!newLogoUrl) {
      showErrorMessage('로고 URL을 입력해주세요.');
      setActiveUpload(null);
      return;
    }

    try {
      updateLogoUrl(newLogoUrl);
      setLogoUrl(newLogoUrl);
      setNewLogoUrl('');
      showSuccessMessage('로고가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      showErrorMessage('로고 업데이트 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setActiveUpload(null);
    }
  };

  const handleOgImageUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setActiveUpload('ogImage');

    if (!newOgImageUrl) {
      showErrorMessage('OG 이미지 URL을 입력해주세요.');
      setActiveUpload(null);
      return;
    }

    try {
      updateOgImageUrl(newOgImageUrl);
      setOgImageUrl(newOgImageUrl);
      setNewOgImageUrl('');
      showSuccessMessage('OG 이미지가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      showErrorMessage('OG 이미지 업데이트 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setActiveUpload(null);
    }
  };

  const handleFaviconUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setActiveUpload('favicon');

    if (!newFaviconUrl) {
      showErrorMessage('파비콘 URL을 입력해주세요.');
      setActiveUpload(null);
      return;
    }

    try {
      updateFaviconUrl(newFaviconUrl);
      setFaviconUrl(newFaviconUrl);
      setNewFaviconUrl('');
      showSuccessMessage('파비콘이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      showErrorMessage('파비콘 업데이트 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setActiveUpload(null);
    }
  };

  const handleBrochureUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setActiveUpload('brochure');

    if (!newBrochureUrl) {
      showErrorMessage('회사 소개서 URL을 입력해주세요.');
      setActiveUpload(null);
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
    } finally {
      setActiveUpload(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">사이트 설정</h1>
      </div>

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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('branding')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branding'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            브랜드 설정
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'seo'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            SEO 설정
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            문서 관리
          </button>
        </nav>
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
            <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-4">로고 관리</h3>
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">현재 로고:</p>
              <div className="relative h-16 w-64 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                {logoUrl && (
                  <Image
                    src={logoUrl}
                    alt="현재 로고"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>

            <form onSubmit={handleLogoUpdate} className="space-y-4">
              <div className="relative">
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  새 로고 URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="logoUrl"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      value={newLogoUrl}
                      onChange={(e) => setNewLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  이미지 URL을 입력하세요. 권장 크기: 120 x 30 픽셀
                </p>
              </div>

              <button
                type="submit"
                disabled={activeUpload === 'logo'}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                  activeUpload === 'logo' ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {activeUpload === 'logo' ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                    업데이트 중...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    로고 업데이트
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Favicon Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
            <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-4">파비콘 관리</h3>
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">현재 파비콘:</p>
              <div className="relative h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                {faviconUrl && (
                  <Image
                    src={faviconUrl}
                    alt="현재 파비콘"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>

            <form onSubmit={handleFaviconUpdate} className="space-y-4">
              <div className="relative">
                <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  새 파비콘 URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="faviconUrl"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      value={newFaviconUrl}
                      onChange={(e) => setNewFaviconUrl(e.target.value)}
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  이미지 URL을 입력하세요. 권장 크기: 32 x 32 픽셀
                </p>
              </div>

              <button
                type="submit"
                disabled={activeUpload === 'favicon'}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                  activeUpload === 'favicon' ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {activeUpload === 'favicon' ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                    업데이트 중...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    파비콘 업데이트
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-4">SEO 이미지 관리</h3>
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">현재 OG 이미지:</p>
            <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
              {ogImageUrl && (
                <Image
                  src={ogImageUrl}
                  alt="현재 OG 이미지"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
          </div>

          <form onSubmit={handleOgImageUpdate} className="space-y-4">
            <div className="relative">
              <label htmlFor="ogImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                새 OG 이미지 URL
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="ogImageUrl"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    value={newOgImageUrl}
                    onChange={(e) => setNewOgImageUrl(e.target.value)}
                    placeholder="https://example.com/og-image.png"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                이미지 URL을 입력하세요. 권장 크기: 1200 x 630 픽셀
              </p>
            </div>

            <button
              type="submit"
              disabled={activeUpload === 'ogImage'}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                activeUpload === 'ogImage' ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {activeUpload === 'ogImage' ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                  업데이트 중...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  OG 이미지 업데이트
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-4">회사 소개서 관리</h3>
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">현재 회사 소개서 URL:</p>
            {brochureUrl ? (
              <a
                href={brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {brochureUrl}
              </a>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">등록된 회사 소개서가 없습니다.</p>
            )}
          </div>

          <form onSubmit={handleBrochureUpdate} className="space-y-4">
            <div className="relative">
              <label htmlFor="brochureUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                새 회사 소개서 URL
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="brochureUrl"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    value={newBrochureUrl}
                    onChange={(e) => setNewBrochureUrl(e.target.value)}
                    placeholder="https://example.com/company-brochure.pdf"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PDF 또는 회사 소개서 URL을 입력하세요.
              </p>
            </div>

            <button
              type="submit"
              disabled={activeUpload === 'brochure'}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                activeUpload === 'brochure' ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {activeUpload === 'brochure' ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                  업데이트 중...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  회사 소개서 업데이트
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
