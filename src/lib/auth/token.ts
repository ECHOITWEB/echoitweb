// 토큰을 가져오는 함수
export async function getToken(): Promise<string> {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    return '';
  }

  // 세션 스토리지에서 먼저 확인
  let token = sessionStorage.getItem('token');
  
  // 세션 스토리지에 없으면 로컬 스토리지 확인
  if (!token) {
    token = localStorage.getItem('token');
  }

  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  return token;
}

// 토큰을 저장하는 함수
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem('accessToken', token);
  localStorage.setItem('accessToken', token);
}

// 토큰을 제거하는 함수
export function removeToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 세션 스토리지와 로컬 스토리지 모두에서 제거
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
} 