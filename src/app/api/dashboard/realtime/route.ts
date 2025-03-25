import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User, NewsPost, ESGPost } from '@/lib/db/models';

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

  // Server-Sent Events 설정
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      // 초기 연결 메시지
      controller.enqueue(encoder.encode('event: connected\ndata: {"status": "connected"}\n\n'));

      // 데이터 전송 함수
      const sendData = async () => {
        try {
          // 데이터베이스 연결
          await connectToDatabase();

          // 대시보드 데이터 수집
          const dashboardData = await collectDashboardData();

          // 데이터 전송
          controller.enqueue(encoder.encode(`event: dashboard_update\ndata: ${JSON.stringify(dashboardData)}\n\n`));
        } catch (error) {
          console.error('대시보드 데이터 수집 오류:', error);
          controller.enqueue(encoder.encode(`event: error\ndata: {"message": "데이터 수집 중 오류가 발생했습니다."}\n\n`));

          // 2초 후 재시도
          setTimeout(async () => {
            try {
              // 재연결 시도
              await connectToDatabase();
              controller.enqueue(encoder.encode('event: reconnected\ndata: {"status": "연결이 복구되었습니다."}\n\n'));
            } catch (retryError) {
              console.error('대시보드 재연결 실패:', retryError);
            }
          }, 2000);
        }
      };

      // 초기 데이터 전송
      await sendData();

      // 5초마다 업데이트 전송
      const interval = setInterval(async () => {
        await sendData();
      }, 5000);

      // 클라이언트 연결 종료 시 인터벌 정리
      // ReadableStream은 자동으로 cancel 콜백을 처리함
      return () => {
        clearInterval(interval);
      };
    }
  });

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

/**
 * 대시보드 데이터 수집 함수
 */
async function collectDashboardData() {
  // 기본 데이터 및 요약
  const startTime = Date.now();

  // 병렬로 데이터 쿼리 실행하여 성능 최적화
  const [
    totalUsers,
    totalNews,
    totalESG,
    startOfMonth,
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
    // 카운트 쿼리
    User.countDocuments().exec(),
    NewsPost.countDocuments().exec(),
    ESGPost.countDocuments().exec(),

    // 이번 달 시작일 계산
    (() => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      return startOfMonth;
    })(),

    // 이번 달 게시물 카운트
    NewsPost.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }).exec(),
    ESGPost.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }).exec(),

    // 최근 활동 정보
    NewsPost.find().sort({ createdAt: -1 }).limit(5).select('title slug createdAt').lean().exec(),
    ESGPost.find().sort({ createdAt: -1 }).limit(5).select('title slug category createdAt').lean().exec(),

    // 가장 많이 본 콘텐츠
    NewsPost.find().sort({ viewCount: -1 }).limit(5).select('title slug viewCount').lean().exec(),
    ESGPost.find().sort({ viewCount: -1 }).limit(5).select('title slug category viewCount').lean().exec(),

    // ESG 카테고리별 게시물 수
    ESGPost.countDocuments({ category: 'environment' }).exec(),
    ESGPost.countDocuments({ category: 'social' }).exec(),
    ESGPost.countDocuments({ category: 'governance' }).exec(),

    // 사용자 역할별 수
    User.countDocuments({ role: 'admin' }).exec(),
    User.countDocuments({ role: 'editor' }).exec(),
    User.countDocuments({ role: 'viewer' }).exec(),

    // 최근 로그인 사용자
    User.find().where('lastLogin').ne(null).sort({ lastLogin: -1 }).limit(5)
      .select('name username role lastLogin').lean().exec()
  ]);

  // 계산 시간 측정
  const computeTime = Date.now() - startTime;

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
      news: recentNews.map(post => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        createdAt: post.createdAt
      })),
      esg: recentESG.map(post => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        createdAt: post.createdAt
      })),
      logins: recentLogins.map(user => ({
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        lastLogin: user.lastLogin
      }))
    },
    analytics: {
      topViewedNews: topViewedNews.map(post => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        viewCount: post.viewCount
      })),
      topViewedESG: topViewedESG.map(post => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        viewCount: post.viewCount
      })),
      esgCategoryDistribution: [
        { name: '환경(E)', value: environmentCount },
        { name: '사회(S)', value: socialCount },
        { name: '지배구조(G)', value: governanceCount }
      ],
      hourlyViews: generateHourlyViewsData()
    },
    // 퍼포먼스 메트릭 및 서버 시간 추가
    performance: {
      queryTime: `${computeTime}ms`,
      timestamp: new Date().toISOString()
    },
    // 서버 시간 추가 (클라이언트와의 동기화용)
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
