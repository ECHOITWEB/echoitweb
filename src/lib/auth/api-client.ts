/**
 * 인증 기능을 갖춘 API 클라이언트
 *
 * 토큰 자동 갱신, 인증 헤더 추가 등의 기능을 제공
 */

import { getSession, setSession, clearSession } from './session';

// API 베이스 URL
const API_BASE_URL = '/api';

// API 응답 인터페이스
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// 토큰 응답 인터페이스
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * API 요청 인터셉터
 * - 요청에 인증 토큰을 추가
 * - 401 에러 시 토큰 갱신 시도
 * - 토큰 갱신 실패 시 로그아웃 처리
 */
class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 공통 fetch 메서드
   */
  async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const session = getSession();

    // 기본 헤더 설정
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    // 인증 토큰이 있으면 헤더에 추가
    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }

    // 요청 옵션 설정
    const requestOptions: RequestInit = {
      ...options,
      headers
    };

    try {
      // 요청 실행
      const response = await fetch(url, requestOptions);

      // 토큰 만료 시 갱신 처리
      if (response.status === 401 && session?.refreshToken) {
        // 이미 갱신 중이면 기존 프로미스 재사용
        if (this.isRefreshing) {
          const refreshed = await this.refreshPromise;
          if (!refreshed) {
            throw new Error('인증 세션이 만료되었습니다.');
          }
          // 토큰이 갱신된 요청 재시도
          return this.fetchWithAuth<T>(endpoint, options);
        }

        // 토큰 갱신 시도
        this.isRefreshing = true;
        this.refreshPromise = this.refreshToken(session.refreshToken);

        const refreshed = await this.refreshPromise;
        this.isRefreshing = false;
        this.refreshPromise = null;

        if (!refreshed) {
          throw new Error('인증 세션이 만료되었습니다.');
        }

        // 토큰이 갱신된 요청 재시도
        return this.fetchWithAuth<T>(endpoint, options);
      }

      // JSON 응답 파싱
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
      }

      return data as ApiResponse<T>;
    } catch (error: any) {
      // 인증 에러 처리
      if (error.message === '인증 세션이 만료되었습니다.') {
        clearSession();
        // 로그인 페이지로 리디렉션 처리 (클라이언트 사이드에서만)
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }

      throw error;
    }
  }

  /**
   * 리프레시 토큰으로 액세스 토큰 갱신
   */
  private async refreshToken(refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (data.success && data.tokens) {
        setSession({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return false;
    }
  }

  /**
   * GET 요청
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * POST 요청
   */
  async post<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT 요청
   */
  async put<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}

// API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient();

export default apiClient;
