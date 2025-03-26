import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ESGPost } from '@/lib/db/models/ESGPost';
import { translate } from '@/lib/translate';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // 자동 번역 처리
    if (!data.title.en) {
      data.title.en = await translate(data.title.ko, 'ko', 'en');
    }
    if (!data.summary.en) {
      data.summary.en = await translate(data.summary.ko, 'ko', 'en');
    }
    if (!data.content.en) {
      data.content.en = await translate(data.content.ko, 'ko', 'en');
    }

    const post = await ESGPost.create({
      ...data,
      author: session.user.id
    });

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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