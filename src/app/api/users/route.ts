import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User, UserRole } from '@/lib/db/models';
import { AuthenticatedRequest, requireAdmin } from '@/lib/auth/middleware';

/**
 * 사용자 목록 조회 API - 관리자만 접근 가능
 */
export async function GET(req: NextRequest) {
  const authReq = req as AuthenticatedRequest;

  // 관리자 권한 체크
  const authResult = await requireAdmin(authReq);
  if (authResult) {
    return authResult; // 인증 또는 권한 오류 응답
  }

  try {
    // 데이터베이스 연결
    await connectToDatabase();

    // 사용자 목록 조회 (비밀번호 제외)
    const users = await User.find().select('-password').sort({ role: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
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
  const authReq = req as AuthenticatedRequest;

  // 관리자 권한 체크
  const authResult = await requireAdmin(authReq);
  if (authResult) {
    return authResult; // 인증 또는 권한 오류 응답
  }

  try {
    const body = await req.json();
    const { username, email, password, name, role } = body;

    // 필수 필드 검증
    if (!username || !email || !password || !name || !role) {
      return NextResponse.json({
        success: false,
        message: '모든 필수 필드를 입력해주세요.'
      }, { status: 400 });
    }

    // 역할 유효성 검증
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 사용자 역할입니다.'
      }, { status: 400 });
    }

    // 데이터베이스 연결
    await connectToDatabase();

    // 사용자 이름 중복 확인
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: existingUser.username === username
          ? '이미 사용 중인 사용자 이름입니다.'
          : '이미 사용 중인 이메일 주소입니다.'
      }, { status: 409 });
    }

    // 새 사용자 생성
    const newUser = new User({
      username,
      email,
      password, // 모델에서 저장 전에 자동으로 해시됨
      name,
      role,
      isActive: true
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });
  } catch (error: any) {
    console.error('사용자 생성 오류:', error);

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
      message: '사용자 생성 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
