import { NextRequest, NextResponse } from 'next/server';
import { getPublishedESGPosts } from '@/lib/services/posts';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

// 공개 게시된 ESG 포스트를 가져오는 API
export async function GET(request: NextRequest) {
  try {
    console.log('공개 게시된 ESG 포스트 조회 API 호출됨');
    
    // URL 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    
    // 포스트 가져오기
    const posts = await getPublishedESGPosts(limit ? parseInt(limit) : undefined);
    
    console.log(`${posts.length}개의 ESG 포스트 조회 완료`);
    
    return NextResponse.json(posts, { 
      status: 200,
      headers: {
        'Cache-Control': 'max-age=60, stale-while-revalidate=300'
      }
    });
  } catch (error: any) {
    console.error('ESG 포스트 조회 중 오류 발생:', error);
    
    return NextResponse.json(
      { error: 'ESG 포스트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 