import { NextRequest, NextResponse } from 'next/server';

// middleware
// Request나 Response를 가로채어 특정 작업을 수행해주는 역할
// 사용자 인증/접근제어, 요청 로깅, 리다이렉션 등의 작업 수행 가능
// 지금은 Request 만 처리하는 로직 밖에 없음

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 캐싱 및 성능 최적화를 위한 헤더 설정
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션 환경에서는 적극적인 캐싱 사용
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
  } else {
    // 개발 환경에서는 No-Store로 설정하여 항상 최신 내용 표시
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }

  // CORS 헤더 설정
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // 보안 헤더 설정
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 성능 향상을 위한 헤더
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  return response;
}

// 성능 측정을 위한 리포팅 설정
export const config = {
  matcher: [
    /*
     * Admin 페이지 최적화 매처 패턴 설정:
     * - 정적 파일 제외 (images, font, favicon 등)
     * - API 라우트 포함 (API 결과를 캐싱하기 위해)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)',
    '/api/:path*',
  ],
}; 