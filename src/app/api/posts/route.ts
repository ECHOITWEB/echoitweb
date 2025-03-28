import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// 태그 검증 스키마
const tagSchema = z.array(z.string()).min(1).max(10).refine(
  (tags) => new Set(tags).size === tags.length,
  { message: "태그는 중복될 수 없습니다." }
);

// 게시물 스키마
const postSchema = z.object({
  title: z.object({
    ko: z.string().min(1),
    en: z.string().min(1)
  }),
  content: z.object({
    ko: z.string().min(1),
    en: z.string().min(1)
  }),
  excerpt: z.object({
    ko: z.string().min(1),
    en: z.string().min(1)
  }),
  type: z.enum(['news', 'esg']),
  category: z.string().min(1),
  imageSrc: z.string().url(),
  tags: tagSchema,
  author: z.string().optional()
});

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = postSchema.parse(body);

    const { db } = await connectToDatabase();

    // 슬러그 생성
    const slugKo = generateSlug(validatedData.title.ko);
    const slugEn = generateSlug(validatedData.title.en);

    // 게시물 데이터 생성
    const post = {
      ...validatedData,
      slug: {
        ko: slugKo,
        en: slugEn
      },
      meta: {
        description: {
          ko: generateMetaDescription(validatedData.content.ko),
          en: generateMetaDescription(validatedData.content.en)
        },
        keywords: {
          ko: [validatedData.category, validatedData.type === 'news' ? '뉴스' : 'ESG', '에코아이티'],
          en: [validatedData.category, validatedData.type === 'news' ? 'news' : 'ESG', 'ECHOIT']
        }
      },
      status: 'published',
      views: 0,
      likes: 0,
      comments: [],
      relatedPosts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      lastModifiedAt: new Date()
    };

    const result = await db.collection('posts').insertOne(post);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId,
        slug: post.slug
      }
    });
  } catch (error) {
    console.error('게시물 생성 오류:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '입력값이 올바르지 않습니다.',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({
      success: false,
      error: '게시물을 생성하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const posts = await db.collection('posts').find().toArray();
    
    return NextResponse.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('게시물 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '게시물을 조회하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 