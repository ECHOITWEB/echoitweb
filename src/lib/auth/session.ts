/**
 * 세션 관리 유틸리티
 *
 * 브라우저 환경에서 인증 토큰을 안전하게 저장/관리
 */

// 세션 키 (상수)
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// 세션 데이터 인터페이스
interface SessionData {
  accessToken: string;
  refreshToken: string;
}

/**
 * 현재 세션 데이터 가져오기
 * @returns 세션 데이터 (토큰 정보) 또는 null
 */
export function getSession(): SessionData | null {
  try {
    if (typeof window === 'undefined') {
      return null; // 서버 측에서는 세션 없음
    }

    // localStorage에서 토큰 데이터 가져오기 (sessionStorage 대신)
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    // 토큰이 없거나 만료되었는지 확인
    if (!token || !refreshToken || isTokenExpired()) {
      return null;
    }

    return {
      accessToken: token,
      refreshToken: refreshToken
    };
  } catch (error) {
    console.error('세션 가져오기 오류:', error);
    return null;
  }
}

/**
 * 세션 설정 (로그인 시)
 * @param data 세션 데이터 (토큰 정보)
 * @param expiryMs 토큰 만료 시간 (밀리초)
 */
export function setSession(data: SessionData, expiryMs: number = 3600000): void {
  try {
    if (typeof window === 'undefined') {
      return; // 서버 측에서는 실행하지 않음
    }

    // 유효성 검사
    if (!data || !data.accessToken || !data.refreshToken) {
      throw new Error('유효하지 않은 세션 데이터');
    }

    // 토큰 저장 (localStorage 사용)
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    
    // 만료 시간 설정 (현재 시간 + 만료 시간)
    const expiry = Date.now() + expiryMs;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    
    console.log('세션 설정 완료. 만료 시간:', new Date(expiry).toLocaleString());
  } catch (error) {
    console.error('세션 설정 오류:', error);
    // 오류 발생 시 세션 정리
    clearSession();
    throw error;
  }
}

/**
 * 세션 지우기 (로그아웃 시)
 */
export function clearSession(): void {
  try {
    if (typeof window === 'undefined') {
      return; // 서버 측에서는 실행하지 않음
    }

    // 모든 토큰 관련 데이터 삭제 (localStorage에서)
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    console.log('세션 정보가 삭제되었습니다.');
  } catch (error) {
    console.error('세션 삭제 오류:', error);
  }
}

/**
 * 로그인 상태 확인
 * @returns 로그인 상태 여부
 */
export function isLoggedIn(): boolean {
  try {
    const session = getSession();
    return !!session; // 세션이 있으면 로그인 상태
  } catch (error) {
    console.error('로그인 상태 확인 오류:', error);
    return false;
  }
}

/**
 * 토큰 만료 확인
 * @returns 토큰 만료 여부
 */
export function isTokenExpired(): boolean {
  try {
    if (typeof window === 'undefined') {
      return true; // 서버 측에서는 항상 만료됨
    }

    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) {
      return true; // 만료 정보 없으면 만료된 것으로 간주
    }

    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();
    
    // 현재 시간이 만료 시간을 지났는지 확인
    return now >= expiry;
  } catch (error) {
    console.error('토큰 만료 확인 오류:', error);
    return true; // 오류 발생 시 만료된 것으로 간주
  }
}

/**
 * 액세스 토큰 가져오기
 * @returns 액세스 토큰 또는 null
 */
export function getAccessToken(): string | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    
    // 만료 확인
    if (isTokenExpired()) {
      return null;
    }
    
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('액세스 토큰 가져오기 오류:', error);
    return null;
  }
}

/**
 * 리프레시 토큰 가져오기
 * @returns 리프레시 토큰 또는 null
 */
export function getRefreshToken(): string | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('리프레시 토큰 가져오기 오류:', error);
    return null;
  }
}
