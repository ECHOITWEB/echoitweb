import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User, UserRole } from '@/lib/db/models';
import { generateTokens, extractUserAuthInfo, verifyRefreshToken, verifyAccessToken } from '@/lib/auth/jwt';

/**
 * 로그인 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: '사용자 이름과 비밀번호를 모두 입력해주세요.'
      }, { status: 400 });
    }

    try {
      // 데이터베이스 연결
      await connectToDatabase();
    } catch (dbError) {
      console.error('데이터베이스 연결 오류:', dbError);
      return NextResponse.json({
        success: false,
        message: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 500 });
    }

    // 사용자 조회
    let user = await User.findOne({ username });

    // 최초 실행 시에는 기본 관리자 계정이 없으면 생성
    if (!user && username === 'admin') {
      const newUser = new User({
        username: 'admin',
        email: 'admin@echoit.co.kr',
        password: 'echoit1111@',
        name: '관리자',
        role: UserRole.ADMIN
      });

      try {
        user = await newUser.save();
      } catch (saveError) {
        console.error('관리자 계정 생성 오류:', saveError);
        return NextResponse.json({
          success: false,
          message: '관리자 계정 생성 중 오류가 발생했습니다.'
        }, { status: 500 });
      }
    }

    // 사용자가 존재하는지 확인
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자 이름 또는 비밀번호가 올바르지 않습니다.'
      }, { status: 401 });
    }

    // 계정이 활성화되어 있는지 확인
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        message: '비활성화된 계정입니다. 관리자에게 문의하세요.'
      }, { status: 403 });
    }

    // 비밀번호 확인
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (passwordError) {
      console.error('비밀번호 검증 오류:', passwordError);
      return NextResponse.json({
        success: false,
        message: '비밀번호 검증 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: '사용자 이름 또는 비밀번호가 올바르지 않습니다.'
      }, { status: 401 });
    }

    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    try {
      await user.save();
    } catch (updateError) {
      console.error('로그인 시간 업데이트 오류:', updateError);
      // 로그인 시간 업데이트는 중요하지 않으므로 실패해도 계속 진행
    }

    // 토큰 생성
    const userAuthInfo = extractUserAuthInfo(user);
    const { accessToken, refreshToken } = generateTokens(userAuthInfo);

    // 응답 반환
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 토큰 갱신 API
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: '리프레시 토큰이 필요합니다.'
      }, { status: 400 });
    }

    // 리프레시 토큰 검증
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않거나 만료된 리프레시 토큰입니다.'
      }, { status: 401 });
    }

    try {
      // 데이터베이스 연결
      await connectToDatabase();
    } catch (dbError) {
      console.error('데이터베이스 연결 오류:', dbError);
      return NextResponse.json({
        success: false,
        message: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 500 });
    }

    // 사용자 조회
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 사용자입니다.'
      }, { status: 401 });
    }

    // 새 토큰 생성
    const userAuthInfo = extractUserAuthInfo(user);
    const tokens = generateTokens(userAuthInfo);

    // 응답 반환
    return NextResponse.json({
      success: true,
      tokens
    }, { status: 200 });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({
      success: false,
      message: '토큰 갱신 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 현재 로그인한 사용자 정보 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: '인증되지 않은 요청입니다.'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않거나 만료된 토큰입니다.'
      }, { status: 401 });
    }

    try {
      // 데이터베이스 연결
      await connectToDatabase();
    } catch (dbError) {
      console.error('데이터베이스 연결 오류:', dbError);
      return NextResponse.json({
        success: false,
        message: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 500 });
    }

    // 사용자 조회 (비밀번호 제외)
    const user = await User.findById(payload.userId).select('-password');
    if (!user || !user.isActive) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 사용자입니다.'
      }, { status: 401 });
    }

    // 응답 반환
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin
      }
    }, { status: 200 });
  } catch (error) {
    console.error('User profile error:', error);
    return NextResponse.json({
      success: false,
      message: '사용자 정보 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
