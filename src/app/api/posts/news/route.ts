import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { NewsPost } from '@/lib/db/models/NewsPost';
import { translate } from '@/lib/translate';
import { connectToDatabase } from '@/lib/db/connect';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';
import { createSlug } from '@/lib/utils/slug';
import { IUser } from '@/lib/db/models/User';

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

    // DB 연결
    await connectToDatabase();

    const data = await req.json();
    const { title, summary, content, category, author, publishDate, imageSource } = data;

    // 필수 필드 체크
    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 슬러그 생성
    const slug = await createSlug(title);

    // 뉴스 포스트 생성
    const newsPost = await NewsPost.create({
      title,
      slug,
      summary,
      content,
      category,
      author,
      publishDate: publishDate || new Date(),
      imageSource,
      isPublished: true,
      createdBy: user._id
    });

    return NextResponse.json({ 
      message: '뉴스가 성공적으로 생성되었습니다.',
      post: newsPost 
    });

  } catch (error) {
    console.error('뉴스 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '뉴스 생성 중 오류가 발생했습니다.' },
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

    const total = await NewsPost.countDocuments(query);
    const posts = await NewsPost.find(query)
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