"use client";

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/ui/admin-layout';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

// 서버 사이드 렌더링 환경에서도 올바르게 작동하도록 설정
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 사이드 마운트 후 실행
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 인증 상태에 따른 리다이렉션 처리
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (!isMounted || !isInitialized) return;

    const timer = setTimeout(() => {
      // 로그인 페이지가 아니고 인증되지 않은 경우 로그인 페이지로 리다이렉션
      if (!isAuthenticated && pathname !== '/admin/login') {
        window.location.href = '/admin/login';
        return;
      }

      // 로그인 페이지이고 이미 인증된 경우 관리자 홈으로 리다이렉션
      if (isAuthenticated && pathname === '/admin/login') {
        window.location.href = '/admin';
        return;
      }

      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isInitialized, pathname, isMounted]);

  // 로딩 중이거나 초기 인증 검사 중에는 로딩 상태 표시
  if (!isMounted || isLoading || (!isAuthenticated && pathname !== '/admin/login')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증 완료 후 관리자 레이아웃 표시
  return <AdminLayout>{children}</AdminLayout>;
}
