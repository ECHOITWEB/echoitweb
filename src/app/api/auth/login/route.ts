import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { compare } from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@/lib/db/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    // 데이터베이스 연결
    await connectToDatabase();

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 비밀번호 검증
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 토큰 만료 시간 설정
    const accessTokenExpiry = process.env.JWT_EXPIRY ?? '30d';
    const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY ?? '60d';
    console.log(`토큰 만료 설정: 액세스 토큰=${accessTokenExpiry}, 리프레시 토큰=${refreshTokenExpiry}`);

    // JWT 시크릿 확인
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json({ error: '서버 구성 오류가 발생했습니다.' }, { status: 500 });
    }

    // 토큰 옵션 설정
    const accessTokenOptions: SignOptions = {
      expiresIn: accessTokenExpiry as unknown as SignOptions['expiresIn'],
    };
    const refreshTokenOptions: SignOptions = {
      expiresIn: refreshTokenExpiry as unknown as SignOptions['expiresIn'],
    };

    // 액세스 토큰 생성
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      accessTokenOptions
    );

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
      jwtSecret,
      refreshTokenOptions
    );

    // 마지막 로그인 시간 업데이트
    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '로그인 성공',
      tokens: {
        accessToken,
        refreshToken
      },
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name || user.username,
          role: user.role,
          lastLogin: user.lastLoginAt
        }
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
