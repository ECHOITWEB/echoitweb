import { NewsPost } from '@/lib/db/models/NewsPost';
import { ESGPost } from '@/lib/db/models/ESGPost';
import { v4 as uuidv4 } from 'uuid';

/**
 * 문자열에서 URL 친화적인 슬러그를 생성합니다.
 * 
 * @param input 슬러그로 변환할 문자열 또는 객체
 * @returns 생성된 슬러그
 */
export async function createSlug(input: string | { ko: string; en?: string }): Promise<string> {
  try {
    // 입력 처리
    let text = '';
    if (typeof input === 'string') {
      text = input;
    } else if (input && typeof input === 'object') {
      text = input.ko || input.en || '';
    }

    // 유효한 텍스트가 없는 경우
    if (!text || text.trim().length === 0) {
      // 랜덤 UUID + 타임스탬프 생성
      return `post-${Date.now()}-${uuidv4().substring(0, 8)}`;
    }

    // 한글, 영문, 특수문자 등을 처리
    let slug = text
      .toLowerCase()                    // 소문자로 변환
      .replace(/[^\w\s-]/g, '')        // 알파벳, 숫자, 밑줄, 공백, 하이픈을 제외한 모든 문자 제거
      .replace(/[\s_-]+/g, '-')        // 공백, 밑줄, 하이픈을 단일 하이픈으로 대체
      .replace(/^-+|-+$/g, '')         // 시작과 끝에 있는 하이픈 제거
      .trim();                          // 양쪽 공백 제거

    // 한글이 포함된 경우 더 간단한 형식으로 처리
    if (/[\u3131-\u318F\uAC00-\uD7A3]/g.test(text)) {
      // 한글이 포함된 경우 첫 두 단어만 사용하고 나머지는 버림
      const words = slug.split('-');
      const firstWords = words.slice(0, Math.min(2, words.length)).join('-');
      
      // 슬러그가 너무 길면 자르기
      slug = firstWords.substring(0, 20);
      
      // 타임스탬프 추가
      slug = `${slug}-${Date.now()}`;
    } else {
      // 영어 및 기타 문자의 경우 더 많은 단어 유지
      // 슬러그가 너무 길면 자르기
      if (slug.length > 30) {
        slug = slug.substring(0, 30);
      }
      
      // 슬러그가 너무 짧으면 타임스탬프 추가
      if (slug.length < 5) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // 슬러그가 비어있으면 기본값 생성
    if (!slug || slug.length === 0) {
      slug = `post-${Date.now()}`;
    }

    return slug;
  } catch (error) {
    console.error('슬러그 생성 중 오류:', error);
    // 오류 발생 시 타임스탬프와 랜덤 ID로 대체
    return `post-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
} 