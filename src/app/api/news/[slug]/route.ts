import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { NewsPost } from '@/lib/db/models';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';

/**
 * 특정 뉴스 게시물 조회 API
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // 데이터베이스 연결
    await connectToDatabase();

    // 게시물 조회
    const post = await NewsPost.findOne({ slug });

    // 게시물이 없는 경우
    if (!post) {
      return NextResponse.json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 조회수 증가 (실제 요청인 경우만)
    if (req.method === 'GET' && !req.headers.get('x-skip-view-count')) {
      post.viewCount += 1;
      await post.save();
    }

    // 응답 데이터 구성
    return NextResponse.json({
      success: true,
      post: {
        id: post._id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        author: post.author,
        published: post.published,
        viewCount: post.viewCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    });
  } catch (error) {
    console.error('뉴스 게시물 조회 오류:', error);
    return NextResponse.json({
      success: false,
      message: '게시물을 가져오는 중 오류가 발생했습니다.'
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

  try {
    const { slug } = params;
    const body = await req.json();

    // 데이터베이스 연결
    await connectToDatabase();

    // 대상 게시물 조회
    const post = await NewsPost.findOne({ slug });

    // 게시물이 없는 경우
    if (!post) {
      return NextResponse.json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 슬러그 변경 시 중복 확인
    if (body.slug && body.slug !== slug) {
      const existingPost = await NewsPost.findOne({
        slug: body.slug,
        _id: { $ne: post._id }
      });

      if (existingPost) {
        return NextResponse.json({
          success: false,
          message: '이미 동일한 슬러그를 가진 게시물이 존재합니다.'
        }, { status: 409 });
      }
    }

    // 허용된 필드만 업데이트
    const allowedFields = ['title', 'content', 'excerpt', 'coverImage', 'slug', 'published'];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        post[field] = body[field];
      }
    });

    // 게시물 저장
    await post.save();

    // 응답 데이터 구성
    return NextResponse.json({
      success: true,
      message: '게시물이 성공적으로 업데이트되었습니다.',
      post: {
        id: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        author: post.author,
        published: post.published,
        viewCount: post.viewCount,
        updatedAt: post.updatedAt
      }
    });
  } catch (error: any) {
    console.error('뉴스 게시물 업데이트 오류:', error);

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
      message: '게시물 업데이트 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
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

  try {
    const { slug } = params;

    // 데이터베이스 연결
    await connectToDatabase();

    // 게시물 삭제
    const result = await NewsPost.findOneAndDelete({ slug });

    // 게시물이 없는 경우
    if (!result) {
      return NextResponse.json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 응답 데이터 구성
    return NextResponse.json({
      success: true,
      message: '게시물이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('뉴스 게시물 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      message: '게시물 삭제 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
