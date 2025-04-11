'use server';

import { connectDB } from '@/lib/db';
import NewsPost from '@/lib/db/models/NewsPost.js';
import ESGPostModel from '@/lib/db/models/ESGPost.js';

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
    console.log('getNewsPostBySlug 함수 호출됨, 슬러그:', slug);
    await connectDB();
    const post = await NewsPost.findOne({ slug });
    console.log('찾은 게시물:', post ? '게시물 있음' : '게시물 없음', post?._id);
    
    if (post) {
      const jsonPost = JSON.parse(JSON.stringify(post));
      console.log('변환된 게시물 전체 구조:', jsonPost);
      console.log('특정 필드 확인:', {
        title: jsonPost.title,
        content: jsonPost.content ? '콘텐츠 있음' : '콘텐츠 없음',
        imageSource: jsonPost.imageSource ? (typeof jsonPost.imageSource === 'object' ? 'imageSource는 객체' : 'imageSource는 문자열') : '이미지 없음',
        thumbnailPath: jsonPost.thumbnailPath || '없음',
        slug: jsonPost.slug
      });
      
      // title이 없는 경우 기본값 설정
      if (!jsonPost.title) {
        jsonPost.title = { ko: '제목 없음', en: 'No Title' };
      }
      
      // content가 없는 경우 기본값 설정
      if (!jsonPost.content) {
        jsonPost.content = { ko: '내용 없음', en: 'No Content' };
      }
      
      // imageSource 필드 정규화
      if (jsonPost.imageSource) {
        // 문자열인 경우 객체로 변환
        if (typeof jsonPost.imageSource === 'string') {
          jsonPost.imageSource = {
            thumbnail: jsonPost.imageSource,
            medium: jsonPost.imageSource,
            large: jsonPost.imageSource,
            original: jsonPost.imageSource
          };
        }
      } else {
        // 이미지가 없는 경우 기본 객체 생성
        jsonPost.imageSource = {
          thumbnail: '',
          medium: '',
          large: '',
          original: ''
        };
      }
      
      // 개별 경로 필드가 있으면 imageSource에 설정
      if (jsonPost.thumbnailPath) {
        jsonPost.imageSource.thumbnail = jsonPost.thumbnailPath;
      }
      if (jsonPost.mediumPath) {
        jsonPost.imageSource.medium = jsonPost.mediumPath;
      }
      if (jsonPost.largePath) {
        jsonPost.imageSource.large = jsonPost.largePath;
      }
      if (jsonPost.originalPath) {
        jsonPost.imageSource.original = jsonPost.originalPath;
      }
      
      return jsonPost;
    }
    
    return null;
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
    const post = await ESGPostModel.findOne({ slug });
    
    if (post) {
      const jsonPost = JSON.parse(JSON.stringify(post));
      
      // title이 없는 경우 기본값 설정
      if (!jsonPost.title) {
        jsonPost.title = { ko: '제목 없음', en: 'No Title' };
      }
      
      // content가 없는 경우 기본값 설정
      if (!jsonPost.content) {
        jsonPost.content = { ko: '내용 없음', en: 'No Content' };
      }
      
      // imageSource 필드 정규화
      if (jsonPost.imageSource) {
        // 문자열인 경우 객체로 변환
        if (typeof jsonPost.imageSource === 'string') {
          jsonPost.imageSource = {
            thumbnail: jsonPost.imageSource,
            medium: jsonPost.imageSource,
            large: jsonPost.imageSource,
            original: jsonPost.imageSource
          };
        }
      } else {
        // 이미지가 없는 경우 기본 객체 생성
        jsonPost.imageSource = {
          thumbnail: '',
          medium: '',
          large: '',
          original: ''
        };
      }
      
      // 개별 경로 필드가 있으면 imageSource에 설정
      if (jsonPost.thumbnailPath) {
        jsonPost.imageSource.thumbnail = jsonPost.thumbnailPath;
      }
      if (jsonPost.mediumPath) {
        jsonPost.imageSource.medium = jsonPost.mediumPath;
      }
      if (jsonPost.largePath) {
        jsonPost.imageSource.large = jsonPost.largePath;
      }
      if (jsonPost.originalPath) {
        jsonPost.imageSource.original = jsonPost.originalPath;
      }
      
      return jsonPost;
    }
    
    return null;
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