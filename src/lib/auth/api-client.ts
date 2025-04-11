/**
 * 인증 기능을 갖춘 API 클라이언트
 *
 * 토큰 자동 갱신, 인증 헤더 추가 등의 기능을 제공
 */

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

function getSession(): { accessToken: string; refreshToken: string; expiry: number } | null {
  if (!isBrowser) return null;

  try {
    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    let refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    let expiry = localStorage.getItem(EXPIRY_KEY);

    if (!accessToken || !refreshToken || !expiry) {
      accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
      expiry = sessionStorage.getItem(EXPIRY_KEY);
    }

    // ✅ 쿠키에서 accessToken fallback
    if ((!accessToken || !refreshToken) && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('echoit_auth_token='));
      if (tokenCookie) {
        accessToken = tokenCookie.split('=')[1];
        refreshToken = ''; // 쿠키에는 refreshToken 없음
        expiry = (Date.now() + 1000 * 60 * 60 * 24).toString(); // fallback으로 24시간
      }
    }

    if (!accessToken || !expiry) return null;

    return {
      accessToken,
      refreshToken: refreshToken || '',
      expiry: parseInt(expiry, 10),
    };
  } catch (error) {
    console.error('세션 정보 가져오기 실패:', error);
    return null;
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

const API_BASE_URL = '/api';
const DEFAULT_TIMEOUT = 15000;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  private lastRefreshTime: number = 0;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const session = getSession();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (response.status === 401 && session?.refreshToken && Date.now() - this.lastRefreshTime > 10000) {
        if (this.isRefreshing) {
          const refreshed = await this.refreshPromise;
          if (!refreshed) throw new Error('인증 세션이 만료되었습니다.');
          return this.fetchWithAuth<T>(endpoint, options, timeout);
        }

        this.isRefreshing = true;
        this.refreshPromise = this.refreshToken(session.refreshToken);

        const refreshed = await this.refreshPromise;
        this.isRefreshing = false;
        this.refreshPromise = null;

        if (!refreshed) throw new Error('인증 세션이 만료되었습니다.');
        return this.fetchWithAuth<T>(endpoint, options, timeout);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('응답 파싱 오류:', parseError);
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }

      if (!response.ok) {
        throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
      }

      return data as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다.');
      }

      if (error.message === '인증 세션이 만료되었습니다.') {
        clearSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }

      throw error;
    }
  }

  private async refreshToken(refreshToken: string): Promise<boolean> {
    try {
      console.log('토큰 갱신 시도:', refreshToken.substring(0, 10) + '...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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

      if (data.success && data.tokens) {
        setSession({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken
        });
        this.lastRefreshTime = Date.now();
        console.log('새 토큰 저장 완료');
        return true;
      }

      return false;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return false;
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}, timeout?: number): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'GET'
    }, timeout);
  }

  async post<T>(endpoint: string, data: any, options: RequestInit = {}, timeout?: number): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    }, timeout);
  }

  async put<T>(endpoint: string, data: any, options: RequestInit = {}, timeout?: number): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    }, timeout);
  }

  async delete<T>(endpoint: string, options: RequestInit = {}, timeout?: number): Promise<ApiResponse<T>> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'DELETE'
    }, timeout);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
