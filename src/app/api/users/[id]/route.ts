import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest, requireAdmin } from '@/lib/auth/middleware';
import userService from '@/lib/services/user.service';

/**
 * 특정 사용자 조회 API - 관리자만 접근 가능
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authReq = req as AuthenticatedRequest;

  // 관리자 권한 체크
  const authResult = await requireAdmin(authReq);
  if (authResult) {
    return authResult;
  }

  try {
    const { id } = params;

    // userService를 통해 사용자 조회
    const user = await userService.findById(id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 안전한 사용자 객체 생성하여 반환
    const safeUser = userService.createSafeUser(user);

    return NextResponse.json({
      success: true,
      user: safeUser
    });
  } catch (error: any) {
    console.error('사용자 조회 오류:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '사용자 정보를 가져오는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 사용자 정보 업데이트 API - 관리자만 접근 가능
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authReq = req as AuthenticatedRequest;

  // 관리자 권한 체크
  const authResult = await requireAdmin(authReq);
  if (authResult) {
    return authResult;
  }

  try {
    const { id } = params;
    const requestBody = await req.json();

    // userService를 통해 사용자 정보 업데이트
    const updatedUser = await userService.updateUser(id, {
      email: requestBody.email,
      name: requestBody.name,
      role: requestBody.role,
      isActive: requestBody.isActive,
      password: requestBody.password
    });

    return NextResponse.json({
      success: true,
      message: '사용자 정보가 업데이트되었습니다.',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('사용자 업데이트 오류:', error);

    // 오류 메시지에 따른 HTTP 상태 코드 결정
    let statusCode = 500;
    if (error.message.includes('사용자를 찾을 수 없습니다')) {
      statusCode = 404;
    } else if (error.message.includes('기본 관리자의 역할은 변경할 수 없습니다')) {
      statusCode = 403;
    } else if (error.message.includes('이미 사용 중인 이메일 주소입니다')) {
      statusCode = 409;
    } else if (error.message.includes('유효하지 않은 사용자 역할입니다')) {
      statusCode = 400;
    }

    return NextResponse.json({
      success: false,
      message: error.message || '사용자 정보 업데이트 중 오류가 발생했습니다.'
    }, { status: statusCode });
  }
}

/**
 * 사용자 삭제 API - 관리자만 접근 가능
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authReq = req as AuthenticatedRequest;

  // 관리자 권한 체크
  const authResult = await requireAdmin(authReq);
  if (authResult) {
    return authResult;
  }

  try {
    const { id } = params;
    const requesterId = authReq.user?.userId || '';

    // userService를 통해 사용자 삭제
    await userService.deleteUser(id, requesterId);

    return NextResponse.json({
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.'
    });
  } catch (error: any) {
    console.error('사용자 삭제 오류:', error);

    // 오류 메시지에 따른 HTTP 상태 코드 결정
    let statusCode = 500;
    if (error.message.includes('사용자를 찾을 수 없습니다')) {
      statusCode = 404;
    } else if (
      error.message.includes('기본 관리자 계정은 삭제할 수 없습니다') ||
      error.message.includes('자기 자신을 삭제할 수 없습니다') ||
      error.message.includes('사용자 삭제 권한이 없습니다') ||
      error.message.includes('다른 관리자를 삭제할 권한이 없습니다')
    ) {
      statusCode = 403;
    }

    return NextResponse.json({
      success: false,
      message: error.message || '사용자 삭제 중 오류가 발생했습니다.'
    }, { status: statusCode });
  }
}
