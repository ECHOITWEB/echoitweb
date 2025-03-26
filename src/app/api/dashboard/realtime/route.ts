import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/mongodb';
import { User, NewsPost, ESGPost, IUser, INewsPost, IESGPost } from '@/lib/db/models';
import { Db, Document } from 'mongodb';

/**
 * 실시간 대시보드 데이터 API
 *
 * Server-Sent Events를 사용하여 실시간 데이터를 클라이언트에 전송
 */
export async function GET(req: NextRequest) {
  const authReq = req as AuthenticatedRequest;

  // 편집자 이상 권한 체크 (관리자, 편집자)
  const authResult = await requireEditor(authReq);
  if (authResult) {
    return authResult;
  }

  const encoder = new TextEncoder();
  let isConnectionActive = true;
  let dbConnection: { client: any; db: Db } | null = null;

  try {
    // 초기 데이터베이스 연결
    dbConnection = await connectToDatabase();
  } catch (error) {
    console.error('초기 데이터베이스 연결 실패:', error);
    return new NextResponse(
      JSON.stringify({ error: '데이터베이스 연결에 실패했습니다.' }),
      { status: 500 }
    );
  }

  const customReadable = new ReadableStream({
    async start(controller) {
      // 초기 연결 메시지
      controller.enqueue(encoder.encode('event: connected\ndata: {"status": "connected"}\n\n'));

      // 데이터 전송 함수
      const sendData = async () => {
        if (!isConnectionActive) return;

        try {
          if (!dbConnection) {
            dbConnection = await connectToDatabase();
          }

          const dashboardData = await collectDashboardData(dbConnection.db);

          if (isConnectionActive) {
            controller.enqueue(
              encoder.encode(`event: dashboard_update\ndata: ${JSON.stringify(dashboardData)}\n\n`)
            );
          }
        } catch (error) {
          console.error('대시보드 데이터 수집 오류:', error);
          
          if (isConnectionActive) {
            controller.enqueue(
              encoder.encode(`event: error\ndata: {"message": "데이터 수집 중 오류가 발생했습니다."}\n\n`)
            );
          }

          // 연결 오류 시 재연결 시도
          try {
            dbConnection = await connectToDatabase();
          } catch (reconnectError) {
            console.error('데이터베이스 재연결 실패:', reconnectError);
          }
        }
      };

      // 초기 데이터 전송
      await sendData();

      // 10초마다 업데이트 전송
      const interval = setInterval(sendData, 10000);

      // 클라이언트 연결 종료 시 정리
      return () => {
        isConnectionActive = false;
        clearInterval(interval);
      };
    },
    cancel() {
      isConnectionActive = false;
    }
  });

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}

/**
 * 대시보드 데이터 수집 함수
 */
async function collectDashboardData(db: Db) {
  // 기본 데이터 및 요약
  const startTime = Date.now();

  // 쿼리 타임아웃 유틸리티 함수
  const withTimeout = <T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>(resolve => setTimeout(() => resolve(fallbackValue), ms))
    ]);
  };

  // 병렬로 데이터 쿼리 실행하여 성능 최적화 (각 쿼리에 5초 타임아웃 적용)
  const [
    totalUsers,
    totalNews,
    totalESG,
    newsThisMonth,
    esgThisMonth,
    recentNews,
    recentESG,
    topViewedNews,
    topViewedESG,
    environmentCount,
    socialCount,
    governanceCount,
    adminUsers,
    editorUsers,
    viewerUsers,
    recentLogins
  ] = await Promise.all([
    // 카운트 쿼리 - 2초 타임아웃
    withTimeout(db.collection('users').countDocuments(), 2000, 0),
    withTimeout(db.collection('newsposts').countDocuments(), 2000, 0),
    withTimeout(db.collection('esgposts').countDocuments(), 2000, 0),

    // 이번 달 게시물 카운트 - 2초 타임아웃
    withTimeout(db.collection('newsposts').countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }), 2000, 0),
    withTimeout(db.collection('esgposts').countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }), 2000, 0),

    // 최근 활동 정보 - 3초 타임아웃 
    withTimeout(db.collection('newsposts').find().sort({ createdAt: -1 }).limit(5).toArray(), 3000, []),
    withTimeout(db.collection('esgposts').find().sort({ createdAt: -1 }).limit(5).toArray(), 3000, []),

    // 가장 많이 본 콘텐츠 - 3초 타임아웃
    withTimeout(db.collection('newsposts').find().sort({ viewCount: -1 }).limit(5).toArray(), 3000, []),
    withTimeout(db.collection('esgposts').find().sort({ viewCount: -1 }).limit(5).toArray(), 3000, []),

    // ESG 카테고리별 게시물 수 - 2초 타임아웃
    withTimeout(db.collection('esgposts').countDocuments({ category: 'environment' }), 2000, 0),
    withTimeout(db.collection('esgposts').countDocuments({ category: 'social' }), 2000, 0),
    withTimeout(db.collection('esgposts').countDocuments({ category: 'governance' }), 2000, 0),

    // 사용자 역할별 수 - 2초 타임아웃
    withTimeout(db.collection('users').countDocuments({ roles: 'admin' }), 2000, 0),
    withTimeout(db.collection('users').countDocuments({ roles: 'editor' }), 2000, 0),
    withTimeout(db.collection('users').countDocuments({ roles: 'viewer' }), 2000, 0),

    // 최근 로그인 사용자 - 3초 타임아웃
    withTimeout(db.collection('users').find().sort({ lastLogin: -1 }).limit(5).toArray(), 3000, [])
  ]);

  // 통합 대시보드 데이터
  return {
    summary: {
      totalUsers,
      totalNews,
      totalESG,
      totalPosts: totalNews + totalESG,
      postsThisMonth: newsThisMonth + esgThisMonth,
      usersByRole: {
        admin: adminUsers,
        editor: editorUsers,
        viewer: viewerUsers
      }
    },
    recentActivity: {
      news: recentNews.map(mapNewsPost),
      esg: recentESG.map(mapESGPost),
      logins: recentLogins.map(mapUser)
    },
    analytics: {
      topViewedNews: topViewedNews.map(mapNewsPost),
      topViewedESG: topViewedESG.map(mapESGPost),
      categoryDistribution: {
        environment: environmentCount,
        social: socialCount,
        governance: governanceCount
      }
    },
    serverTime: new Date().toISOString()
  };
}

