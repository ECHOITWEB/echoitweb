// Google 번역 API를 사용한 번역 유틸리티

/**
 * 한국어 텍스트를 영어로 번역하는 함수
 * @param text 번역할 한국어 텍스트
 * @returns 번역된 영어 텍스트
 */
export async function translateKoToEn(text: string): Promise<string> {
  if (!text.trim()) return '';
  
  try {
    // Google Translation API 로직
    // 실제 프로덕션에서는 API 키를 환경 변수로 관리해야 함
    const endpoint = 'https://translation.googleapis.com/language/translate/v2';
    
    const response = await fetch(`${endpoint}?key=${process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'ko',
        target: 'en',
        format: 'text'
      })
    });

    const data = await response.json();
    
    if (data?.data?.translations?.[0]?.translatedText) {
      return data.data.translations[0].translatedText;
    }
    
    return text; // 번역 실패시 원본 반환
  } catch (error) {
    console.error('Translation error:', error);
    return text; // 에러 발생시 원본 반환
  }
}

/**
 * API 키가 없는 경우를 위한 대체 번역 함수 (간단한 데모용)
 * Google Translate API 키가 없는 경우 사용
 * @param text 번역할 한국어 텍스트
 * @returns 번역된 영어 텍스트 (실제로는 간단한 대체)
 */
export async function fallbackTranslateKoToEn(text: string): Promise<string> {
  if (!text.trim()) return '';
  
  // 실제 번역 대신 간단한 로직으로 대체
  // 개발 및 테스트 환경에서만 사용해야 함
  
  // 간단한 단어 사전 - 실제로는 매우 제한적
  const dictionary: Record<string, string> = {
    '안녕하세요': 'Hello',
    '회사': 'Company',
    '뉴스': 'News',
    '제목': 'Title',
    '내용': 'Content',
    '요약': 'Summary',
    '작성자': 'Author',
    '날짜': 'Date',
    '카테고리': 'Category',
    '환경': 'Environment',
    '사회': 'Society',
    '지배구조': 'Governance',
    '이미지': 'Image',
    '링크': 'Link'
  };
  
  // 실제 번역 API 없이 간단한 단어 교체로 대체 (데모용)
  let translated = text;
  Object.entries(dictionary).forEach(([ko, en]) => {
    translated = translated.replace(new RegExp(ko, 'g'), en);
  });
  
  // 번역 API를 사용하는 것처럼 비동기 동작 시뮬레이션
  return new Promise(resolve => {
    setTimeout(() => resolve(translated), 500);
  });
}

/**
 * 환경에 따라 적절한 번역 함수를 선택하여 사용
 * @param text 번역할 한국어 텍스트
 * @returns 번역된 영어 텍스트
 */
export async function translateText(text: string): Promise<string> {
  // API 키가 설정되어 있으면 실제 Google API 사용, 아니면 대체 함수 사용
  if (process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY) {
    return translateKoToEn(text);
  } else {
    console.warn('Google Translation API key not found, using fallback translation');
    return fallbackTranslateKoToEn(text);
  }
} 