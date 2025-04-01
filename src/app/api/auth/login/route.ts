import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/connect';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

/**
 * 로그인 API 핸들러 - 초단순화 버전
 */
export async function POST(request: NextRequest) {
  console.log('로그인 API 핸들러 실행');
  
  // 응답 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };
  
  try {
    // 요청 처리 방식 변경: Buffer로 직접 읽기
    const buffer = await request.arrayBuffer();
    const textDecoder = new TextDecoder();
    const bodyText = textDecoder.decode(buffer);
    
    console.log('요청 본문 읽기 완료');
    
    // 본문 검증
    if (!bodyText || bodyText.trim() === '') {
      console.log('빈 요청 본문');
      return new Response(
        JSON.stringify({ success: false, message: '요청 본문이 비어있습니다' }),
        { status: 400, headers }
      );
    }
    
    // JSON 파싱
    let body;
    try {
      body = JSON.parse(bodyText);
      console.log('JSON 파싱 완료');
    } catch (e) {
      console.log('JSON 파싱 실패');
      return new Response(
        JSON.stringify({ success: false, message: '유효하지 않은 JSON 형식입니다' }),
        { status: 400, headers }
      );
    }
    
    // 필수 필드 확인
    const { email, password } = body;
    if (!email || !password) {
      console.log('필수 필드 누락');
      return new Response(
        JSON.stringify({ success: false, message: '이메일과 비밀번호가 필요합니다' }),
        { status: 400, headers }
      );
    }
    
    console.log(`로그인 시도: ${email}`);
    
    // 데이터베이스 연결
    try {
      await connectToDatabase();
      console.log('DB 연결 성공');
    } catch (dbError) {
      console.error('DB 연결 실패:', dbError);
      return new Response(
        JSON.stringify({ success: false, message: '데이터베이스 연결 실패' }),
        { status: 500, headers }
      );
    }
    
    // 사용자 찾기
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('사용자 없음');
      return new Response(
        JSON.stringify({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다' }),
        { status: 401, headers }
      );
    }
    
    // 비밀번호 검증
    console.log('비밀번호 검증 중');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('비밀번호 불일치');
      return new Response(
        JSON.stringify({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다' }),
        { status: 401, headers }
      );
    }
    
    // JWT 시크릿
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log('JWT_SECRET 환경변수 미설정');
      return new Response(
        JSON.stringify({ success: false, message: 'JWT 시크릿이 설정되지 않았습니다' }),
        { status: 500, headers }
      );
    }
    
    // 토큰 생성
    console.log('토큰 생성 중');
    const tokens = {
      accessToken: jwt.sign(
        { 
          userId: user._id.toString(),
          username: user.username || user.email.split('@')[0],
          email: user.email,
          role: user.role 
        },
        jwtSecret,
        { expiresIn: '1d' }
      ),
      refreshToken: jwt.sign(
        { 
          userId: user._id.toString(),
          username: user.username || user.email.split('@')[0],
          email: user.email
        },
        jwtSecret,
        { expiresIn: '7d' }
      )
    };
    
    // 마지막 로그인 시간 업데이트
    try {
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      console.log('마지막 로그인 시간 업데이트 완료');
    } catch (updateError) {
      console.log('마지막 로그인 시간 업데이트 실패 (무시됨)');
      // 비 치명적 오류이므로 계속 진행
    }
    
    // 사용자 정보 준비 (비밀번호 제외)
    const userInfo = {
      id: user._id.toString(),
      username: user.username || user.email.split('@')[0],
      email: user.email,
      name: typeof user.name === 'object' && user.name 
        ? `${user.name.first || ''} ${user.name.last || ''}`.trim() 
        : (typeof user.name === 'string' ? user.name : user.email.split('@')[0]),
      role: user.role,
      isActive: user.isActive || false,
      createdAt: user.createdAt || new Date(),
      lastLogin: new Date()
    };
    
    console.log('로그인 성공');
    
    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        message: '로그인 성공',
        user: userInfo,
        tokens
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('로그인 API 오류:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || '서버 오류가 발생했습니다'
      }),
      { status: 500, headers }
    );
  }
} 