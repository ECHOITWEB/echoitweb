import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
const esgService = require('@/lib/services/esg.service');
const { validateToken } = require('@/lib/auth/jwt');

/**
 * GET 요청 핸들러 - 모든 ESG 게시물이나 지정된 ID의 게시물 반환
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const title = searchParams.get('title');
    const publishedOnly = searchParams.get('published');

    console.log('[ESG API] GET 요청 받음:', { id, category, title, publishedOnly });

    let result;

    if (id) {
      result = await esgService.getESGById(id);
      if (!result) {
        return NextResponse.json({ message: 'ESG 게시물을 찾을 수 없습니다.' }, { status: 404 });
      }
    } else if (category) {
      result = await esgService.getESGByCategory(category);
    } else if (title) {
      result = await esgService.getESGByTitle(title);
    } else if (publishedOnly === 'true') {
      result = await esgService.getPublishedESG();
    } else {
      result = await esgService.getAllESG();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ESG API] GET 요청 처리 중 오류:', error);
    return NextResponse.json({ message: '서버 오류', error: error.message }, { status: 500 });
  }
}

/**
 * POST 요청 핸들러 - 새 ESG 게시물 생성
 */
export async function POST(request) {
  try {
    // 헤더에서 토큰 검증
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: '인증 토큰이 필요합니다.' }, { status: 401 });
    }
    
    const token = authorization.split(' ')[1];
    const validationResult = validateToken(token);
    
    if (!validationResult.valid) {
      return NextResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 요청 본문 파싱
    const data = await request.json();
    console.log('[ESG API] POST 요청 받음:', JSON.stringify(data).slice(0, 200) + '...');

    // 필수 필드 검증
    if (!data.title || !data.content || !data.category) {
      return NextResponse.json(
        { message: '제목, 내용, 카테고리는 필수 항목입니다.' }, 
        { status: 400 }
      );
    }

    // ESG 게시물 생성
    const result = await esgService.createESG(data);

    if (result.success) {
      return NextResponse.json(
        { message: 'ESG 게시물이 성공적으로 생성되었습니다.', id: result.id }, 
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: 'ESG 게시물 생성 실패', error: result.error }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[ESG API] POST 요청 처리 중 오류:', error);
    return NextResponse.json({ message: '서버 오류', error: error.message }, { status: 500 });
  }
}

/**
 * PUT 요청 핸들러 - 기존 ESG 게시물 업데이트
 */
export async function PUT(request) {
  try {
    // 헤더에서 토큰 검증
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: '인증 토큰이 필요합니다.' }, { status: 401 });
    }
    
    const token = authorization.split(' ')[1];
    const validationResult = validateToken(token);
    
    if (!validationResult.valid) {
      return NextResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // URL 파라미터에서 ID 가져오기
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ message: 'ESG 게시물 ID가 필요합니다.' }, { status: 400 });
    }

    // 요청 본문 파싱
    const data = await request.json();
    console.log(`[ESG API] ID ${id}의 ESG 게시물 업데이트 요청:`, JSON.stringify(data).slice(0, 200) + '...');

    // ESG 게시물 업데이트
    const result = await esgService.updateESG(id, data);

    if (result.success) {
      return NextResponse.json({ message: 'ESG 게시물이 성공적으로 업데이트되었습니다.' });
    } else {
      return NextResponse.json(
        { message: 'ESG 게시물 업데이트 실패', error: result.error }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[ESG API] PUT 요청 처리 중 오류:', error);
    return NextResponse.json({ message: '서버 오류', error: error.message }, { status: 500 });
  }
}

/**
 * DELETE 요청 핸들러 - ESG 게시물 삭제
 */
export async function DELETE(request) {
  try {
    // 헤더에서 토큰 검증
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: '인증 토큰이 필요합니다.' }, { status: 401 });
    }
    
    const token = authorization.split(' ')[1];
    const validationResult = validateToken(token);
    
    if (!validationResult.valid) {
      return NextResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // URL 파라미터에서 ID 가져오기
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ message: 'ESG 게시물 ID가 필요합니다.' }, { status: 400 });
    }

    console.log(`[ESG API] ID ${id}의 ESG 게시물 삭제 요청`);

    // ESG 게시물 삭제
    const result = await esgService.deleteESG(id);

    if (result.success) {
      return NextResponse.json({ message: 'ESG 게시물이 성공적으로 삭제되었습니다.' });
    } else {
      return NextResponse.json(
        { message: 'ESG 게시물 삭제 실패', error: result.error }, 
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[ESG API] DELETE 요청 처리 중 오류:', error);
    return NextResponse.json({ message: '서버 오류', error: error.message }, { status: 500 });
  }
} 