/**
 * 시간별 조회수 데이터 생성 (가상 데이터)
 */
function generateHourlyViewsData() {
  const hours = [];
  const now = new Date();

  // 현재 시간부터 24시간 전까지의 시간별 데이터 생성
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(now.getHours() - i);
    hour.setMinutes(0, 0, 0);

    // 낮 시간에는 더 많은 조회수, 밤에는 적은 조회수를 가상으로 생성
    const hourOfDay = hour.getHours();
    let baseViews = 10;

    // 업무 시간(9-18시)에는 더 많은 트래픽
    if (hourOfDay >= 9 && hourOfDay <= 18) {
      baseViews = 50 + Math.floor(Math.random() * 30);
    } else if (hourOfDay >= 19 && hourOfDay <= 23) {
      // 저녁 시간
      baseViews = 20 + Math.floor(Math.random() * 20);
    } else {
      // 새벽 시간
      baseViews = 5 + Math.floor(Math.random() * 10);
    }

    hours.push({
      hour: hour.toISOString(),
      views: baseViews,
      formattedHour: `${hour.getHours().toString().padStart(2, '0')}:00`
    });
  }

  return hours;
}

export async function getMongoData() {
  try {
    const { db } = await connectToDatabase();

    // 전체 뉴스 및 ESG 포스트 수 조회
    const totalNews = await db.collection('posts').countDocuments({ type: 'news' });
    const totalESG = await db.collection('posts').countDocuments({ type: 'esg' });

    // 최근 30일 동안의 뉴스 및 ESG 포스트 수 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentNews = await db.collection('posts').countDocuments({
      type: 'news',
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentESG = await db.collection('posts').countDocuments({
      type: 'esg',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // 조회수 및 좋아요 수 통계
    const newsStats = await db.collection('posts').aggregate([
      { $match: { type: 'news' } },
      { $group: {
        _id: null,
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' }
      }}
    ]).toArray();

    const esgStats = await db.collection('posts').aggregate([
      { $match: { type: 'esg' } },
      { $group: {
        _id: null,
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' }
      }}
    ]).toArray();

    // 최근 게시물 5개 조회
    const recentPosts = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        title: 1,
        type: 1,
        category: 1,
        publishDate: 1,
        views: 1,
        likes: 1,
        createdAt: 1
      })
      .toArray();

    // 카테고리별 통계
    const newsCategories = await db.collection('posts').aggregate([
      { $match: { type: 'news' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const esgCategories = await db.collection('posts').aggregate([
      { $match: { type: 'esg' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    return NextResponse.json({
      stats: {
        totalNews,
        totalESG,
        recentNews,
        recentESG,
        totalNewsViews: newsStats[0]?.totalViews || 0,
        totalNewsLikes: newsStats[0]?.totalLikes || 0,
        totalESGViews: esgStats[0]?.totalViews || 0,
        totalESGLikes: esgStats[0]?.totalLikes || 0
      },
      recentPosts: recentPosts.map(post => ({
        _id: post._id,
        title: post.title,
        type: post.type,
        category: post.category,
        publishDate: post.createdAt,
        views: post.views,
        likes: post.likes
      })),
      categories: {
        news: newsCategories,
        esg: esgCategories
      }
    });
  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '대시보드 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 데이터 매핑 함수들
const mapNewsPost = (post: Document) => ({
  id: post._id,
  title: post.title?.ko || '',
  slug: post.slug || '',
  createdAt: post.createdAt || new Date(),
  viewCount: post.viewCount || 0
});

const mapESGPost = (post: Document) => ({
  id: post._id,
  title: post.title?.ko || '',
  category: post.category || '',
  createdAt: post.createdAt || new Date(),
  viewCount: post.viewCount || 0
});

const mapUser = (user: Document) => ({
  id: user._id,
  name: user.name ? `${user.name.first} ${user.name.last}` : '',
  username: user.username || '',
  roles: user.roles || [],
  lastLogin: user.lastLogin || null
});
