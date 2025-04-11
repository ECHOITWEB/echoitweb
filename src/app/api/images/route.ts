import { NextRequest, NextResponse } from 'next/server';
import { processAndSaveImage, generateImageUrl } from '@/lib/utils/image';
import { headers } from 'next/headers';
import { validateToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // 토큰 검증
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: '인증 토큰이 필요합니다.' }, { status: 401 });
    }
    
    const token = authorization.split(' ')[1];
    const validationResult = validateToken(token);
    
    if (!validationResult.valid) {
      return NextResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const data = await request.json();
    const { imageUrl, type, title } = data;

    if (!type || !['news', 'esg'].includes(type)) {
      return NextResponse.json({ message: '유효하지 않은 이미지 타입입니다.' }, { status: 400 });
    }

    let finalImageUrl = imageUrl;
    if (!imageUrl && title) {
      // 이미지 URL이 없고 제목이 있는 경우 Grok으로 이미지 생성
      finalImageUrl = await generateImageUrl(title, type);
    } else if (!imageUrl && !title) {
      return NextResponse.json({ message: '이미지 URL 또는 제목이 필요합니다.' }, { status: 400 });
    }

    const fileName = title
      ? title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').substring(0, 50)
      : `image-${Date.now()}`;

    const result = await processAndSaveImage(finalImageUrl, type, fileName);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('이미지 처리 중 오류:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '이미지 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 