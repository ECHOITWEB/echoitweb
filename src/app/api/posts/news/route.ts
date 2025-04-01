import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';
import { createSlug } from '@/lib/utils/slug';
import { AuthorDepartment } from '@/types/news';
// 기존 임포트 대신 통합 뉴스 서비스 모듈 사용
const newsService = require('@/lib/services/news.service');

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('뉴스 포스트 생성 요청 시작');
    
    // 에디터 권한 체크
    const authReq = req as AuthenticatedRequest;
    const user = await requireEditor(authReq);
    
    console.log('권한 체크 결과:', user ? '권한 있음' : '권한 없음');
    
    if (!user) {
      console.log('권한 거부: 에디터 권한 없음');
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    console.log('인증된 사용자:', user.username, '역할:', user.role);

    const data = await req.json();
    const { title, summary, content, category, author, publishDate, imageSource, tags } = data;
    
    console.log('받은 데이터 확인:', {
      title: typeof title === 'object' ? JSON.stringify(title) : title,
      author: typeof author === 'object' ? JSON.stringify(author) : author
    });

    // 필수 필드 체크
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 작성자 정보 구성
    let authorData: any = {
      name: user.username || '관리자',
      department: AuthorDepartment.ADMIN
    };
    
    // 작성자 정보 처리
    if (typeof author === 'object' && author !== null) {
      authorData = {
        name: author.name || '관리자',
        department: author.department || AuthorDepartment.ADMIN
      };
    } else if (!author || author === 'current_user') {
      // 현재 사용자 정보 사용
      authorData = {
        name: user.username || '관리자',
        department: AuthorDepartment.ADMIN
      };
    }

    // userId 추출 (사용자 객체 구조에 따라 다를 수 있음)
    const userId = user._id || user.id || (user as any).userId || '';

    // 새로운 통합 뉴스 서비스를 사용하여 뉴스 생성
    const newsPost = await newsService.createNews({
      title,
      summary,
      content,
      category,
      author: authorData,
      publishDate: publishDate || new Date(),
      imageSource,
      tags: tags || [],
      isPublished: true
    }, userId);

    return NextResponse.json({ 
      message: '뉴스가 성공적으로 생성되었습니다.',
      post: newsPost 
    });

  } catch (error: any) {
    console.error('뉴스 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '뉴스 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET 요청 핸들러 - 뉴스 포스트 목록 또는 특정 뉴스 포스트 조회
 */
export async function GET(req: NextRequest) {
  try {
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const page = searchParams.has('page') ? parseInt(searchParams.get('page') as string) : 1;
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    const isPublished = searchParams.get('isPublished') === 'true';
    const withCounts = searchParams.get('withCounts') === 'true';
    const search = searchParams.get('search');
    
    console.log('뉴스 목록 조회 요청:', { category, page, limit, isPublished, search });
    
    let news;
    let total = 0;
    
    // 새로운 통합 뉴스 서비스를 사용하여 뉴스 조회
    if (isPublished) {
      news = await newsService.getPublishedNews();
    } else if (category) {
      news = await newsService.getNewsByCategory(category);
    } else {
      news = await newsService.getAllNews();
    }
    
    // 검색어 필터링
    if (search && news.length > 0) {
      const searchRegex = new RegExp(search, 'i');
      news = news.filter((post: any) => {
        return (
          (post.title?.ko && searchRegex.test(post.title.ko)) ||
          (post.title?.en && searchRegex.test(post.title.en)) ||
          (post.summary?.ko && searchRegex.test(post.summary.ko)) ||
          (post.summary?.en && searchRegex.test(post.summary.en)) ||
          (post.content?.ko && searchRegex.test(post.content.ko)) ||
          (post.content?.en && searchRegex.test(post.content.en)) ||
          (post.tags && post.tags.some((tag: string) => searchRegex.test(tag)))
        );
      });
    }
    
    total = news.length;
    
    // 페이지네이션 적용
    const skip = (page - 1) * limit;
    news = news.slice(skip, skip + limit);
    
    console.log(`조회 결과: ${news.length}개의 뉴스 (총 ${total}개)`);
    
    if (withCounts) {
      return NextResponse.json({
        posts: news,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } else {
      return NextResponse.json({ posts: news });
    }
    
  } catch (error: any) {
    console.error('뉴스 조회 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '뉴스 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 