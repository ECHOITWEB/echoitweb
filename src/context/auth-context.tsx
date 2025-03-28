"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isLoggedIn, clearSession, setSession } from '@/lib/auth/session';
import apiClient from '@/lib/auth/api-client';
import { useRouter } from 'next/navigation';

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

// 로그인 응답 인터페이스
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserInfo;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

// API 응답 인터페이스
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// 사용자 정보가 포함된 API 응답
interface UserResponse {
  user: UserInfo;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 기본 상태로 초기화하여 하이드레이션 불일치 방지
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(defaultState.isAuthenticated);
  const [user, setUser] = useState<UserInfo | null>(defaultState.user);
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultState.isInitialized);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(defaultState.isLoading);
  const [error, setError] = useState<string | null>(defaultState.error);
  const router = useRouter();

  // 클라이언트 사이드 마운트 후 실행
  useEffect(() => {
    setMounted(true);
  }, []);

  // API 호출 실행 함수 - 재시도 로직 추가
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
        // 컴포넌트가 마운트되었고 브라우저 환경인지 확인
        if (!isMounted || !isBrowser) {
          setIsInitialized(true);
          return;
        }
        
        // 로컬 스토리지 토큰 확인
        if (isLoggedIn()) {
          setIsLoading(true);
          setError(null);
          console.log('기존 인증 확인: 토큰 존재');

          try {
            // 서버 API로 사용자 정보 조회 시도
            const response = await executeApiCall<UserResponse>(
              () => apiClient.get('/auth'), 
              2, // 최대 2회 재시도
              500 // 초기 지연 500ms
            );

            if (response?.success && response.data?.user) {
              console.log('사용자 정보 검증 성공:', response.data.user.username);
              setIsAuthenticated(true);
              setUser(response.data.user);
            } else {
              console.warn('토큰 있으나 사용자 정보 검증 실패');
              // 토큰이 유효하지 않으면 로그아웃
              clearSession();
              setIsAuthenticated(false);
              setUser(null);
            }
          } catch (error: any) {
            console.error('세션 검증 실패:', error.message);
            setError('세션 검증에 실패했습니다. 다시 로그인해주세요.');
            clearSession();
            setIsAuthenticated(false);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          console.log('인증 상태 없음: 로그인 필요');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error: any) {
        console.error('인증 초기화 실패:', error.message);
        setError('인증 초기화에 실패했습니다.');
        
        if (isBrowser) {
          clearSession();
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        setIsInitialized(true);
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
      const response = await executeApiCall<UserResponse>(() => apiClient.get('/auth'));

      if (response?.success && response?.data?.user) {
        setUser(response.data.user);
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
    // 상태 초기화
    setError('');
    setIsLoading(true);
    clearSession();
    
    try {
      console.log('로그인 시도 시작:', username);
      
      // 최대한 단순하게 요청 구성
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: username,
          password
        })
      });
      
      console.log('응답 상태 코드:', response.status);
      
      // 응답 텍스트 읽기
      const responseText = await response.text();
      console.log('응답 데이터 수신 완료, 길이:', responseText.length);
      
      // 빈 응답인지 확인
      if (!responseText || responseText.trim() === '') {
        console.error('빈 응답 데이터');
        throw new Error('서버에서 빈 응답이 반환되었습니다');
      }
      
      // 안전하게 JSON 파싱
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error('서버 응답을 처리할 수 없습니다');
      }
      
      // 응답 검증
      if (!data.success) {
        console.error('로그인 실패:', data.message);
        throw new Error(data.message || '로그인에 실패했습니다');
      }
      
      // 토큰 검증
      if (!data.tokens || !data.tokens.accessToken || !data.tokens.refreshToken) {
        console.error('유효하지 않은 토큰', data);
        throw new Error('인증 토큰이 잘못되었습니다');
      }
      
      // 세션 저장
      setSession({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken
      }, 24 * 60 * 60 * 1000); // 24시간
      
      console.log('토큰 저장 완료');
      
      // 사용자 정보 설정
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('사용자 정보 설정 완료:', data.user.username);
        
        // 라우팅은 login 함수에서 처리하지 않고 레이아웃 또는 페이지 컴포넌트에서 처리
        // router.push('/admin'); - 삭제
      } else {
        console.warn('사용자 정보 누락됨');
      }
      
      setIsLoading(false);
      return true;
      
    } catch (error: any) {
      console.error('로그인 오류:', error);
      setError(error.message || '로그인 중 오류가 발생했습니다');
      setIsLoading(false);
      clearSession();
      return false;
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
