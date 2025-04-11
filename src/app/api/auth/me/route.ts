import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { User } from '@/lib/db/models/User';
import { connectToDatabase } from '@/lib/db/mongodb';

/**
 * 현재 로그인한 사용자 정보 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않거나 만료된 토큰입니다.'
      }, { status: 401 });
    }

    // 데이터베이스에서 사용자 정보 조회 (선택적)
    try {
      await connectToDatabase();
      const userId = payload.userId || payload.id;
      const user = await User.findById(userId);
      
      if (user) {
        // 사용자 정보가 있으면 추가 정보 포함
        return NextResponse.json({
          success: true,
          user: {
            id: userId,
            username: user.username,
            email: user.email,
            name: typeof user.name === 'object' ? 
              `${user.name.first || ''} ${user.name.last || ''}`.trim() : 
              user.name || user.username,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt?.toISOString(),
            lastLogin: user.lastLogin?.toISOString()
          }
        });
      }
    } catch (dbError) {
      console.error('사용자 정보 조회 오류:', dbError);
      // DB 오류가 발생해도 토큰 정보는 반환
    }

    // 기본적으로 토큰 정보만 반환
    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId || payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
        name: payload.username
      }
    });
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return NextResponse.json({
      success: false,
      message: '토큰 검증 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 