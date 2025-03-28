"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  LogOut,
  Settings,
  FileText,
  Image as ImageIcon,
  Newspaper,
  Leaf,
  Menu,
  X,
  Home,
  Moon,
  Sun
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle dark mode after component is mounted
  useEffect(() => {
    if (!isMounted) return;

    // Check if user has a preferred theme already
    try {
      const savedTheme = localStorage.getItem('admin_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [isMounted]);

  const toggleDarkMode = () => {
    if (!isMounted) return;

    setIsDarkMode(prevState => {
      const newState = !prevState;
      try {
        if (newState) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('admin_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('admin_theme', 'light');
        }
      } catch (error) {
        console.error('Error updating theme:', error);
      }
      return newState;
    });
  };

  // If this is the login page, just render the children without the admin UI
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    // Using window.location.href for a full page reload after logout
    window.location.href = '/admin/login';
  };

  const navItems = [
    { href: '/admin', label: '대시보드', icon: <Home className="w-5 h-5 mr-2" /> },
    { href: '/admin/news', label: '뉴스 관리', icon: <Newspaper className="w-5 h-5 mr-2" /> },
    { href: '/admin/esg', label: 'ESG 관리', icon: <Leaf className="w-5 h-5 mr-2" /> },
    { href: '/admin/brochure', label: '회사 소개서', icon: <FileText className="w-5 h-5 mr-2" /> },
    { href: '/admin/settings', label: '사이트 설정', icon: <Settings className="w-5 h-5 mr-2" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') {
      return true;
    }

    if (path === '/admin/settings' && pathname === '/admin/settings') {
      return true;
    }

    return pathname.startsWith(path) && path !== '/admin';
  };

  // Handle all navigation to avoid React state issues
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close mobile menu when navigating

    // Only navigate if we're not already on this page
    if (pathname !== href) {
      // Use direct navigation to avoid React state issues
      window.location.href = href;
    }
  };

  // Handle UI rendering based on mounting state to avoid hydration issues
  const darkModeClass = isMounted && isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900';

  return (
    <div className={`flex min-h-screen ${darkModeClass}`}>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden w-full fixed top-0 left-0 z-30 bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-3 text-lg font-semibold text-blue-600 dark:text-blue-400">ECHOIT Admin</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isMounted && isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 fixed lg:static top-0 left-0 h-full z-50 lg:z-auto
          w-64 bg-white dark:bg-gray-800 shadow-md overflow-y-auto
        `}
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <a
            href="/admin"
            onClick={(e) => handleNavigation('/admin', e)}
            className="flex items-center p-2"
          >
            <ImageIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            <span className="text-xl font-bold text-blue-500 dark:text-blue-400">ECHOIT Admin</span>
          </a>
          <button
            className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-4">
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">로그인:</span> {user?.username || 'Guest'}
              </p>
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMounted && isDarkMode ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={`flex items-center px-4 py-3 text-sm transition duration-150 ${
                      isActive(item.href)
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition duration-150"
          >
            <LogOut className="w-5 h-5 mr-2" />
            로그아웃
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile header spacer */}
        <div className="lg:hidden h-16"></div>

        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
