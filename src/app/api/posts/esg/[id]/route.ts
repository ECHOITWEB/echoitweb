import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import ESGPostModel from '@/lib/db/models/ESGPost';
import { verifyToken } from '@/lib/auth/jwt';

// 정적 생성에서 제외 (동적 라우트로 설정)
export const dynamic = 'force-dynamic';

// ESG 게시물 조회 API
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // MongoDB 연결
    await connectToDatabase();

    const id = params.id;
    console.log(`[API] ESG 게시물 조회 요청 - ID: ${id}`);

    // ID 유효성 검증
    if (!id) {
      return NextResponse.json({ success: false, message: '게시물 ID가 필요합니다.' }, { status: 400 });
    }

    // 게시물 조회 (작성자 정보 포함)
    const post = await ESGPostModel.findById(id).populate('author');
    
    if (!post) {
      console.log(`[API] ESG 게시물 없음 - ID: ${id}`);
      return NextResponse.json({ success: false, message: '해당 ID의 게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    console.log(`[API] ESG 게시물 조회 성공 - ID: ${id}, 작성자:`, post.author);
    
    return NextResponse.json({
      success: true,
      post
    });
  } catch (error: any) {
    console.error('[API] ESG 게시물 조회 오류:', error);
    return NextResponse.json(
      { success: false, message: '게시물 조회 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}

// ESG 게시물 수정 API
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // MongoDB 연결
    await connectToDatabase();

    // 요청 본문 파싱
    const body = await request.json();
    const id = params.id;

    console.log(`[API] ESG 게시물 수정 요청 - ID: ${id}, 데이터:`, body);

    // ID 유효성 검증
    if (!id) {
      return NextResponse.json({ success: false, message: '게시물 ID가 필요합니다.' }, { status: 400 });
    }

    // 게시물 존재 확인
    const existingPost = await ESGPostModel.findById(id);
    if (!existingPost) {
      return NextResponse.json({ success: false, message: '해당 ID의 게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 수정 가능한 필드 목록
    const allowedFields = ['isMainFeatured', 'isPublished', 'title', 'summary', 'content', 'category', 'imageSource', 'thumbnailUrl', 'tags', 'author', 'authorDepartment', 'publishDate'];
    
    // 업데이트할 필드만 추출
    const updateData: Record<string, any> = {};
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key];
      }
    }

    // isMainFeatured가 true로 설정된 경우, 다른 게시물의 isMainFeatured를 false로 업데이트
    // if (updateData.isMainFeatured === true) {
    //   // 현재 게시물을 제외한 다른 모든 메인 노출 게시물을 비노출로 변경
    //   console.log(`[API] 메인 노출 설정 - 기존 메인 노출 게시물 비활성화`);
    //   await ESGPostModel.updateMany(
    //     { _id: { $ne: id }, isMainFeatured: true },
    //     { $set: { isMainFeatured: false } }
    //   );
    // }

    // 게시물 업데이트
    const updatedPost = await ESGPostModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // 업데이트된 문서 반환
    );

    console.log(`[API] ESG 게시물 수정 완료 - ID: ${id}`);

    return NextResponse.json({
      success: true,
      message: '게시물이 성공적으로 업데이트되었습니다.',
      post: updatedPost
    });
  } catch (error: any) {
    console.error('[API] ESG 게시물 수정 오류:', error);
    return NextResponse.json(
      { success: false, message: '게시물 업데이트 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}

// ESG 게시물 삭제 API
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // MongoDB 연결
    await connectToDatabase();

    const id = params.id;

    console.log(`[API] ESG 게시물 삭제 요청 - ID: ${id}`);

    // ID 유효성 검증
    if (!id) {
      return NextResponse.json({ success: false, message: '게시물 ID가 필요합니다.' }, { status: 400 });
    }

    // 게시물 존재 확인
    const existingPost = await ESGPostModel.findById(id);
    if (!existingPost) {
      return NextResponse.json({ success: false, message: '해당 ID의 게시물을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 게시물 삭제
    await ESGPostModel.findByIdAndDelete(id);

    console.log(`[API] ESG 게시물 삭제 완료 - ID: ${id}`);

    return NextResponse.json({
      success: true,
      message: '게시물이 성공적으로 삭제되었습니다.'
    });
  } catch (error: any) {
    console.error('[API] ESG 게시물 삭제 오류:', error);
    return NextResponse.json(
      { success: false, message: '게시물 삭제 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 토큰 검증
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = params;

    // MongoDB 연결
    await connectToDatabase();

    // ESG 포스트 업데이트
    const updatedPost = await ESGPostModel.findByIdAndUpdate(
      id,
      {
        $set: {
          title: body.title,
          summary: body.summary,
          content: body.content,
          category: body.category,
          author: body.author,
          publishDate: body.publishDate,
          imageSource: body.imageSource,
          tags: body.tags,
          isPublished: body.isPublished,
          isMainFeatured: body.isMainFeatured,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, message: 'ESG 포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ESG 포스트가 성공적으로 업데이트되었습니다.',
      post: updatedPost
    });
  } catch (error) {
    console.error('ESG 포스트 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, message: 'ESG 포스트 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 