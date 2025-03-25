"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isLoggedIn, clearSession, setSession } from '@/lib/auth/session';
import apiClient from '@/lib/auth/api-client';

// 사용자 역할 타입
export type UserRole = 'admin' | 'editor' | 'viewer';

// 사용자 정보 인터페이스
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  lastLogin?: Date;
}

// 인증 컨텍스트 타입
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

// 브라우저 환경 체크
const isBrowser = typeof window !== 'undefined';

// 서버 사이드 렌더링을 위한 기본 상태
const defaultState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  isLoading: false,
  error: null
};

// 재시도 최대 횟수
const MAX_RETRY_COUNT = 3;
// 재시도 지연 시간 (ms)
const RETRY_DELAY = 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 기본 상태로 초기화하여 하이드레이션 불일치 방지
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(defaultState.isAuthenticated);
  const [user, setUser] = useState<UserInfo | null>(defaultState.user);
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultState.isInitialized);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(defaultState.isLoading);
  const [error, setError] = useState<string | null>(defaultState.error);

  // 클라이언트 사이드 마운트 후 실행
  useEffect(() => {
    setMounted(true);
  }, []);

  // API 호출 실행 함수 - 재시도 로직 추가
  const executeApiCall = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    maxRetries = MAX_RETRY_COUNT,
    delay = RETRY_DELAY
  ): Promise<T | null> => {
    let retries = 0;

    const attempt = async (): Promise<T | null> => {
      try {
        return await apiCall();
      } catch (error: any) {
        if (retries < maxRetries) {
          retries++;
          console.log(`API 호출 실패, ${retries}번째 재시도 중... (${error.message || '알 수 없는 오류'})`);

          // 지수 백오프 적용 - 재시도마다 대기 시간 증가
          const waitTime = delay * Math.pow(2, retries - 1);
          await new Promise(resolve => setTimeout(resolve, waitTime));

          return attempt();
        } else {
          setError(`서버 연결에 문제가 있습니다: ${error.message || '알 수 없는 오류'}`);
          console.error('최대 재시도 횟수 초과:', error);
          return null;
        }
      }
    };

    return attempt();
  }, []);

  // 인증 상태 초기화
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (!mounted) return;

    let isMounted = true;

    // 기존 인증 확인
    const initAuth = async () => {
      try {
        // 로컬 스토리지에서 토큰 확인
        if (isBrowser && isLoggedIn()) {
          setIsLoading(true);
          setError(null);

          try {
            // 서버 API로 사용자 정보 조회
            const response = await executeApiCall(() => apiClient.get('/auth'));

            if (response?.success && response.user) {
              setIsAuthenticated(true);
              setUser(response.user);
            } else {
              // 토큰이 유효하지 않으면 로그아웃
              clearSession();
            }
          } catch (error: any) {
            console.error('Failed to verify session:', error);
            setError('세션 검증에 실패했습니다. 다시 로그인해주세요.');
            clearSession();
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error: any) {
        console.error('Failed to initialize auth:', error);
        setError('인증 초기화에 실패했습니다.');
        if (isBrowser) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [mounted, executeApiCall]);

  // 사용자 정보 갱신
  const refreshUserInfo = async (): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await executeApiCall(() => apiClient.get('/auth'));

      if (response?.success && response.user) {
        setUser(response.user);
      }
    } catch (error: any) {
      console.error('Failed to refresh user info:', error);
      setError('사용자 정보 갱신에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 함수 - 서버 API 사용
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // apiClient를 사용하여 일관된 API 호출
      const response = await executeApiCall(() =>
        apiClient.post('/auth', { username, password })
      );

      if (response?.success) {
        setIsAuthenticated(true);
        setUser(response.user);

        // 세션 저장 - JWT 토큰
        setSession({
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken
        });

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setError(null);

    if (isBrowser) {
      clearSession();
    }
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
