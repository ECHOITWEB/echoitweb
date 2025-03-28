/**
 * 인증 기능을 갖춘 API 클라이언트
 *
 * 토큰 자동 갱신, 인증 헤더 추가 등의 기능을 제공
 */

import { getSession, setSession, clearSession } from './session';

// API 베이스 URL
const API_BASE_URL = '/api';

// 최대 요청 타임아웃(ms)
const DEFAULT_TIMEOUT = 15000;

// API 응답 인터페이스
export interface ApiResponse<T = any> {
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
  private lastRefreshTime: number = 0; // 마지막 토큰 갱신 시간

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 공통 fetch 메서드
   */
  async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const session = getSession();

    // AbortController로 타임아웃 관리
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

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
      headers,
      signal: controller.signal
    };

    try {
      // 요청 실행
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // 토큰 만료 시 갱신 처리 (현재 시간이 마지막 갱신 후 10초 이상 지났을 때만)
      if (response.status === 401 && session?.refreshToken && Date.now() - this.lastRefreshTime > 10000) {
        // 이미 갱신 중이면 기존 프로미스 재사용
        if (this.isRefreshing) {
          const refreshed = await this.refreshPromise;
          if (!refreshed) {
            throw new Error('인증 세션이 만료되었습니다.');
          }
          // 토큰이 갱신된 요청 재시도
          return this.fetchWithAuth<T>(endpoint, options, timeout);
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
        return this.fetchWithAuth<T>(endpoint, options, timeout);
      }

      let data;
      try {
        // JSON 응답 파싱
        data = await response.json();
      } catch (parseError) {
        // JSON 파싱 오류 처리
        console.error('응답 파싱 오류:', parseError);
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }

      if (!response.ok) {
        throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
      }

      return data as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // AbortError 처리 (타임아웃)
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다.');
      }
      
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
      console.log('토큰 갱신 시도:', refreshToken.substring(0, 10) + '...');
      
      // AbortController로 타임아웃 관리
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 토큰 갱신은 5초로 제한
      
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('토큰 갱신 실패:', response.status, response.statusText);
        return false;
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('토큰 갱신 응답 파싱 오류:', parseError);
        return false;
      }
      
      console.log('토큰 갱신 응답:', data.success ? '성공' : '실패');

      if (data.success && data.tokens) {
        setSession({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken
        });
        this.lastRefreshTime = Date.now(); // 갱신 시간 기록
        console.log('새 토큰 저장 완료');
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
  async get<T>(endpoint: string, options: RequestInit = {}, timeout?: number): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'GET'
    }, timeout);
  }

  /**
   * POST 요청
   */
  async post<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {},
    timeout?: number
  ): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    }, timeout);
  }

  /**
   * PUT 요청
   */
  async put<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {},
    timeout?: number
  ): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    }, timeout);
  }

  /**
   * DELETE 요청
   */
  async delete<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout?: number
  ): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'DELETE'
    }, timeout);
  }
}

// API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient();

export default apiClient;
