export enum ESGCategory {
  ENVIRONMENT = 'environment', // 환경
  SOCIAL = 'social', // 사회
  GOVERNANCE = 'governance', // 지배구조
  ESG_MANAGEMENT = 'esg_management', // ESG 경영
  SUSTAINABILITY = 'sustainability', // 지속가능성
  CSR = 'csr', // 사회공헌
  OTHER = 'other' // 기타
}

export enum AuthorDepartment {
  ESG = 'ESG 경영팀',
  CSR = '사회공헌팀',
  RND = '기술연구소',
  HR = '인사팀',
  ADMIN = '운영자',
  EDITOR = '편집자',
  USER = '일반 사용자',
  CUSTOM = '직접 입력'
}

export interface IMultiLingual {
  ko: string;
  en?: string;
}

export interface Author {
  name: string;
  department: AuthorDepartment;
}

export interface IESGPostClient {
  title: IMultiLingual;
  summary: IMultiLingual;
  content: IMultiLingual;
  category: ESGCategory;
  author: Author;
  publishDate: Date;
  originalUrl?: string;
  isMainFeatured: boolean;
  scheduledPublishDate?: Date;
  imageSource?: string;
  thumbnailUrl?: string;
  viewCount: number;
  isPublished: boolean;
  tags: string[];
} 