import React from 'react'
import { getPublishedESGPosts } from '@/lib/services/posts'
import ESGPageClient from '@/components/pages/esg-page-client'

export default async function ESGPage() {
  // 서버에서 데이터 가져오기
  let initialPosts: any[] = [];
  let recentPosts: any[] = [];
  
  try {
    initialPosts = await getPublishedESGPosts(30) || [];
    
    // isMainFeatured가 true인 게시물을 필터링하여 최근 게시물로 사용
    recentPosts = initialPosts.filter((post: any) => post.isMainFeatured === true);
    
    // 메인 노출 게시물이 없을 경우 최신 3개 게시물을 대신 사용
    if (recentPosts.length === 0) {
      recentPosts = initialPosts.slice(0, 3);
    }
  } catch (error) {
    console.error('ESG 데이터 가져오기 오류:', error);
    // 오류 발생 시 빈 배열 사용
  }
  
  return <ESGPageClient initialPosts={initialPosts} recentPosts={recentPosts} />
}
