import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ESGPost } from '@/lib/db/models/ESGPost';
import { translate } from '@/lib/translate';
import { requireEditor } from '@/lib/auth/middleware';
import { createSlug } from '@/lib/utils/slug';

export async function POST(req: NextRequest) {
  try {
    // 에디터 권한 체크
    const user = await requireEditor(req);
    if (!user) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    await connectDB();
    const data = await req.json();
    const { title, summary, content, category, publishDate, imageSource } = data;

    // 필수 필드 체크
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 슬러그 생성
    const slug = await createSlug(title);

    const post = await ESGPost.create({
      title,
      slug,
      summary,
      content,
      category,
      author: user._id,
      publishDate: publishDate || new Date(),
      imageSource,
      isPublished: true,
      createdBy: user._id
    });

    return NextResponse.json({ 
      message: 'ESG 포스트가 성공적으로 생성되었습니다.',
      post 
    });
  } catch (error: any) {
    console.error('ESG 포스트 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: 'ESG 포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isPublished = searchParams.get('isPublished') !== 'false';

    const query = {
      ...(category && { category }),
      isPublished
    };

    const total = await ESGPost.countDocuments(query);
    const posts = await ESGPost.find(query)
      .sort({ publishDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name');

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 