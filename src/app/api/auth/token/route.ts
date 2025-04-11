import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/db/models';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

/**
 * 액세스 토큰 갱신 API 핸들러
 * 
 * 리프레시 토큰을 검증하고 새로운 액세스 토큰과 리프레시 토큰을 발급
 */
export async function POST(request: NextRequest) {
  // AbortController를 사용하여 요청 타임아웃 관리
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃 (토큰 갱신은 빠르게)

  try {
    // 요청 본문에서 리프레시 토큰 추출
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: '리프레시 토큰이 필요합니다.'
      }, { status: 400 });
    }

    // JWT 시크릿 키 확인
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json({
        success: false,
        message: '서버 구성 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // 토큰 만료 시간 설정 확인
    const accessTokenExpiry = process.env.JWT_EXPIRY || '30d';
    const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '60d';
    console.log(`토큰 만료 설정: 액세스 토큰=${accessTokenExpiry}, 리프레시 토큰=${refreshTokenExpiry}`);

    // 리프레시 토큰 검증
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, jwtSecret);
    } catch (error: any) {
      console.error('토큰 검증 오류:', error.message);
      return NextResponse.json({
        success: false,
        message: '유효하지 않거나 만료된 토큰입니다.'
      }, { status: 401 });
    }

    // 데이터베이스 연결
    await connectDB();

    // 사용자 확인 (키 수정: id -> userId)
    const userId = (decoded as any).userId || (decoded as any).id;
    console.log('토큰에서 추출한 사용자 ID:', userId);
    const user = await User.findById(userId);

    if (!user) {
      console.error(`토큰 갱신 실패: 사용자 찾을 수 없음 (ID: ${userId})`);
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 사용자입니다.'
      }, { status: 401 });
    }

    if (!user.isActive) {
      console.error(`토큰 갱신 실패: 비활성화된 사용자 (ID: ${userId})`);
      return NextResponse.json({
        success: false,
        message: '비활성화된 계정입니다.'
      }, { status: 403 });
    }

    // 새 토큰 생성 (키 일관성 유지: userId 사용)
    const accessToken = jwt.sign(
      { 
        userId: user._id.toString(),
        username: user.username || '',
        email: user.email,
        role: user.role 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { 
        userId: user._id.toString(),
        username: user.username || '',
        email: user.email
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    console.log(`토큰 갱신 성공: 사용자 ID ${userId}`);

    // 마지막 로그인 시간 업데이트 (save 대신 findByIdAndUpdate 사용)
    try {
      await User.findByIdAndUpdate(
        user._id, 
        { lastLogin: new Date() }, 
        { runValidators: false }
      );
      console.log('마지막 로그인 시간 업데이트 완료');
    } catch (updateError) {
      // 업데이트 실패해도 토큰 갱신은 계속 진행
      console.warn('마지막 로그인 시간 업데이트 실패 (계속 진행):', updateError);
    }

    return NextResponse.json({
      success: true,
      message: '토큰이 갱신되었습니다.',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error: any) {
    console.error('토큰 갱신 중 오류 발생:', error);
    
    // 타임아웃 오류 처리
    if (error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        message: '요청 처리 시간이 초과되었습니다.'
      }, { status: 408 });
    }
    
    // JSON 파싱 오류 처리
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({
        success: false,
        message: '잘못된 요청 형식입니다.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: '토큰 갱신 중 오류가 발생했습니다.'
    }, { status: 500 });
  } finally {
    // 타임아웃 정리
    clearTimeout(timeoutId);
  }
} 