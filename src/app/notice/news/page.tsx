import React from 'react'
import { getPublishedNewsPosts } from '@/lib/services/posts'
import NewsPageClient from '@/components/pages/news-page-client'

export default async function NewsPage() {
  // 서버에서 데이터 가져오기
  let initialPosts: any[] = [];
  let featuredPosts: any[] = [];
  
  try {
    initialPosts = await getPublishedNewsPosts(20) || [];
    
    // isMainFeatured가 true인 게시물을 필터링
    featuredPosts = initialPosts.filter((post: any) => post.isMainFeatured === true);
    
    // 메인 노출 게시물이 없을 경우 첫 번째 게시물을 대신 사용
    if (featuredPosts.length === 0 && initialPosts.length > 0) {
      featuredPosts = [initialPosts[0]];
    }
  } catch (error) {
    console.error('뉴스 데이터 가져오기 오류:', error);
    // 오류 발생 시 빈 배열 사용
  }
  
  return <NewsPageClient initialPosts={initialPosts} featuredPosts={featuredPosts} />
}
