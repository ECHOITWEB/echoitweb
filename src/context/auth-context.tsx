"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/auth/api-client';
import { useRouter } from 'next/navigation';

const isBrowser = typeof window !== 'undefined';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRY_KEY = 'tokenExpiry';

function setSession(tokens: { accessToken: string; refreshToken: string }, expiryMs = 30 * 24 * 60 * 60 * 1000) {
  if (!isBrowser) return;
  const expiry = Date.now() + expiryMs;

  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(EXPIRY_KEY, expiry.toString());

    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    sessionStorage.setItem(EXPIRY_KEY, expiry.toString());

    console.log(`토큰 저장 완료 - 만료: ${new Date(expiry).toLocaleString()}`);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
}

function clearSession() {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);

    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
  } catch (error) {
    console.error('세션 삭제 실패:', error);
  }
}

function isLoggedIn(): boolean {
  if (!isBrowser) return false;

  try {
    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    let expiry = localStorage.getItem(EXPIRY_KEY);

    if (!accessToken || !expiry) {
      accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      expiry = sessionStorage.getItem(EXPIRY_KEY);
    }

    if (!accessToken || !expiry) return false;

    const expiryTime = parseInt(expiry, 10);
    return Date.now() < expiryTime;
  } catch (error) {
    console.error('로그인 상태 확인 오류:', error);
    return false;
  }
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  lastLogin?: Date;
}

type AuthContextType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: UserInfo | null;
  refreshUserInfo: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  isLoading: false,
  error: null
};

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

interface LoginResponse {
  success: boolean;
  message: string;
  data?: { user: UserInfo };
  tokens?: { accessToken: string; refreshToken: string };
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface UserResponse {
  user: UserInfo;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(defaultState.isAuthenticated);
  const [user, setUser] = useState<UserInfo | null>(defaultState.user);
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultState.isInitialized);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(defaultState.isLoading);
  const [error, setError] = useState<string | null>(defaultState.error);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const executeApiCall = useCallback(async <T,>(
    apiCall: () => Promise<ApiResponse<T>>,
    maxRetries = MAX_RETRY_COUNT,
    delay = RETRY_DELAY
  ): Promise<ApiResponse<T> | null> => {
    let retries = 0;

    const attempt = async (): Promise<ApiResponse<T> | null> => {
      try {
        return await apiCall();
      } catch (error: any) {
        if (retries < maxRetries) {
          retries++;
          console.log(`API 호출 실패, ${retries}번째 재시도 중...`);
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, retries - 1)));
          return attempt();
        } else {
          setError(`서버 연결 오류: ${error.message}`);
          console.error('재시도 실패:', error);
          return null;
        }
      }
    };

    return attempt();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const initAuth = async () => {
      try {
        if (!isBrowser) return;

        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const expiry = localStorage.getItem('tokenExpiry') || sessionStorage.getItem('tokenExpiry');
        const now = Date.now();

        console.log('🧪 [initAuth] 브라우저 환경:', isBrowser);
        console.log('🧪 [initAuth] accessToken:', accessToken);
        console.log('🧪 [initAuth] expiry:', expiry);
        console.log('🧪 [initAuth] 현재 시간:', now);
        console.log('🧪 [initAuth] isLoggedIn():', isLoggedIn());

        if (isLoggedIn()) {
          setIsLoading(true);
          setError(null);
          console.log('토큰 존재: 인증 시도 중');

          const response = await executeApiCall<UserResponse>(() => apiClient.get('/auth'), 2, 500);

          if (response?.success && response.data?.user) {
            setIsAuthenticated(true);
            setUser(response.data.user);
          } else {
            clearSession();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error: any) {
        console.error('인증 초기화 실패:', error);
        clearSession();
        setIsAuthenticated(false);
        setUser(null);
        setError('인증 초기화 실패');
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [mounted, executeApiCall]);

  const refreshUserInfo = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await executeApiCall<UserResponse>(() => apiClient.get('/auth'));
      if (response?.success && response?.data?.user) {
        setUser(response.data.user);
      }
    } catch (error: any) {
      console.error('사용자 정보 갱신 실패:', error);
      setError('사용자 정보 갱신에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setError('');
    setIsLoading(true);
    clearSession();
  
    try {
      console.log('🟡 로그인 요청 시작:', username);
  
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });
  
      console.log('🟡 응답 상태 코드:', response.status);
  
      const responseText = await response.text();
      console.log('🟡 응답 텍스트 길이:', responseText.length);
  
      if (!responseText.trim()) throw new Error('서버 응답 없음');
  
      const data: LoginResponse = JSON.parse(responseText);
  
      // 👉 로그인 응답 확인
      console.log('🧪 로그인 응답 전체:', data);
      console.log('🧪 로그인 응답 tokens:', data.tokens);
      console.log('🧪 accessToken:', data.tokens?.accessToken);
      console.log('🧪 refreshToken:', data.tokens?.refreshToken);
      console.log('🧪 user:', data.data?.user);
  
      if (data.success && data.tokens && data.data?.user) {
        console.log('🟢 조건 통과: 토큰 저장 시도');
        setSession(data.tokens, 30 * 24 * 60 * 60 * 1000); // 30일
        setUser(data.data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        console.log('✅ 로그인 성공: 대시보드로 이동');
        router.push('/admin/dashboard');
        return true;
      } else {
        console.warn('⚠️ 로그인 실패:', data.message);
        setError(data.message || '로그인 실패');
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('❌ 로그인 중 오류 발생:', error);
      //로그 추가
      console.error('❌ 오류 전체 내용:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      setError(error.message || '로그인 중 오류 발생');
      setIsLoading(false);
      return false;
    }
  };  

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isInitialized,
      login,
      logout,
      user,
      refreshUserInfo,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
