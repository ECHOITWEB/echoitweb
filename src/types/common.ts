// 이미지 소스 타입 정의
export interface ImageSource {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

// 다국어 콘텐츠 타입 정의
export interface MultiLingual {
  ko: string;
  en?: string;
}

// 작성자 정보 타입 정의
export interface Author {
  name: string;
  email: string;
  username: string;
  role: string;
} 