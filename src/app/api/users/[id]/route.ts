import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User, UserRole } from '@/lib/db/models';
import { AuthenticatedRequest, requireAdmin } from '@/lib/auth/middleware';

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

    // 데이터베이스 연결
    await connectToDatabase();

    // 사용자 조회 (비밀번호 제외)
    const user = await User.findById(id).select('-password');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return NextResponse.json({
      success: false,
      message: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
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
    const body = await req.json();

    // 데이터베이스 연결
    await connectToDatabase();

    // 대상 사용자 조회
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 기본 관리자('admin' 사용자)의 역할 변경 방지
    if (user.username === 'admin' && body.role && body.role !== UserRole.ADMIN) {
      return NextResponse.json({
        success: false,
        message: '기본 관리자의 역할은 변경할 수 없습니다.'
      }, { status: 403 });
    }

    // 이메일 중복 확인
    if (body.email && body.email !== user.email) {
      const existingUser = await User.findOne({
        email: body.email,
        _id: { $ne: id }
      });

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: '이미 사용 중인 이메일 주소입니다.'
        }, { status: 409 });
      }
    }

    // 허용된 필드만 업데이트
    const allowedFields = ['name', 'email', 'role', 'isActive'];
    const updateData: any = {};

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // 비밀번호가 제공된 경우 업데이트
    if (body.password && body.password.trim() !== '') {
      updateData.password = body.password;
    }

    // 사용자 정보 업데이트
    Object.assign(user, updateData);
    await user.save();

    return NextResponse.json({
      success: true,
      message: '사용자 정보가 업데이트되었습니다.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    console.error('사용자 업데이트 오류:', error);

    // MongoDB 유효성 검사 오류 처리
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');

      return NextResponse.json({
        success: false,
        message: `유효성 검사 오류: ${errorMessage}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: '사용자 정보 업데이트 중 오류가 발생했습니다.'
    }, { status: 500 });
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

    // 데이터베이스 연결
    await connectToDatabase();

    // 대상 사용자 조회
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 기본 관리자('admin' 사용자) 삭제 방지
    if (user.username === 'admin') {
      return NextResponse.json({
        success: false,
        message: '기본 관리자 계정은 삭제할 수 없습니다.'
      }, { status: 403 });
    }

    // 요청한 관리자가 자신을 삭제하려는 것 방지
    if (authReq.user?.userId === id) {
      return NextResponse.json({
        success: false,
        message: '자기 자신을 삭제할 수 없습니다.'
      }, { status: 403 });
    }

    // 다른 관리자를 삭제하려는 경우, 요청자가 관리자인지 확인
    if (user.role === UserRole.ADMIN && authReq.user?.role !== UserRole.ADMIN) {
      return NextResponse.json({
        success: false,
        message: '다른 관리자를 삭제할 권한이 없습니다.'
      }, { status: 403 });
    }

    // 사용자 삭제
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      message: '사용자 삭제 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
