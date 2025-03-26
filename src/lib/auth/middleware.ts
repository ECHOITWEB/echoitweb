import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt';
import { UserRole } from '../db/models';
import { getToken } from 'next-auth/jwt';
import { User, IUser } from '@/lib/db/models/User';
import { connectToDatabase } from '@/lib/db/connect';

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
 * @returns 사용자 객체 또는 null
 */
export async function requireEditor(req: NextRequest): Promise<IUser | null> {
  try {
    // 1. 토큰 추출 및 검증
    const token = extractTokenFromRequest(req as NextRequest);
    if (!token) {
      console.log('토큰이 존재하지 않음');
      return null;
    }
    
    const payload = verifyAccessToken(token);
    if (!payload) {
      console.log('토큰 검증 실패');
      return null;
    }
    
    console.log('토큰 페이로드:', JSON.stringify(payload));
    console.log('사용자 ID:', payload.userId, '역할:', payload.role);
    
    // 2. 데이터베이스에서 사용자 조회
    await connectToDatabase();
    const user = await User.findById(payload.userId);
    
    if (!user) {
      console.log('DB에서 사용자를 찾을 수 없음:', payload.userId);
      return null;
    }
    
    console.log('DB 사용자 정보:', user.username, 'role:', user.role, 'roles:', user.roles);
    
    // 3. 관리자 권한 확인 (username이 'admin'이면 항상 허용)
    if (user.username === 'admin') {
      console.log('관리자 사용자 확인됨:', user.username);
      return user;
    }
    
    // 4. role 필드 확인 (admin 또는 editor)
    if (user.role === 'admin' || user.role === 'editor') {
      console.log('권한 있음(role):', user.role);
      return user;
    }
    
    // 5. roles 배열 확인
    if (user.roles && Array.isArray(user.roles)) {
      if (user.roles.includes('admin') || user.roles.includes('editor')) {
        console.log('권한 있음(roles):', user.roles);
        return user;
      }
    }
    
    // 권한 없음
    console.log('권한 없음. 사용자:', user.username, '역할:', user.role, user.roles);
    return null;
  } catch (error) {
    console.error('권한 체크 중 오류:', error);
    return null;
  }
}
