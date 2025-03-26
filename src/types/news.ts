export enum NewsCategory {
  COMPANY = 'company',
  PRODUCT = 'product',
  AWARD = 'award',
  PARTNERSHIP = 'partnership',
  NEWSLETTER = 'newsletter',
  INVESTMENT = 'investment'
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

export interface INewsPostClient {
  title: IMultiLingual;
  summary: IMultiLingual;
  content: IMultiLingual;
  category: NewsCategory;
  author: {
    department: AuthorDepartment;
    name: string;
  };
  publishDate: Date;
  originalUrl?: string;
  isMainFeatured: boolean;
  scheduledPublishDate?: Date;
  thumbnailUrl?: string;
  viewCount: number;
  isPublished: boolean;
} 