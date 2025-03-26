import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { ESGPost } from '@/lib/db/models/ESGPost';
import { AuthorDepartment } from '@/types/esg';
import { translate } from '@/lib/translate';
import { requireEditor } from '@/lib/auth/middleware';
import { createSlug } from '@/lib/utils/slug';

export async function POST(req: NextRequest) {
  try {
    console.log('ESG 포스트 생성 요청 시작');
    
    // 에디터 권한 체크
    const user = await requireEditor(req);
    
    console.log('권한 체크 결과:', user ? '권한 있음' : '권한 없음');
    
    if (!user) {
      console.log('권한 거부: 에디터 권한 없음');
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    console.log('인증된 사용자:', user.username, '역할:', user.role, user.roles);

    await connectToDatabase();
    const data = await req.json();
    const { title, summary, content, category, publishDate, imageSource, author, tags } = data;

    // 필수 필드 체크
    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // author 필드 처리
    if (!author) {
      return NextResponse.json(
        { success: false, error: '작성자 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 슬러그 생성
    const slug = await createSlug(title.ko || title);

    // 작성자 정보 구성
    const authorData = {
      name: typeof author === 'string' ? author : author.name || '관리자', 
      department: typeof author === 'string' ? AuthorDepartment.ADMIN : author.department || AuthorDepartment.ADMIN
    };

    const post = await ESGPost.create({
      title,
      slug,
      summary,
      content,
      category,
      author: authorData,
      publishDate: publishDate || new Date(),
      imageSource,
      thumbnailUrl: imageSource, // 이미지 필드 호환성
      isPublished: true,
      viewCount: 0,
      tags: tags || []
    });

    return NextResponse.json({ 
      success: true,
      message: 'ESG 포스트가 성공적으로 생성되었습니다.',
      post 
    });
  } catch (error: any) {
    console.error('ESG 포스트 생성 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'ESG 포스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    
    // 검색 매개변수 추출
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'publishDate';
    const order = searchParams.get('order') || 'desc';
    const isMainFeatured = searchParams.get('isMainFeatured');
    const tag = searchParams.get('tag');

    // 쿼리 조건 구성
    const query: any = {};

    // 카테고리 필터
    if (category && category !== 'all') {
      query.category = category;
    }

    // 공개 여부 필터
    if (isPublished !== null) {
      query.isPublished = isPublished === 'true';
    }

    // 메인 노출 필터
    if (isMainFeatured !== null) {
      query.isMainFeatured = isMainFeatured === 'true';
    }

    // 태그 필터
    if (tag) {
      query.tags = tag;
    }

    // 검색어 필터
    if (search) {
      query.$or = [
        { 'title.ko': { $regex: search, $options: 'i' } }, 
        { 'summary.ko': { $regex: search, $options: 'i' } },
        { 'content.ko': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // 총 게시물 수 카운트
    const total = await ESGPost.countDocuments(query);

    // 정렬 설정
    const sortOptions: any = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // 페이지네이션 적용
    const skip = (page - 1) * limit;

    // 게시물 목록 조회
    const posts = await ESGPost.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('ESG 게시물 목록 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'ESG 게시물 목록을 불러오는 중 오류가 발생했습니다.' 
    }, { 
      status: 500 
    });
  }
} 