"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { Eye, EyeOff, ShieldAlert, Lock, LogIn, Moon, Sun, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isInitialized, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemainingTime, setLockRemainingTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isInitialized) return;

    try {
      const savedTheme = localStorage.getItem('admin_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }

      const rememberedUser = Cookies.get('admin_remember');
      if (rememberedUser) {
        try {
          const parsedUser = JSON.parse(rememberedUser);
          if (parsedUser.username) {
            setEmail(parsedUser.username);
            setRememberMe(true);
          }
        } catch (error) {
          console.error('Failed to parse remembered user', error);
        }
      }

      const storedAttempts = localStorage.getItem('admin_login_attempts');
      if (storedAttempts) {
        setLoginAttempts(parseInt(storedAttempts, 10) || 0);
      }

      const lockedUntil = localStorage.getItem('admin_locked_until');
      if (lockedUntil) {
        const lockTime = parseInt(lockedUntil, 10);
        const now = Date.now();

        if (now < lockTime) {
          setIsLocked(true);
          setLockRemainingTime(Math.ceil((lockTime - now) / 1000));

          const interval = setInterval(() => {
            setLockRemainingTime(prev => {
              if (prev <= 1) {
                setIsLocked(false);
                clearInterval(interval);
                localStorage.removeItem('admin_locked_until');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(interval);
        } else {
          localStorage.removeItem('admin_locked_until');
        }
      }
    } catch (error) {
      console.error('Error initializing login page:', error);
    }
  }, [isInitialized, isMounted]);

  useEffect(() => {
    if (!isMounted || !isInitialized) return;

    if (isAuthenticated) {
      setRedirecting(true);
      window.location.href = '/admin';
    }
  }, [isAuthenticated, isInitialized, isMounted]);

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

  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;
    setIsLoading(true);

    const success = await login(email, password);

    setIsLoading(false);

    if (!success) {
      toast({
        title: '로그인 실패',
        description: error || '아이디 또는 비밀번호를 다시 확인해주세요.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: '로그인 성공',
        description: '관리자 페이지로 이동합니다.',
      });
    }
  };

  if (!isMounted || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-blue-500 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">인증 성공!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">관리자 페이지로 이동 중입니다...</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <Image
              src="/images/logo.svg"
              alt="ECHOIT 로고"
              width={180}
              height={50}
              className="mx-auto mb-2"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">관리자 로그인</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              관리자 계정으로 로그인하세요
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 flex items-start">
              <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  로그인 정보 저장
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-white transition-colors
              ${isLoading || isLocked ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
              disabled={isLoading || isLocked}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : isLocked ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  {formatRemainingTime(lockRemainingTime)} 후 시도 가능
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  로그인
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            © 2025 ECHOIT. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
