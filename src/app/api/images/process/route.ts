'use server';

import { NextRequest, NextResponse } from 'next/server';
import { processAndSaveImage } from '@/lib/utils/image';
import { validateToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // 토큰 검증
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const isValid = await validateToken(token);
    if (!isValid) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const { type, title } = body;

    if (!type || !title) {
      return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const imageSource = null;

    // 이미지 생성 및 처리
    const imageUrls = await processAndSaveImage(
      imageSource,
      type,
      title,
      true
    );

    return NextResponse.json({
      message: '이미지가 성공적으로 생성되었습니다.',
      data: imageUrls,
    });
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 