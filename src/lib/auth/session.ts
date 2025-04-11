/**
 * 세션 관리 유틸리티
 *
 * 브라우저 환경에서 인증 토큰을 안전하게 저장/관리
 */

// 브라우저 환경 확인
const isBrowser = typeof window !== 'undefined';

// 세션 키
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRY_KEY = 'tokenExpiry';

/**
 * 세션 설정 함수 - 토큰을 localStorage와 sessionStorage에 저장
 * @param {Object} tokens - 액세스 토큰과 리프레시 토큰 객체
 * @param {number} expiryMs - 만료 시간 (밀리초)
 */
export function setSession(tokens: { accessToken: string; refreshToken: string }, expiryMs = 30 * 24 * 60 * 60 * 1000) {
  if (!isBrowser) return;

  const expiry = Date.now() + expiryMs;

  try {
    // 로컬 스토리지에 저장 (우선 저장)
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(EXPIRY_KEY, expiry.toString());

    // 세션 스토리지에도 백업으로 저장
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    sessionStorage.setItem(EXPIRY_KEY, expiry.toString());

    console.log(`토큰 저장 완료 - 만료: ${new Date(expiry).toLocaleString()}`);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
}

/**
 * 세션 정보 가져오기
 * @returns {{accessToken: string, refreshToken: string, expiry: number} | null} 세션 정보
 */
export function getSession(): { accessToken: string; refreshToken: string; expiry: number } | null {
  if (!isBrowser) return null;

  try {
    // 로컬 스토리지에서 먼저 확인
    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    let refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    let expiry = localStorage.getItem(EXPIRY_KEY);
    
    // 로컬 스토리지에 없으면 세션 스토리지 확인
    if (!accessToken || !refreshToken || !expiry) {
      accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
      expiry = sessionStorage.getItem(EXPIRY_KEY);
    }
    
    // 필요한 정보가 없으면 세션 없음
    if (!accessToken || !refreshToken || !expiry) {
      return null;
    }
    
    return {
      accessToken,
      refreshToken,
      expiry: parseInt(expiry, 10)
    };
  } catch (error) {
    console.error('세션 정보 가져오기 실패:', error);
    return null;
  }
}

/**
 * 세션 삭제 함수
 */
export function clearSession() {
  if (!isBrowser) return;

  try {
    // 로컬 스토리지에서 제거
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);

    // 세션 스토리지에서 제거
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
  } catch (error) {
    console.error('세션 삭제 실패:', error);
  }
}

/**
 * 로그인 상태 확인 함수
 * @returns {boolean} 로그인 상태
 */
export function isLoggedIn(): boolean {
  if (!isBrowser) return false;

  try {
    // 첫 번째로 로컬 스토리지 확인
    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    let expiry = localStorage.getItem(EXPIRY_KEY);
    
    // 로컬 스토리지에 없으면 세션 스토리지 확인
    if (!accessToken || !expiry) {
      accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      expiry = sessionStorage.getItem(EXPIRY_KEY);
    }

    // 토큰이 없으면 로그인 안 됨
    if (!accessToken || !expiry) return false;

    // 만료 시간이 현재보다 이후인지 확인
    const expiryTime = parseInt(expiry, 10);
    const now = Date.now();
    
    // 만료 10분 전에 자동 재갱신 로직 트리거 (추후 구현)
    if (expiryTime - now < 10 * 60 * 1000) {
      console.log('토큰 만료가 얼마 남지 않았습니다. 곧 자동 갱신 진행 예정');
      // TODO: 리프레시 토큰 사용하여 자동 갱신 로직 추가
    }

    return expiryTime > now;
  } catch (error) {
    console.error('로그인 상태 확인 중 오류:', error);
    return false;
  }
}

/**
 * 액세스 토큰 가져오기
 * @returns {string|null} 액세스 토큰
 */
export function getAccessToken(): string | null {
  if (!isBrowser) return null;

  try {
    // 먼저 로컬 스토리지 확인
    let token = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    // 로컬 스토리지에 없으면 세션 스토리지 확인
    if (!token) {
      token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    }
    
    return token;
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return null;
  }
}

/**
 * 리프레시 토큰 가져오기
 * @returns {string|null} 리프레시 토큰
 */
export function getRefreshToken(): string | null {
  if (!isBrowser) return null;

  try {
    // 먼저 로컬 스토리지 확인
    let token = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    // 로컬 스토리지에 없으면 세션 스토리지 확인
    if (!token) {
      token = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    }
    
    return token;
  } catch (error) {
    console.error('리프레시 토큰 가져오기 실패:', error);
    return null;
  }
}
