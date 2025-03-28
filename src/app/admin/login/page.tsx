"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { Eye, EyeOff, ShieldAlert, Lock, LogIn, Moon, Sun } from 'lucide-react';
import Cookies from 'js-cookie';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemainingTime, setLockRemainingTime] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle initialization of login page state
  useEffect(() => {
    if (!isMounted || !isInitialized) return;

    try {
      // Check if user has a preferred theme already
      const savedTheme = localStorage.getItem('admin_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }

      // Check for remembered username
      const rememberedUser = Cookies.get('admin_remember');
      if (rememberedUser) {
        try {
          const parsedUser = JSON.parse(rememberedUser);
          if (parsedUser.username) {
            setUsername(parsedUser.username);
            setRememberMe(true);
          }
        } catch (error) {
          console.error('Failed to parse remembered user', error);
        }
      }

      // Check if account is locked
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

          // Set up interval to count down
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
          // Lock period has expired
          localStorage.removeItem('admin_locked_until');
        }
      }
    } catch (error) {
      console.error('Error initializing login page:', error);
    }
  }, [isInitialized, isMounted]);

  // If already authenticated, redirect to admin home
  useEffect(() => {
    if (!isMounted || !isInitialized) return;

    if (isAuthenticated) {
      setRedirecting(true);
      // Use direct navigation to avoid React state issues
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

  // 로그인 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 계정 잠금 확인
    if (isLocked) {
      setError(`계정이 잠겼습니다. ${formatRemainingTime(lockRemainingTime)} 후에 다시 시도해주세요.`);
      return;
    }

    setIsLoggingIn(true);

    // 유효성 검사
    if (!username || !password) {
      setError('사용자 이름과 비밀번호를 입력해주세요.');
      setIsLoggingIn(false);
      return;
    }

    try {
      // API로 로그인 시도 (딜레이 시뮬레이션)
      setTimeout(async () => {
        try {
          const success = await login(username, password);

          if (success) {
            // 로그인 성공 시 처리
            if (rememberMe) {
              Cookies.set('admin_remember', JSON.stringify({ username }), {
                expires: 30, // 30일
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
              });
            } else {
              Cookies.remove('admin_remember');
            }

            // 로그인 시도 횟수 초기화
            setLoginAttempts(0);
            try {
              localStorage.removeItem('admin_login_attempts');
            } catch (error) {
              console.error('Error clearing login attempts:', error);
            }

            setRedirecting(true);
            
            // 세션 저장 및 라우팅 자체에 약간의 시간을 줍니다
            setTimeout(() => {
              try {
                // Next.js 라우터로 관리자 페이지로 이동
                router.push('/admin');
                
                // 라우터 이동이 실패하면 추가 백업 메커니즘 사용
                setTimeout(() => {
                  // 아직 로그인 페이지에 있다면 직접 URL 이동 시도
                  if (window.location.pathname.includes('/admin/login')) {
                    console.log('라우터 이동 실패, 페이지 직접 이동');
                    window.location.href = '/admin';
                  }
                }, 1500);
              } catch (navError) {
                console.error('페이지 이동 오류:', navError);
                // 라우터 에러 발생시 직접 URL로 이동
                window.location.href = '/admin';
              }
            }, 300);
          } else {
            // 로그인 실패 처리
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            try {
              localStorage.setItem('admin_login_attempts', newAttempts.toString());

              // 5회 실패 시 계정 잠금
              if (newAttempts >= 5) {
                const lockPeriod = 2 * 60 * 1000; // 2분
                const lockUntil = Date.now() + lockPeriod;
                localStorage.setItem('admin_locked_until', lockUntil.toString());

                setIsLocked(true);
                setLockRemainingTime(lockPeriod / 1000);
                setError(`로그인 시도가 너무 많습니다. 계정이 2분 동안 잠겼습니다.`);
              } else {
                setError(`사용자 이름 또는 비밀번호가 올바르지 않습니다. (남은 시도: ${5 - newAttempts}회)`);
              }
            } catch (error) {
              console.error('Error updating login attempts:', error);
              setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
            }

            setPassword('');
          }
        } catch (error) {
          console.error('Login error:', error);
          setError('로그인 처리 중 오류가 발생했습니다.');
        } finally {
          setIsLoggingIn(false);
        }
      }, 800);
    } catch (error) {
      setIsLoggingIn(false);
      setError('로그인 중 오류가 발생했습니다.');
      console.error('Login form error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading state while initialization
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
              계정 정보로 로그인하세요
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 flex items-start">
              <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                사용자 이름
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="사용자 이름 입력"
                disabled={isLoggingIn || isLocked}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                  placeholder="비밀번호 입력"
                  disabled={isLoggingIn || isLocked}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
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
              disabled={isLoggingIn || isLocked}
              className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-white transition-colors
              ${isLoggingIn || isLocked
                ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  로그인 중...
                </>
              ) : isLocked ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  {formatRemainingTime(lockRemainingTime)} 후 시도 가능
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
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
