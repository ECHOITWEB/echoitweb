import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 허용된 파일 형식 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (jpeg, png, webp만 가능)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // uploads 디렉토리 생성 확인
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 파일명에 타임스탬프 추가
    const timestamp = Date.now();
    const originalName = file.name;
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const fileName = `${timestamp}${ext}`;
    const filePath = join(uploadDir, fileName);

    // 파일 저장
    await writeFile(filePath, buffer);
    console.log('파일 저장 완료:', filePath);

    return NextResponse.json({ 
      success: true,
      url: `/uploads/${fileName}` 
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { error: '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
