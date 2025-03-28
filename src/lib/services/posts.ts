'use server';

import { connectDB } from '@/lib/db';
import { NewsPost } from '@/lib/db/models/NewsPost';
import ESGPostModel from '@/lib/db/models/ESGPost';

// NewsPost 관련 함수
export async function getPublishedNewsPosts(limit?: number) {
  try {
    await connectDB();
    const query = { isPublished: true };
    
    let postsQuery = NewsPost.find(query)
      .sort({ publishDate: -1 });
    
    if (limit) {
      postsQuery = postsQuery.limit(limit);
    }
    
    const posts = await postsQuery.exec();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('뉴스 포스트 조회 중 오류 발생:', error);
    return [];
  }
}

export async function getNewsPostBySlug(slug: string) {
  try {
    await connectDB();
    const post = await NewsPost.findOne({ slug, isPublished: true });
    return post ? JSON.parse(JSON.stringify(post)) : null;
  } catch (error) {
    console.error('뉴스 포스트 조회 중 오류 발생:', error);
    return null;
  }
}

export async function getNewsPostsByCategory(category: string, limit?: number) {
  try {
    await connectDB();
    const query = { category, isPublished: true };
    
    let postsQuery = NewsPost.find(query)
      .sort({ publishDate: -1 });
    
    if (limit) {
      postsQuery = postsQuery.limit(limit);
    }
    
    const posts = await postsQuery.exec();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('뉴스 포스트 조회 중 오류 발생:', error);
    return [];
  }
}

export async function searchNewsPosts(keyword: string) {
  try {
    await connectDB();
    const searchRegex = new RegExp(keyword, 'i');
    
    const posts = await NewsPost.find({
      isPublished: true,
      $or: [
        { 'title.ko': { $regex: searchRegex } },
        { 'title.en': { $regex: searchRegex } },
        { 'summary.ko': { $regex: searchRegex } },
        { 'summary.en': { $regex: searchRegex } },
        { 'content.ko': { $regex: searchRegex } },
        { 'content.en': { $regex: searchRegex } }
      ]
    }).sort({ publishDate: -1 });
    
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('뉴스 포스트 검색 중 오류 발생:', error);
    return [];
  }
}

// ESGPost 관련 함수
export async function getPublishedESGPosts(limit?: number) {
  try {
    await connectDB();
    const query = { isPublished: true };
    
    let postsQuery = ESGPostModel.find(query)
      .sort({ publishDate: -1 });
    
    if (limit) {
      postsQuery = postsQuery.limit(limit);
    }
    
    const posts = await postsQuery.exec();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('ESG 포스트 조회 중 오류 발생:', error);
    return [];
  }
}

export async function getESGPostBySlug(slug: string) {
  try {
    await connectDB();
    const post = await ESGPostModel.findOne({ slug, isPublished: true });
    return post ? JSON.parse(JSON.stringify(post)) : null;
  } catch (error) {
    console.error('ESG 포스트 조회 중 오류 발생:', error);
    return null;
  }
}

export async function getESGPostsByCategory(category: string, limit?: number) {
  try {
    await connectDB();
    const query = { category, isPublished: true };
    
    let postsQuery = ESGPostModel.find(query)
      .sort({ publishDate: -1 });
    
    if (limit) {
      postsQuery = postsQuery.limit(limit);
    }
    
    const posts = await postsQuery.exec();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('ESG 포스트 조회 중 오류 발생:', error);
    return [];
  }
}

export async function searchESGPosts(keyword: string) {
  try {
    await connectDB();
    const searchRegex = new RegExp(keyword, 'i');
    
    const posts = await ESGPostModel.find({
      isPublished: true,
      $or: [
        { 'title.ko': { $regex: searchRegex } },
        { 'title.en': { $regex: searchRegex } },
        { 'summary.ko': { $regex: searchRegex } },
        { 'summary.en': { $regex: searchRegex } },
        { 'content.ko': { $regex: searchRegex } },
        { 'content.en': { $regex: searchRegex } }
      ]
    }).sort({ publishDate: -1 });
    
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('ESG 포스트 검색 중 오류 발생:', error);
    return [];
  }
} 