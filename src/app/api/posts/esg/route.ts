import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import ESGPostModel from '@/lib/db/models/ESGPost';
import { AuthorDepartment } from '@/types/esg';
import { translate } from '@/lib/translate';
import { requireEditor } from '@/lib/auth/middleware';
import { createSlug } from '@/lib/utils/slug';
import { User } from '@/lib/db/models/User';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

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
    
    console.log('받은 데이터 확인:', {
      title: typeof title === 'object' ? JSON.stringify(title) : title,
      author: typeof author === 'object' ? JSON.stringify(author) : author
    });

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
    let slug;
    try {
      console.log('슬러그 생성 시도 중 - 입력값:', typeof title === 'object' ? JSON.stringify(title) : title);
      slug = await createSlug(title);
      console.log('슬러그 생성 완료:', slug);
      
      if (!slug) {
        throw new Error('슬러그가 생성되지 않았습니다.');
      }
    } catch (error: any) {
      console.error('슬러그 생성 중 오류:', error);
      // 기본 슬러그 생성 (fallback)
      slug = `esg-post-${Date.now()}`;
      console.log('기본 슬러그 사용:', slug);
    }

    // 작성자 정보 구성
    let authorData: any = {
      name: '관리자',
      department: AuthorDepartment.ADMIN
    };
    
    try {
      // author가 ID인 경우 사용자 정보 조회
      if (typeof author === 'string' && author.length > 10) {
        // MongoDB ID 형식인 경우 사용자 정보 조회 시도
        console.log('사용자 ID로 작성자 정보 조회 시도:', author);
        const userInfo = await User.findById(author);
        
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
          
          // 역할 결정
          let role = userInfo.role || 'viewer';
          if (userInfo.roles && Array.isArray(userInfo.roles) && userInfo.roles.length > 0) {
            if (userInfo.roles.includes('admin')) {
              role = 'admin';
            } else if (userInfo.roles.includes('editor')) {
              role = 'editor';
            }
          }
          
          authorData = {
            id: userInfo._id.toString(),
            name: displayName,
            department: role === 'admin' ? AuthorDepartment.ADMIN : 
                        role === 'editor' ? AuthorDepartment.EDITOR : 
                        AuthorDepartment.USER
          };
        } else {
          console.log('작성자 사용자 정보를 찾을 수 없음:', author);
        }
      } else if (typeof author === 'object' && author !== null) {
        authorData = {
          name: author.name || '관리자',
          department: author.department || AuthorDepartment.ADMIN
        };
      }
    } catch (error) {
      console.error('작성자 정보 처리 중 오류:', error);
      // 오류 발생 시 기본값 사용
      authorData = {
        name: user.username || '관리자',
        department: AuthorDepartment.ADMIN
      };
    }
    
    console.log('포스트 생성 시도 - 데이터:', {
      title: typeof title === 'object' ? JSON.stringify(title) : title,
      slug,
      author: JSON.stringify(authorData)
    });

    const post = await ESGPostModel.create({
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
    
    console.log('ESG 포스트 생성 성공:', post._id);

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

/**
 * GET 요청 핸들러 - ESG 포스트 목록 또는 특정 ESG 포스트 조회
 */
export async function GET(req: NextRequest) {
  let controller: AbortController | null = null;
  
  try {
    // 타임아웃 설정
    controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (controller) controller.abort();
    }, 10000); // 10초 타임아웃
    
    // DB 연결
    await connectToDatabase();
    
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const page = searchParams.has('page') ? parseInt(searchParams.get('page') as string) : 1;
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    const isPublished = searchParams.get('isPublished') === 'true';
    const withCounts = searchParams.get('withCounts') === 'true';
    const search = searchParams.get('search');
    
    // 쿼리 조건 설정
    const query: any = {};
    
    // 카테고리 필터링
    if (category) {
      query.category = category;
    }
    
    // 발행 상태 필터링
    if (isPublished !== undefined) {
      query.isPublished = isPublished;
    }
    
    // 검색어 필터링
    if (search) {
      query['$or'] = [
        { 'title.ko': { $regex: search, $options: 'i' } },
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'summary.ko': { $regex: search, $options: 'i' } },
        { 'summary.en': { $regex: search, $options: 'i' } },
        { 'content.ko': { $regex: search, $options: 'i' } },
        { 'content.en': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // 페이지네이션 설정
    const skip = (page - 1) * limit;
    
    // ESG 포스트 조회
    let posts;
    let total = 0;
    
    if (withCounts) {
      // 전체 개수와 함께 조회
      [posts, total] = await Promise.all([
        ESGPostModel.find(query)
          .sort({ publishDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        ESGPostModel.countDocuments(query)
      ]);
    } else {
      // 개수 없이 조회
      posts = await ESGPostModel.find(query)
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
    }
    
    clearTimeout(timeoutId);
    
    // 응답 생성
    const response = withCounts
      ? { success: true, posts, total, page, limit }
      : { success: true, posts };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('ESG 포스트 조회 중 오류:', error);
    
    // AbortError는 타임아웃 또는 의도적인 취소
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        message: '요청 시간이 초과되었습니다.'
      }, { status: 504 });
    }
    
    try {
      return NextResponse.json({
        success: false,
        message: '포스트 조회 중 오류가 발생했습니다.'
      }, { status: 500 });
    } catch (finalError) {
      // 응답 생성 자체에 실패한 경우 (스트림 오류 등)
      const fallbackResponse = new Response(
        JSON.stringify({
          success: false,
          message: '서버 응답 생성 중 오류가 발생했습니다.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return fallbackResponse;
    } finally {
      // 컨트롤러 정리
      if (controller) {
        controller = null;
      }
    }
  }
} 