import { NextResponse } from 'next/server';
import { generateAIImage } from '@/lib/utils/ai';
import { processAndSaveImage } from '@/lib/utils/image';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  console.log('이미지 생성 API 요청 시작');
  try {
    // 토큰 검증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.log('인증 헤더 없음');
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('토큰 없음');
      return NextResponse.json(
        { success: false, message: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 토큰 검증
    console.log('토큰 검증 시작');
    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('토큰 검증 실패');
      return NextResponse.json(
        { success: false, message: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }
    console.log('토큰 검증 성공:', decoded);

    const body = await request.json();
    const { type, title, summary } = body;
    console.log('요청 바디:', { type, title, summary });

    if (!type || !title) {
      console.log('필수 파라미터 누락');
      return NextResponse.json(
        { success: false, message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // AI 이미지 생성 프롬프트 구성
    const prompt = `${title}${summary ? ` - ${summary}` : ''}에 대한 전문적인 이미지. 
    ${type === 'news' ? '뉴스 기사' : 'ESG 관련'} 이미지로, 
    현대적이고 전문적인 디자인으로 제작해주세요.`;
    
    console.log('생성할 프롬프트:', prompt);

    // AI 이미지 생성
    console.log('AI 이미지 생성 시작');
    const imageBuffer = await generateAIImage(prompt);
    if (!imageBuffer) {
      console.log('이미지 생성 실패');
      throw new Error('이미지 생성 실패');
    }
    console.log('AI 이미지 생성 성공, 버퍼 크기:', imageBuffer.length);

    // 이미지 처리 및 저장
    console.log('이미지 처리 및 저장 시작');
    const processedImages = await processAndSaveImage(imageBuffer, type, title);
    console.log('이미지 처리 결과:', processedImages);

    // 클라이언트에게 성공 응답
    return NextResponse.json({
      success: true,
      message: '이미지 생성 성공',
      data: {
        thumbnailPath: processedImages.thumbnailPath,
        thumbnailUrl: processedImages.thumbnailPath,
        mediumPath: processedImages.mediumPath,
        largePath: processedImages.largePath,
        originalPath: processedImages.originalPath
      }
    });
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
} 