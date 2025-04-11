import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';
import { createSlug } from '@/lib/utils/slug';
import { AuthorDepartment } from '@/types/news';
// 기존 임포트 대신 통합 뉴스 서비스 모듈 사용
const newsService = require('@/lib/services/news.service');
import mongoose from 'mongoose';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('뉴스 포스트 생성 요청 시작');
    
    // 에디터 권한 체크
    const authReq = req as AuthenticatedRequest;
    const user = await requireEditor(authReq);
    
    console.log('권한 체크 결과:', user ? '권한 있음' : '권한 없음');
    
    if (!user) {
      console.log('권한 거부: 에디터 권한 없음');
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    console.log('인증된 사용자:', user.username, '역할:', user.role);

    const data = await req.json();
    const { title, summary, content, category, author, publishDate, imageSource, tags } = data;
    
    console.log('받은 데이터 확인:', {
      title: typeof title === 'object' ? JSON.stringify(title) : title,
      author: typeof author === 'object' ? JSON.stringify(author) : author
    });

    // 필수 필드 체크
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 작성자 정보 구성
    let authorData: any = {
      name: user.username || '관리자',
      email: user.email || '',
      username: user.username || '관리자',
      role: user.role || 'admin'
    };
    
    // 작성자 정보 처리
    if (typeof author === 'string' && author !== 'current_user' && author.length > 10) {
      // author가 MongoDB ID인 경우 사용자 정보 조회
      try {
        console.log('사용자 ID로 작성자 정보 조회 시도:', author);
        const userModel = mongoose.models.User || mongoose.model('User');
        const userInfo = await userModel.findById(author);
        
        if (userInfo) {
          console.log('작성자 사용자 정보 조회 성공:', userInfo.username);
          
          // 이름 처리
          let displayName = '관리자';
          if (typeof userInfo.name === 'object' && userInfo.name) {
            displayName = `${userInfo.name.first || ''} ${userInfo.name.last || ''}`.trim();
          } else if (typeof userInfo.name === 'string' && userInfo.name) {
            displayName = userInfo.name;
          } else {
            displayName = userInfo.username;
          }
          
          authorData = {
            name: displayName,
            email: userInfo.email,
            username: userInfo.username,
            role: userInfo.role
          };
        }
      } catch (error) {
        console.error('작성자 사용자 정보 조회 중 오류:', error);
      }
    } else if (typeof author === 'object' && author !== null) {
      // author가 이미 객체인 경우 (AuthorSelect에서 전달된 경우)
      try {
        // JSON 문자열로 넘어온 경우 파싱
        let authorObj = author;
        if (typeof author === 'string') {
          authorObj = JSON.parse(author);
        }
        
        authorData = {
          name: authorObj.name || user.username || '관리자',
          email: authorObj.email || user.email || '',
          username: authorObj.username || user.username || '관리자',
          role: authorObj.role || user.role || 'admin'
        };
      } catch (error) {
        console.error('작성자 정보 파싱 중 오류:', error);
        authorData = {
          name: user.username || '관리자',
          email: user.email || '',
          username: user.username || '관리자',
          role: user.role || 'admin'
        };
      }
    } else if (!author || author === 'current_user') {
      // 현재 사용자 정보 사용
      authorData = {
        name: user.username || '관리자',
        email: user.email || '',
        username: user.username || '관리자',
        role: user.role || 'admin'
      };
    }

    // slug 생성 시 현재 시간 포함하여 중복 방지
    let titleForSlug = { ...(typeof title === 'object' ? title : { ko: title }) };
    let customTitle = typeof title === 'string' ? title : title.ko || '';
    
    if (customTitle.length < 5) {
      customTitle = `${customTitle}-${Date.now()}`;
      if (typeof titleForSlug === 'object') {
        titleForSlug.ko = customTitle;
      } else {
        titleForSlug = { ko: customTitle };
      }
    }

    try {
      // 새로운 통합 뉴스 서비스를 사용하여 뉴스 생성
      const newsData = {
        title,
        summary,
        content,
        category,
        author: authorData,
        publishDate: publishDate || new Date(),
        imageSource,
        tags: tags || [],
        isPublished: true,
        titleForSlug // 슬러그 생성용 제목 추가
      };
      
      const newsPost = await newsService.createNews(newsData, authorData._id);

      return NextResponse.json({ 
        message: '뉴스가 성공적으로 생성되었습니다.',
        post: newsPost 
      });
    } catch (error: any) {
      console.error('뉴스 서비스 - 뉴스 생성 오류:', error);
      
      // 중복 키 오류 (슬러그 중복) 처리
      if (error.code === 11000 && error.keyPattern?.slug) {
        return NextResponse.json(
          { 
            error: '중복된 제목입니다. 다른 제목을 사용해 주세요. 짧은 제목의 경우 내용을 조금 더 구체적으로 작성해 주세요.',
            details: '슬러그 중복 오류',
            duplicateKey: error.keyValue?.slug
          },
          { status: 409 }
        );
      }
      
      throw error; // 다른 오류는 그대로 전달
    }

  } catch (error: any) {
    console.error('뉴스 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '뉴스 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET 요청 핸들러 - 뉴스 포스트 목록 또는 특정 뉴스 포스트 조회
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const page = searchParams.has('page') ? parseInt(searchParams.get('page') as string) : 1;
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    const isPublishedParam = searchParams.get('isPublished');
    const isPublished = isPublishedParam === 'true' ? true : isPublishedParam === 'false' ? false : null;
    const withCounts = searchParams.get('withCounts') === 'true';
    const search = searchParams.get('search');
    const isAdmin = searchParams.get('admin') === 'true'; // 🔥 추가됨

    console.log('뉴스 목록 조회 요청:', { category, page, limit, isPublished, search, isAdmin });

    let news;
    let total = 0;

    // 관리자 요청이면 전체 뉴스 조회 (공개/비공개 포함)
    if (isPublished === true) {
      news = await newsService.getPublishedNews();
    } else if (isPublished === false) {
      news = await newsService.getUnpublishedNews(); // 없다면 getAllNews에서 필터링
    } else {
      news = await newsService.getAllNews(); // isPublished가 명시되지 않았을 때
    }    

    // 검색어 필터링
    if (search && news.length > 0) {
      const searchRegex = new RegExp(search, 'i');
      news = news.filter((post: any) => {
        return (
          (post.title?.ko && searchRegex.test(post.title.ko)) ||
          (post.title?.en && searchRegex.test(post.title.en)) ||
          (post.summary?.ko && searchRegex.test(post.summary.ko)) ||
          (post.summary?.en && searchRegex.test(post.summary.en)) ||
          (post.content?.ko && searchRegex.test(post.content.ko)) ||
          (post.content?.en && searchRegex.test(post.content.en)) ||
          (post.tags && post.tags.some((tag: string) => searchRegex.test(tag)))
        );
      });
    }

    total = news.length;

    // 페이지네이션
    const skip = (page - 1) * limit;
    news = news.slice(skip, skip + limit);

    console.log(`조회 결과: ${news.length}개의 뉴스 (총 ${total}개)`);

    if (withCounts) {
      return NextResponse.json({
        posts: news,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } else {
      return NextResponse.json({ posts: news });
    }

  } catch (error: any) {
    console.error('뉴스 조회 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '뉴스 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
