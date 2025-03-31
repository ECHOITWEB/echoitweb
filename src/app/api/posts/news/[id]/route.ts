import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest, requireEditor } from '@/lib/auth/middleware';

// 기존 임포트 대신 통합 뉴스 서비스 모듈 사용
const newsService = require('@/lib/services/news.service');

/**
 * 특정 ID의 뉴스 조회 API
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`뉴스 조회 요청 - ID: ${params.id}`);
    
    const news = await newsService.getNewsById(params.id);
    
    if (!news) {
      console.log(`뉴스를 찾을 수 없음 - ID: ${params.id}`);
      return NextResponse.json({
        success: false,
        message: '뉴스를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    console.log(`뉴스 조회 성공 - ID: ${params.id}, 제목: ${news.title?.ko || 'N/A'}`);
    
    return NextResponse.json({
      success: true,
      post: news
    });
  } catch (error: any) {
    console.error(`뉴스 조회 오류 - ID: ${params.id}:`, error);
    return NextResponse.json({
      success: false,
      message: error.message || '뉴스를 조회하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 뉴스 업데이트 API
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await requireEditor(authReq);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '권한이 없습니다.'
      }, { status: 403 });
    }
    
    const { id } = params;
    const updateData = await req.json();
    
    console.log(`[API] News 게시물 수정 요청 - ID: ${id}, 데이터:`, updateData);
    
    // 현재 뉴스 확인
    const existingNews = await newsService.getNewsById(id);
    if (!existingNews) {
      return NextResponse.json({
        success: false,
        message: '뉴스를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    // 뉴스 업데이트
    const updatedNews = await newsService.updateNews(id, updateData);
    
    console.log(`[API] News 게시물 수정 완료 - ID: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: '뉴스가 성공적으로 업데이트되었습니다.',
      post: updatedNews
    });
  } catch (error: any) {
    console.error(`뉴스 업데이트 오류 - ID: ${params.id}:`, error);
    return NextResponse.json({
      success: false,
      message: error.message || '뉴스를 업데이트하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 뉴스 삭제 API
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await requireEditor(authReq);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '권한이 없습니다.'
      }, { status: 403 });
    }
    
    const { id } = params;
    
    console.log(`[API] News 게시물 삭제 요청 - ID: ${id}`);
    
    // 현재 뉴스 확인
    const existingNews = await newsService.getNewsById(id);
    if (!existingNews) {
      return NextResponse.json({
        success: false,
        message: '뉴스를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    // 뉴스 삭제
    await newsService.deleteNews(id);
    
    console.log(`[API] News 게시물 삭제 완료 - ID: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: '뉴스가 성공적으로 삭제되었습니다.'
    });
  } catch (error: any) {
    console.error(`뉴스 삭제 오류 - ID: ${params.id}:`, error);
    return NextResponse.json({
      success: false,
      message: error.message || '뉴스를 삭제하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 