import { NewsPost } from '@/lib/db/models/NewsPost';
import { ESGPost } from '@/lib/db/models/ESGPost';

/**
 * 한글 제목을 영문 슬러그로 변환
 */
export async function createSlug(title: string | any): Promise<string> {
  // title이 객체인 경우 처리
  let titleText = '';
  
  if (typeof title === 'object' && title !== null) {
    console.log('슬러그 생성: title이 객체입니다', title);
    if (title.ko) {
      titleText = title.ko;
    } else {
      // 첫 번째 속성 값 사용
      const firstValue = Object.values(title)[0];
      if (typeof firstValue === 'string') {
        titleText = firstValue;
      }
    }
  } else if (typeof title === 'string') {
    titleText = title;
  } else {
    console.error('슬러그 생성 오류: 유효하지 않은 title 형식', title);
    // 기본값 생성 (현재 타임스탬프 사용)
    titleText = `untitled-${Date.now()}`;
  }
  
  console.log('슬러그 생성 시작:', titleText);
  
  // 한글을 로마자로 변환 (Hangul Romanization)
  const romanized = titleText
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
    
  console.log('로마자 변환 결과:', romanized);

  // 기본 슬러그
  let slug = romanized;
  let counter = 1;
  
  console.log('초기 슬러그:', slug);

  // 중복 체크 및 처리
  while (true) {
    // NewsPost와 ESGPost 모두에서 중복 검사
    const existingNewsPost = await NewsPost.findOne({ slug });
    const existingESGPost = await ESGPost.findOne({ slug });
    
    console.log('슬러그 중복 체크:', slug, '뉴스:', !!existingNewsPost, 'ESG:', !!existingESGPost);
    
    // 어느 쪽에도
    if (!existingNewsPost && !existingESGPost) break;

    // 중복되면 숫자를 붙임
    slug = `${romanized}-${counter}`;
    console.log('슬러그 재생성:', slug);
    counter++;
  }
  
  console.log('최종 슬러그:', slug);
  return slug;
} 