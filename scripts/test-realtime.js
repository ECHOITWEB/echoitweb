// 실시간 대시보드 테스트 스크립트
const { connectToDatabase } = require('../src/lib/db/mongodb');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 데이터베이스 모델 가져오기 (TS -> JS로 변환)
const newsPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      required: true,
      trim: true
    },
    coverImage: {
      type: String,
      required: true
    },
    published: {
      type: Boolean,
      default: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    author: {
      type: String,
      default: 'Echo IT'
    }
  },
  {
    timestamps: true
  }
);

const esgPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      required: true,
      trim: true
    },
    coverImage: {
      type: String,
      required: true
    },
    published: {
      type: Boolean,
      default: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      enum: ['environment', 'social', 'governance'],
      default: 'environment'
    }
  },
  {
    timestamps: true
  }
);

// 모델 생성
const NewsPost = mongoose.models.NewsPost || mongoose.model('NewsPost', newsPostSchema);
const ESGPost = mongoose.models.ESGPost || mongoose.model('ESGPost', esgPostSchema);

// 테스트 데이터 생성
async function createTestData() {
  try {
    await connectToDatabase();

    // 뉴스 게시물 데이터 확인
    const newsCount = await NewsPost.countDocuments();
    if (newsCount === 0) {
      console.log('테스트 뉴스 게시물 생성 중...');

      const newsPosts = [
        {
          title: 'AI 비즈니스 인텔리전스 솔루션 출시',
          slug: 'ai-business-intelligence-solution',
          content: '에코잇은 최신 AI 기술을 활용한 비즈니스 인텔리전스 솔루션을 출시했습니다...',
          excerpt: '빅데이터 분석과 AI를 결합한 혁신적인 비즈니스 인텔리전스 솔루션',
          coverImage: '/images/news/ai-solution.jpg',
          viewCount: Math.floor(Math.random() * 100),
          author: 'Echo IT'
        },
        {
          title: '디지털 혁신상 2024 수상',
          slug: 'digital-innovation-award-2024',
          content: '에코잇은 한국디지털협회가 주관하는 디지털 혁신상 2024를 수상했습니다...',
          excerpt: '디지털 트랜스포메이션 분야에서의 혁신적인 성과 인정받아',
          coverImage: '/images/news/award.jpg',
          viewCount: Math.floor(Math.random() * 100),
          author: 'Echo IT'
        },
        {
          title: '신규 지사 오픈 소식',
          slug: 'new-branch-office-opening',
          content: '에코잇은 부산 센텀시티에 신규 지사를 오픈했습니다...',
          excerpt: '부산 센텀시티에 신규 지사 오픈으로 남부권 고객 서비스 강화',
          coverImage: '/images/news/new-office.jpg',
          viewCount: Math.floor(Math.random() * 100),
          author: 'Echo IT'
        }
      ];

      await NewsPost.insertMany(newsPosts);
      console.log(`${newsPosts.length}개의 테스트 뉴스 게시물 생성됨`);
    } else {
      console.log(`이미 ${newsCount}개의 뉴스 게시물이 있습니다`);
    }

    // ESG 게시물 데이터 확인
    const esgCount = await ESGPost.countDocuments();
    if (esgCount === 0) {
      console.log('테스트 ESG 게시물 생성 중...');

      const esgPosts = [
        {
          title: '탄소중립 이니셔티브 발표',
          slug: 'carbon-neutrality-initiative',
          content: '에코잇은 2030년까지 탄소중립을 달성하기 위한 이니셔티브를 발표했습니다...',
          excerpt: '2030년까지 탄소중립 달성을 위한 로드맵 공개',
          coverImage: '/images/esg/carbon.jpg',
          viewCount: Math.floor(Math.random() * 100),
          category: 'environment'
        },
        {
          title: 'ESG 경영위원회 설립',
          slug: 'esg-management-committee',
          content: '에코잇은 ESG 경영을 강화하기 위한 전담 위원회를 설립했습니다...',
          excerpt: '지속가능한 비즈니스를 위한 ESG 경영위원회 설립',
          coverImage: '/images/esg/committee.jpg',
          viewCount: Math.floor(Math.random() * 100),
          category: 'governance'
        },
        {
          title: 'IT 교육 지원 프로그램',
          slug: 'it-education-support-program',
          content: '소외계층 청소년을 위한 IT 교육 지원 프로그램을 시작합니다...',
          excerpt: '소외계층 청소년 대상 IT 역량 강화 프로그램 운영',
          coverImage: '/images/esg/education.jpg',
          viewCount: Math.floor(Math.random() * 100),
          category: 'social'
        }
      ];

      await ESGPost.insertMany(esgPosts);
      console.log(`${esgPosts.length}개의 테스트 ESG 게시물 생성됨`);
    } else {
      console.log(`이미 ${esgCount}개의 ESG 게시물이 있습니다`);
    }

    // 실시간 데이터 테스트
    console.log('실시간 데이터 수집 테스트 중...');

    // 통계 데이터 수집
    const totalNews = await NewsPost.countDocuments();
    const totalESG = await ESGPost.countDocuments();
    const recentNews = await NewsPost.find().sort({ createdAt: -1 }).limit(5);
    const recentESG = await ESGPost.find().sort({ createdAt: -1 }).limit(5);
    const topViewedNews = await NewsPost.find().sort({ viewCount: -1 }).limit(3);

    // 카테고리별 ESG 게시물 수
    const environmentCount = await ESGPost.countDocuments({ category: 'environment' });
    const socialCount = await ESGPost.countDocuments({ category: 'social' });
    const governanceCount = await ESGPost.countDocuments({ category: 'governance' });

    // 통합 대시보드 데이터
    const dashboardData = {
      summary: {
        totalNews,
        totalESG,
        totalPosts: totalNews + totalESG,
        postsThisMonth: await NewsPost.countDocuments({
          createdAt: { $gte: new Date(new Date().setDate(1)) }
        }) + await ESGPost.countDocuments({
          createdAt: { $gte: new Date(new Date().setDate(1)) }
        })
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
        }))
      },
      analytics: {
        topViewedContent: topViewedNews.map(post => ({
          id: post._id,
          title: post.title,
          viewCount: post.viewCount
        })),
        esgCategoryDistribution: [
          { name: 'Environment', value: environmentCount },
          { name: 'Social', value: socialCount },
          { name: 'Governance', value: governanceCount }
        ]
      }
    };

    console.log('대시보드 데이터:', JSON.stringify(dashboardData, null, 2));

    // 파일로 저장
    fs.writeFileSync(
      path.join(__dirname, 'dashboard-data.json'),
      JSON.stringify(dashboardData, null, 2)
    );

    console.log('대시보드 데이터가 dashboard-data.json 파일에 저장되었습니다.');

    return dashboardData;
  } catch (error) {
    console.error('테스트 데이터 생성 중 오류:', error);
    throw error;
  }
}

// 테스트 실행
async function runTests() {
  try {
    console.log('실시간 대시보드 테스트 시작...');

    const dashboardData = await createTestData();

    // 뷰 카운트 시뮬레이션
    console.log('뷰 카운트 증가 시뮬레이션...');

    // 무작위로 게시물 선택해서 조회수 증가
    const allPosts = await NewsPost.find();

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * allPosts.length);
      const post = allPosts[randomIndex];

      post.viewCount += 1;
      await post.save();

      console.log(`게시물 '${post.title}'의 조회수 증가: ${post.viewCount}`);
    }

    console.log('테스트 완료!');
  } catch (error) {
    console.error('테스트 실행 오류:', error);
  } finally {
    // 연결 종료
    await mongoose.connection.close();
    console.log('데이터베이스 연결 종료');
  }
}

// 테스트 실행
runTests();
