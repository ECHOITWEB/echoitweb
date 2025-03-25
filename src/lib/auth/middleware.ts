import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt';
import { UserRole } from '../db/models';

// 인증된 요청을 위한 확장 인터페이스
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * 요청에서 bearer 토큰 추출
 * @param req 요청 객체
 * @returns 추출된 토큰 또는 null
 */
function extractTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // "Bearer " 이후의 문자열
}

/**
 * JWT 인증 미들웨어
 * @param req 요청 객체
 * @returns 응답 객체 또는 undefined
 */
export async function authMiddleware(req: AuthenticatedRequest): Promise<NextResponse | undefined> {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return NextResponse.json(
      { success: false, message: '인증 토큰이 필요합니다.' },
      { status: 401 }
    );
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    return NextResponse.json(
      { success: false, message: '유효하지 않거나 만료된 토큰입니다.' },
      { status: 401 }
    );
  }

  // 요청 객체에 사용자 정보 추가
  req.user = payload;

  // 미들웨어 통과 (다음 핸들러로 진행)
  return undefined;
}

/**
 * 특정 역할을 가진 사용자만 액세스 허용하는 미들웨어
 * @param req 요청 객체
 * @param allowedRoles 허용된 역할 목록
 * @returns 응답 객체 또는 undefined
 */
export async function requireRole(
  req: AuthenticatedRequest,
  allowedRoles: UserRole[]
): Promise<NextResponse | undefined> {
  // 먼저 인증 미들웨어 통과 확인
  const authResult = await authMiddleware(req);
  if (authResult) {
    return authResult; // 인증 실패 응답 반환
  }

  // 인증된 사용자 role 확인
  const userRole = req.user?.role;

  if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
    return NextResponse.json(
      { success: false, message: '이 작업을 수행할 권한이 없습니다.' },
      { status: 403 }
    );
  }

  // 권한 확인 통과 (다음 핸들러로 진행)
  return undefined;
}

/**
 * 관리자만 액세스 허용하는 미들웨어
 * @param req 요청 객체
 * @returns 응답 객체 또는 undefined
 */
export async function requireAdmin(
  req: AuthenticatedRequest
): Promise<NextResponse | undefined> {
  return requireRole(req, [UserRole.ADMIN]);
}

/**
 * 편집자 이상 권한만 액세스 허용하는 미들웨어
 * @param req 요청 객체
 * @returns 응답 객체 또는 undefined
 */
export async function requireEditor(
  req: AuthenticatedRequest
): Promise<NextResponse | undefined> {
  return requireRole(req, [UserRole.ADMIN, UserRole.EDITOR]);
}
