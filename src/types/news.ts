export enum NewsCategory {
  COMPANY = 'company',
  PRODUCT = 'product',
  AWARD = 'award',
  MEDIA = 'media',
  EVENT = 'event',
  PARTNERSHIP = 'partnership',
  NEWSLETTER = 'newsletter',
  INVESTMENT = 'investment',
  OTHER = 'other'
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

export interface INewsPostClient {
  _id?: string;
  id?: string;
  title: IMultiLingual;
  summary: IMultiLingual;
  content: IMultiLingual;
  category: NewsCategory;
  author?: Author;
  publishDate: Date | string;
  imageSource?: string;
  originalUrl?: string;
  viewCount: number;
  isPublished: boolean;
  slug: string;
  date?: string; // 이전 형식 호환용
  imageSrc?: string; // 이전 형식 호환용
  excerpt?: IMultiLingual; // 이전 형식 호환용
} 