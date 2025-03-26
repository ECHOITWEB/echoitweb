import { NewsPost } from '@/lib/db/models/NewsPost';

/**
 * 한글 제목을 영문 슬러그로 변환
 */
export async function createSlug(title: string): Promise<string> {
  // 한글을 로마자로 변환 (Hangul Romanization)
  const romanized = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 기본 슬러그
  let slug = romanized;
  let counter = 1;

  // 중복 체크 및 처리
  while (true) {
    const existingPost = await NewsPost.findOne({ slug });
    if (!existingPost) break;

    // 중복되면 숫자를 붙임
    slug = `${romanized}-${counter}`;
    counter++;
  }

  return slug;
} 