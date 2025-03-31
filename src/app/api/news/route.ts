import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { NewsPost } from '@/lib/db/models';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';

/**
 * 모든 뉴스 게시물 조회 API (페이지네이션 지원)
 */
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const published = searchParams.get('published');

    // 데이터베이스 연결
    await connectToDatabase();

    // 쿼리 구성
    let query: any = {};

    // 검색어가 있으면 제목 또는 내용에서 검색
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // 출판 상태 필터링
    if (published !== null) {
      query.published = published === 'true';
    }

    // 전체 게시물 수 계산
    const total = await NewsPost.countDocuments(query);

    // 페이지네이션 적용
    const skip = (page - 1) * limit;

    // 게시물 조회
    const posts = await NewsPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 응답 반환
    return NextResponse.json({
      success: true,
      posts: posts.map(post => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        author: post.author,
        published: post.published,
        viewCount: post.viewCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('뉴스 목록 조회 오류:', error);
    return NextResponse.json({
      success: false,
      message: '뉴스 목록을 가져오는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 새 뉴스 게시물 생성 API - 편집자 이상 권한 필요
 */
export async function POST(req: NextRequest): Promise<Response> {
  const authReq = req as AuthenticatedRequest;

  // 편집자 이상 권한 체크
  const authResult = await requireEditor(authReq);
  if (authResult) {
    return NextResponse.json(authResult);
  }

  try {
    const body = await req.json();
    const { title, content, excerpt, coverImage, slug, published = true } = body;

    // 필수 필드 검증
    if (!title || !content || !excerpt || !coverImage) {
      return NextResponse.json({
        success: false,
        message: '제목, 내용, 요약, 커버 이미지는 필수입니다.'
      }, { status: 400 });
    }

    // 데이터베이스 연결
    await connectToDatabase();

    // 동일한 슬러그 확인
    const existingPost = await NewsPost.findOne({ slug });
    if (existingPost) {
      return NextResponse.json({
        success: false,
        message: '이미 동일한 슬러그를 가진 게시물이 존재합니다.'
      }, { status: 409 });
    }

    // 새 게시물 생성
    const newPost = new NewsPost({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      author: authReq.user?.username || 'Admin',
      published,
      viewCount: 0
    });

    await newPost.save();

    return NextResponse.json({
      success: true,
      message: '뉴스 게시물이 성공적으로 생성되었습니다.',
      post: {
        id: newPost._id,
        title: newPost.title,
        slug: newPost.slug,
        excerpt: newPost.excerpt,
        coverImage: newPost.coverImage,
        author: newPost.author,
        published: newPost.published,
        createdAt: newPost.createdAt
      }
    });
  } catch (error: any) {
    console.error('뉴스 게시물 생성 오류:', error);

    // MongoDB 유효성 검사 오류 처리
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');

      return NextResponse.json({
        success: false,
        message: `유효성 검사 오류: ${errorMessage}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: '뉴스 게시물 생성 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 뉴스 게시물 업데이트 API - 편집자 이상 권한 필요
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
): Promise<Response> {
  const authReq = req as AuthenticatedRequest;

  // 편집자 이상 권한 체크
  const authResult = await requireEditor(authReq);
  if (authResult) {
    return NextResponse.json(authResult);
  }

  // 나머지 코드는 그대로...
  return new NextResponse("Not implemented", { status: 501 });
}

/**
 * 뉴스 게시물 삭제 API - 편집자 이상 권한 필요
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
): Promise<Response> {
  const authReq = req as AuthenticatedRequest;

  // 편집자 이상 권한 체크
  const authResult = await requireEditor(authReq);
  if (authResult) {
    return NextResponse.json(authResult);
  }

  // 나머지 코드는 그대로...
  return new NextResponse("Not implemented", { status: 501 });
}
