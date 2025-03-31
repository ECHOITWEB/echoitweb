import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { User, UserRole } from '@/lib/db/models';
import { AuthenticatedRequest, requireAdmin } from '@/lib/auth/middleware';
import userService from '@/lib/services/user.service';

/**
 * 사용자 목록 조회 API - 관리자만 접근 가능
 */
export async function GET(req: NextRequest) {
  console.log('사용자 목록 API 호출됨');
  const authReq = req as AuthenticatedRequest;

  // 요청 헤더 로깅
  const authHeader = req.headers.get('authorization');
  console.log('인증 헤더:', authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : '없음');

  // 관리자 권한 체크
  const authResult = await requireAdmin(authReq);
  if (authResult) {
    console.error('관리자 권한 체크 실패:', authResult.status);
    return authResult; // 인증 또는 권한 오류 응답
  }

  try {
    console.log('사용자 서비스 호출 시작');
    // 통합된 userService 사용하여 모든 사용자 조회
    const users = await userService.getAllUsers();
    console.log(`사용자 ${users.length}명 조회 성공`);

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return NextResponse.json({
      success: false,
      message: '사용자 목록을 가져오는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 새 사용자 생성 API - 관리자만 접근 가능
 */
export async function POST(req: NextRequest) {
  console.log('사용자 생성 API 호출됨');
  const authReq = req as AuthenticatedRequest;

  // 관리자 권한 체크 (개발 모드에서는 건너뛸 수 있음)
  if (process.env.NODE_ENV !== 'development') {
    const authResult = await requireAdmin(authReq);
    if (authResult) {
      console.log('관리자 권한 체크 실패:', authResult.status);
      return authResult; // 인증 또는 권한 오류 응답
    }
  } else {
    console.log('개발 모드에서 관리자 권한 체크 건너뜀');
  }

  try {
    // 요청 본문 파싱
    let body;
    try {
      body = await req.json();
      console.log('요청 본문 파싱 성공:', body);
    } catch (error) {
      console.error('요청 본문 파싱 오류:', error);
      return NextResponse.json({
        success: false,
        message: '잘못된 요청 형식입니다.'
      }, { status: 400 });
    }
    
    // 필수 필드 검증
    const { username, email, password, name, role } = body;
    
    if (!username || !email || !password || !name || !role) {
      console.log('필수 필드 누락됨');
      return NextResponse.json({
        success: false,
        message: '모든 필수 필드를 입력해주세요.'
      }, { status: 400 });
    }

    // userService를 통해 사용자 생성
    const newUser = await userService.createUser({
      username,
      email,
      password,
      name,
      role,
      isActive: body.isActive !== false
    });

    console.log('새 사용자 생성 성공:', newUser.username);
    
    return NextResponse.json({
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      user: newUser
    });
  } catch (error: any) {
    console.error('사용자 생성 오류:', error);

    // 오류 메시지에 따른 HTTP 상태 코드 결정
    let statusCode = 500;
    let message = error.message || '사용자 생성 중 오류가 발생했습니다.';
    
    if (message.includes('이미 사용 중인 사용자 이름입니다') || 
        message.includes('이미 사용 중인 이메일 주소입니다')) {
      statusCode = 409; // Conflict
    } else if (message.includes('유효하지 않은 사용자 역할입니다')) {
      statusCode = 400; // Bad Request
    }

    return NextResponse.json({
      success: false,
      message
    }, { status: statusCode });
  }
}
