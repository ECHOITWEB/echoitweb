import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Db } from 'mongodb';

export const dynamic = 'force-dynamic';

/**
 * 대시보드 데이터 API
 */
export async function GET(req: NextRequest) {
  try {
    // 데이터베이스 연결
    const dbConnection = await connectToDatabase();
    
    if (!dbConnection || !dbConnection.db) {
      return NextResponse.json(
        { error: '데이터베이스 연결에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    // 대시보드 데이터 수집
    const dashboardData = await collectDashboardData(dbConnection.db);
    
    // 응답 반환
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('대시보드 데이터 API 오류:', error);
    return NextResponse.json(
      { error: '데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 대시보드 데이터 수집 함수
 */
async function collectDashboardData(db: Db) {
  try {
    // 기본 데이터 및 요약 (오류 방지를 위해 기본값 사용)
    const totalNews = await db.collection('newsposts').countDocuments() || 0;
    const totalESG = await db.collection('esgposts').countDocuments() || 0;
    
    console.log('뉴스 포스트 불러오기 성공');

    // 최근 30일간 작성된 게시물 수
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 최근 게시물 조회
    const recentNews = await db.collection('newsposts')
      .find({})
      .sort({ publishDate: -1 })
      .limit(5)
      .toArray();
      
    const recentESG = await db.collection('esgposts')
      .find({})
      .sort({ publishDate: -1 })
      .limit(5)
      .toArray();
    
    console.log('ESG 포스트 불러오기 성공');

    // 조회수가 많은 게시물
    const topViewedNews = await db.collection('newsposts')
      .find({})
      .sort({ viewCount: -1 })
      .limit(5)
      .toArray();
      
    const topViewedESG = await db.collection('esgposts')
      .find({})
      .sort({ viewCount: -1 })
      .limit(5)
      .toArray();

    // 총 조회수 계산
    const newsViewsSum = await db.collection('newsposts')
      .aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }])
      .toArray();
      
    const esgViewsSum = await db.collection('esgposts')
      .aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }])
      .toArray();
    
    const totalNewsViews = newsViewsSum.length > 0 ? newsViewsSum[0].total || 0 : 0;
    const totalESGViews = esgViewsSum.length > 0 ? esgViewsSum[0].total || 0 : 0;

    // 최근 30일간의 조회수 비율 (간단한 추정 - 실제로는 더 정확한 집계 필요)
    const recentNewsViews = Math.floor(totalNewsViews * 0.3); // 30% 정도가 최근 30일 조회수로 가정
    const recentESGViews = Math.floor(totalESGViews * 0.3);

    // 카테고리 데이터 처리
    const newsCategories = await db.collection('newsposts').aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]).toArray();
    
    const esgCategories = await db.collection('esgposts').aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]).toArray();

    // 최종 결과 객체 생성
    const result = {
      timestamp: new Date().toISOString(),
      totalStats: {
        newsViews: totalNewsViews,
        esgViews: totalESGViews,
        recentNewsViews,
        recentESGViews,
        newsCount: totalNews,
        esgCount: totalESG
      },
      recentNews: recentNews.map(post => ({
        _id: post._id.toString(),
        title: post.title || { ko: '제목 없음' },
        publishedAt: post.publishDate || post.createdAt,
        viewCount: post.viewCount || 0,
        category: post.category
      })),
      recentESG: recentESG.map(post => ({
        _id: post._id.toString(),
        title: post.title || { ko: '제목 없음' },
        publishedAt: post.publishDate || post.createdAt,
        viewCount: post.viewCount || 0,
        esgType: post.category
      })),
      newsStats: newsCategories.map(item => ({
        _id: item._id || 'unspecified',
        count: item.count || 0
      })),
      esgStats: esgCategories.map(item => ({
        _id: item._id || 'unspecified',
        count: item.count || 0
      }))
    };
    
    return result;
  } catch (error) {
    console.error('대시보드 데이터 수집 오류:', error);
    
    // 오류 발생 시 최소한의 기본 데이터 반환
    return {
      timestamp: new Date().toISOString(),
      totalStats: {
        newsViews: 0,
        esgViews: 0,
        recentNewsViews: 0,
        recentESGViews: 0,
        newsCount: 0,
        esgCount: 0
      },
      recentNews: [],
      recentESG: [],
      newsStats: [],
      esgStats: [],
      error: 'Database query failed'
    };
  }
} 