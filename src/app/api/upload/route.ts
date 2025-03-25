import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: '파일이 업로드되지 않았습니다.' },
        { status: 400 }
      );
    }

    // Check file size (5MB limit)
    const sizeLimit = 5 * 1024 * 1024; // 5MB
    if (file.size > sizeLimit) {
      return NextResponse.json(
        { success: false, message: '파일 크기가 5MB를 초과합니다.' },
        { status: 400 }
      );
    }

    // Check file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: '이미지 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename with proper extension
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory already exists or can't be created
      console.error('Error creating upload directory:', err);
    }

    // Write the file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      message: '파일이 성공적으로 업로드되었습니다.',
      url: fileUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
