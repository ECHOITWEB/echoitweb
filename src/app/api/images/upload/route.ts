'use server';

import { NextRequest, NextResponse } from 'next/server';
import { processAndSaveImage } from '@/lib/utils/image';
import { verifyToken } from '@/lib/auth/jwt';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  console.log('이미지 업로드 API 요청 시작');
  try {
    // 토큰 검증
    const token = request.headers.get('Authorization')?.split(' ')[1];
    console.log('토큰 확인:', token ? '존재함' : '없음');
    
    if (!token) {
      console.log('인증 토큰 없음');
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('토큰 검증 실패');
      return NextResponse.json(
        { success: false, message: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }
    console.log('토큰 검증 성공:', decoded);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    
    console.log('업로드 정보:', { type, title, fileName: file?.name });

    if (!file) {
      console.log('파일 누락');
      return NextResponse.json(
        { success: false, message: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 확인
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      console.log('지원되지 않는 파일 형식:', ext);
      return NextResponse.json(
        { success: false, message: '지원하지 않는 파일 형식입니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 확인 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('파일 크기 초과:', file.size);
      return NextResponse.json(
        { success: false, message: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    
    // 디렉토리 생성
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, fileName);
    
    console.log('파일 저장 경로:', filePath);
    await writeFile(filePath, buffer);
    console.log('원본 파일 저장 완료');

    // 이미지 처리 및 저장
    console.log('이미지 처리 및 저장 시작');
    const imageUrls = await processAndSaveImage(buffer, type, title);
    console.log('이미지 처리 결과:', imageUrls);

    return NextResponse.json({
      success: true,
      message: '이미지 업로드 성공',
      data: imageUrls
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
} 