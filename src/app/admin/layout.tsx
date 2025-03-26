"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { 
  LayoutDashboard, 
  Newspaper, 
  Leaf,
  Settings,
  Users,
  FileText,
  LogOut
} from 'lucide-react';
import Image from 'next/image';

// 서버 사이드 렌더링 환경에서도 올바르게 작동하도록 설정
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isInitialized, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();

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

  const menuItems = [
    {
      href: '/admin',
      label: '대시보드',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: '/admin/news',
      label: '뉴스 관리',
      icon: <Newspaper className="w-5 h-5" />,
    },
    {
      href: '/admin/esg',
      label: 'ESG 관리',
      icon: <Leaf className="w-5 h-5" />,
    },
    {
      href: '/admin/users',
      label: '사용자 관리',
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: '/admin/brochure',
      label: '브로슈어 관리',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      href: '/admin/settings',
      label: '설정',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar - 로그인 페이지가 아닐 때만 표시 */}
        {pathname !== '/admin/login' && (
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
              <div className="flex flex-col h-screen bg-white border-r border-gray-200">
                <div className="flex items-center h-16 flex-shrink-0 px-4">
                  <Link href="/admin" className="block w-auto h-8 relative">
                    <Image
                      src="/images/logo.svg"
                      alt="Echo IT Logo"
                      width={120}
                      height={32}
                      priority
                    />
                  </Link>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            group relative flex items-center px-3 py-2 text-sm font-medium rounded-md
                            transition-colors duration-200 ease-in-out
                            ${isActive 
                              ? 'text-gray-900 bg-gray-100 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-0.5 before:bg-echoit-primary'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          <span className={`
                            flex items-center justify-center w-5 h-5 mr-3
                            ${isActive ? 'text-echoit-primary' : 'text-gray-400 group-hover:text-gray-500'}
                          `}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="flex-shrink-0 border-t border-gray-200">
                  <button
                    onClick={() => logout()}
                    className="
                      flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600
                      transition-colors duration-200 ease-in-out
                      hover:bg-gray-50 hover:text-gray-900
                    "
                  >
                    <LogOut className="w-5 h-5 mr-3 text-gray-400" />
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {pathname !== '/admin/login' && (
            <div className="flex-shrink-0 bg-white border-b">
              <div className="h-16 flex items-center justify-end px-4">
                <LanguageSwitcher />
              </div>
            </div>
          )}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

