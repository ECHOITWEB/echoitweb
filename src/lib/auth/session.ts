/**
 * 세션 관리 유틸리티
 *
 * 브라우저 환경에서 인증 토큰을 안전하게 저장/관리
 */

// 세션 스토리지 키 상수
const AUTH_TOKEN_KEY = 'echoit_auth_token';

// 세션 인터페이스
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number; // 토큰 만료 시간 (선택 사항)
}

/**
 * 로컬 스토리지에서 세션 정보 가져오기
 */
export function getSession(): Session | null {
  // 서버 사이드에서는 항상 null 반환
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const sessionStr = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!sessionStr) {
      return null;
    }

    const session = JSON.parse(sessionStr) as Session;

    // 만료 시간이 있는 경우 만료 여부 확인
    if (session.expiresAt && Date.now() > session.expiresAt) {
      // 만료된 세션 삭제
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }

    return session;
  } catch (error) {
    console.error('세션 파싱 오류:', error);
    return null;
  }
}

/**
 * 로컬 스토리지에 세션 정보 저장
 */
export function setSession(session: Session, expiresInMs?: number): void {
  // 서버 사이드에서는 아무 동작 안함
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // 만료 시간 지정 (선택 사항)
    if (expiresInMs) {
      session.expiresAt = Date.now() + expiresInMs;
    }

    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('세션 저장 오류:', error);
  }
}

/**
 * 로컬 스토리지에서 세션 정보 삭제
 */
export function clearSession(): void {
  // 서버 사이드에서는 아무 동작 안함
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('세션 삭제 오류:', error);
  }
}

/**
 * 현재 세션의 토큰 만료까지 남은 시간 (밀리초)
 */
export function getTokenTimeRemaining(): number | null {
  const session = getSession();

  if (!session || !session.expiresAt) {
    return null;
  }

  const remaining = session.expiresAt - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * 로그인 상태 확인
 */
export function isLoggedIn(): boolean {
  return getSession() !== null;
}
