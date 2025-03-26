import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}')
});

export async function translateText(
  text: string,
  sourceLang: string = 'ko',
  targetLang: string = 'en'
): Promise<string> {
  try {
    const [translation] = await translate.translate(text, {
      from: sourceLang,
      to: targetLang
    });
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // 번역 실패 시 원본 텍스트 반환
  }
}

export { translateText as translate }; 