import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import ESGPostModel from '@/lib/db/models/ESGPost';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

/**
 * 테스트용 ESG 포스트 데이터 시드 API
 * 개발환경에서만 사용해야 함
 */
export async function POST(req: NextRequest) {
  // 환경 체크 (개발환경에서만 실행)
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      message: '이 API는 개발 환경에서만 사용할 수 있습니다.'
    }, { status: 403 });
  }

  try {
    await connectToDatabase();
    
    // 기존 데이터가 있는지 확인
    const existingCount = await ESGPostModel.countDocuments();
    console.log(`기존 ESG 포스트 수: ${existingCount}`);
    
    // 이미 데이터가 있으면 스킵
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `이미 ${existingCount}개의 ESG 포스트가 있습니다. 데이터 시드를 건너뜁니다.`
      });
    }
    
    // 테스트 데이터 생성
    const categories = ['environment', 'social', 'governance', 'sustainability', 'report'];
    const testData = [];
    
    for (let i = 1; i <= 5; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const publishDate = new Date();
      publishDate.setDate(publishDate.getDate() - i * 3);
      
      testData.push({
        title: {
          ko: `테스트 ESG 포스트 ${i}`,
          en: `Test ESG Post ${i}`
        },
        summary: {
          ko: `이것은 테스트 ESG 포스트 ${i}의 요약입니다.`,
          en: `This is a summary for test ESG post ${i}.`
        },
        content: {
          ko: `<p>이것은 테스트 ESG 포스트 ${i}의 내용입니다. ESG는 환경(Environment), 사회(Social), 지배구조(Governance)를 의미합니다.</p>`,
          en: `<p>This is content for test ESG post ${i}. ESG stands for Environment, Social, and Governance.</p>`
        },
        slug: `test-esg-post-${i}`,
        category,
        author: {
          name: '테스트 관리자',
          department: '관리팀'
        },
        publishDate,
        createdAt: publishDate,
        viewCount: Math.floor(Math.random() * 100),
        isPublished: true,
        isMainFeatured: i === 1,
        thumbnailUrl: 'https://via.placeholder.com/800x600.png?text=ESG+Test+Image',
        tags: ['ESG', 'Test', category]
      });
    }
    
    // 데이터 삽입
    const result = await ESGPostModel.insertMany(testData);
    
    return NextResponse.json({
      success: true,
      message: `${result.length}개의 테스트 ESG 포스트가 생성되었습니다.`,
      posts: result
    });
  } catch (error: any) {
    console.error('ESG 테스트 데이터 생성 중 오류:', error);
    return NextResponse.json({
      success: false,
      message: '테스트 데이터 생성 중 오류가 발생했습니다.',
      error: error.message
    }, { status: 500 });
  }
} 