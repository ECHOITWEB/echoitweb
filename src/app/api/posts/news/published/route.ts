import { NextRequest, NextResponse } from 'next/server';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

// 기존 임포트 대신 통합 뉴스 서비스 모듈 사용
const newsService = require('@/lib/services/news.service');

/**
 * 공개된 뉴스 포스트만 조회하는 API
 */
export async function GET(req: NextRequest) {
  try {
    console.log('공개 게시된 뉴스 포스트 조회 API 호출됨');
    
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const page = searchParams.has('page') ? parseInt(searchParams.get('page') as string) : 1;
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    
    // 공개된 뉴스만 조회
    let publishedNews = await newsService.getPublishedNews();
    
    // 카테고리 필터링 (필요한 경우)
    if (category && publishedNews.length > 0) {
      publishedNews = publishedNews.filter((post: any) => post.category === category);
    }
    
    // 최신순 정렬
    publishedNews.sort((a: any, b: any) => {
      const dateA = new Date(a.publishDate || a.createdAt);
      const dateB = new Date(b.publishDate || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    // 총 갯수
    const total = publishedNews.length;
    
    // 페이지네이션 적용
    const skip = (page - 1) * limit;
    const paginatedNews = publishedNews.slice(skip, skip + limit);
    
    console.log(`${total}개의 뉴스 포스트 조회 완료`);
    
    return NextResponse.json({
      success: true,
      posts: paginatedNews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('공개 뉴스 포스트 조회 오류:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '뉴스 포스트 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 