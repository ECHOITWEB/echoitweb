import axios from 'axios';

/**
 * X.AI API를 사용하여 텍스트로 이미지 생성
 * @param prompt 이미지 생성 프롬프트
 * @returns 이미지 URL 또는 null
 */
export async function generateImageFromText(prompt: string): Promise<string | null> {
  try {
    const apiKey = process.env.XAI_API_KEY;
    console.log('API 키 확인:', apiKey ? '설정됨' : '미설정');
    
    if (!apiKey) {
      console.error('X.AI API 키가 설정되지 않았습니다.');
      return null;
    }
    
    // 로컬에서 테스트용 더미 이미지 URL 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경에서는 더미 이미지 사용');
      return 'https://picsum.photos/1024/1024'; // 테스트용 랜덤 이미지
    }
    
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        messages: [
          {
            role: "system",
            content: "You are an AI that only responds with a valid image URL from a reliable source like Unsplash or similar. Respond only with the URL."
          },
          {
            role: "user",
            content: `Find a professional image for: ${prompt}`
          }
        ],
        model: "grok-1",
        stream: false,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        }
      }
    );
    
    const imageUrl = response.data.choices[0].message.content.trim();
    if (!imageUrl || !imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i)) {
      console.error('유효하지 않은 이미지 URL:', imageUrl);
      return null;
    }
    
    return imageUrl;
  } catch (error) {
    console.error('텍스트-이미지 생성 오류:', error);
    if (axios.isAxiosError(error)) {
      console.error('API 응답:', error.response?.data);
    }
    return null;
  }
}

/**
 * X.AI API를 사용하여 이미지 생성 (Buffer 반환)
 */
export async function generateAIImage(prompt: string): Promise<Buffer | null> {
  try {
    // 먼저 이미지 URL 생성
    const imageUrl = await generateImageFromText(prompt);
    if (!imageUrl) {
      console.error('이미지 URL 생성 실패');
      return null;
    }
    
    console.log('이미지 URL 생성됨:', imageUrl);
    
    // 이미지 다운로드
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    if (imageResponse.status !== 200) {
      console.error('이미지 다운로드 실패:', imageResponse.status);
      return null;
    }
    
    // Buffer로 변환하여 반환
    return Buffer.from(imageResponse.data);
  } catch (error) {
    console.error('AI 이미지 생성 오류:', error);
    return null;
  }
} 