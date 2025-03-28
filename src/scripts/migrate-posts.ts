import { connectToDatabase } from '@/lib/mongodb';
import { getAllNewsPosts } from '@/lib/models/news-posts';
import { getAllESGPosts } from '@/lib/models/esg-posts';

// 슬러그 생성 함수
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// 메타 설명 생성 함수
function generateMetaDescription(content: string, maxLength = 160) {
  const stripped = content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped.length > maxLength ? stripped.slice(0, maxLength - 3) + '...' : stripped;
}

// 샘플 태그 생성 함수 (마이그레이션용)
function generateSampleTags(category: string, type: 'news' | 'esg'): string[] {
  const commonTags = ['에코아이티', 'IT서비스', '테크'];
  const newsCategoryTags = {
    company: ['회사소식', '기업문화', '성장'],
    award: ['수상소식', '성과', '혁신'],
    partnership: ['파트너십', '협력', '비즈니스'],
    product: ['신제품', '솔루션', '기술혁신']
  };
  const esgCategoryTags = {
    environment: ['환경', '탄소중립', '친환경'],
    social: ['사회공헌', '상생', '지역사회'],
    governance: ['지배구조', '투명경영', '윤리경영']
  };

  const tags = [...commonTags];
  if (type === 'news') {
    tags.push(...(newsCategoryTags[category as keyof typeof newsCategoryTags] || []));
  } else {
    tags.push(...(esgCategoryTags[category as keyof typeof esgCategoryTags] || []));
  }

  return tags.slice(0, 10); // 최대 10개로 제한
}

async function migrateNews() {
  try {
    const { db } = await connectToDatabase();
    
    // 뉴스 데이터 가져오기
    const newsPosts = getAllNewsPosts();
    
    for (const post of newsPosts) {
      // 슬러그 생성
      const slugKo = generateSlug(post.title.ko);
      const slugEn = generateSlug(post.title.en);

      // 태그 생성
      const tags = generateSampleTags(post.category, 'news');

      // MongoDB에 저장
      await db.collection('posts').insertOne({
        ...post,
        type: 'news',
        slug: {
          ko: slugKo,
          en: slugEn
        },
        meta: {
          description: {
            ko: generateMetaDescription(post.content.ko),
            en: generateMetaDescription(post.content.en)
          },
          keywords: {
            ko: [post.category, '뉴스', '에코아이티'],
            en: [post.category, 'news', 'ECHOIT']
          }
        },
        status: 'published',
        views: 0,
        likes: 0,
        comments: [],
        category: post.category,
        tags: tags,
        relatedPosts: [],
        createdAt: new Date(post.date),
        updatedAt: new Date(),
        publishedAt: new Date(post.date),
        lastModifiedAt: new Date()
      });
      
      console.log(`뉴스 마이그레이션 완료: ${post.title.ko}`);
    }
  } catch (error) {
    console.error('뉴스 마이그레이션 오류:', error);
  }
}

async function migrateESG() {
  try {
    const { db } = await connectToDatabase();
    
    // ESG 데이터 가져오기
    const esgPosts = getAllESGPosts();
    
    for (const post of esgPosts) {
      // 슬러그 생성
      const slugKo = generateSlug(post.title.ko);
      const slugEn = generateSlug(post.title.en);

      // 태그 생성
      const tags = generateSampleTags(post.category, 'esg');

      // MongoDB에 저장
      await db.collection('posts').insertOne({
        ...post,
        type: 'esg',
        slug: {
          ko: slugKo,
          en: slugEn
        },
        meta: {
          description: {
            ko: generateMetaDescription(post.content.ko),
            en: generateMetaDescription(post.content.en)
          },
          keywords: {
            ko: [post.category, 'ESG', '에코아이티', '지속가능경영'],
            en: [post.category, 'ESG', 'ECHOIT', 'Sustainability']
          }
        },
        status: 'published',
        views: 0,
        likes: 0,
        comments: [],
        category: post.category,
        tags: tags,
        relatedPosts: [],
        createdAt: new Date(post.date),
        updatedAt: new Date(),
        publishedAt: new Date(post.date),
        lastModifiedAt: new Date()
      });
      
      console.log(`ESG 마이그레이션 완료: ${post.title.ko}`);
    }
  } catch (error) {
    console.error('ESG 마이그레이션 오류:', error);
  }
}

// 기존 데이터 삭제
async function clearExistingData() {
  try {
    const { db } = await connectToDatabase();
    await db.collection('posts').deleteMany({});
    console.log('기존 데이터 삭제 완료');
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
  }
}

// 마이그레이션 실행
async function runMigration() {
  console.log('마이그레이션 시작...');
  await clearExistingData();
  await migrateNews();
  await migrateESG();
  console.log('마이그레이션 완료');
  process.exit(0);
}

runMigration(); 