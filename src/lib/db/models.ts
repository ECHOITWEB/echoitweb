// MongoDB 모델 정의
import { ObjectId } from 'mongodb';

// 다국어 콘텐츠 인터페이스
export interface MultiLingual {
  ko: string;
  en?: string;
}

// 사용자 모델
export interface IUser {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  name: string;
  department: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// 뉴스 게시물 모델
export interface INewsPost {
  _id?: ObjectId;
  title: MultiLingual;
  summary?: MultiLingual;
  content: MultiLingual;
  category: string;
  author: {
    _id?: string;
    name: string;
    department: string;
  } | string;
  thumbnailUrl?: string;
  imageUrl?: string;
  imageSource?: string;
  originalUrl?: string;
  publishDate: Date;
  isPublished: boolean;
  isMainVisible: boolean;
  viewCount: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

// ESG 게시물 모델
export interface IESGPost {
  _id?: ObjectId;
  title: MultiLingual;
  summary?: MultiLingual;
  content: MultiLingual;
  category: string;
  author: {
    _id?: string;
    name: string;
    department: string;
  } | string;
  thumbnailUrl?: string;
  imageUrl?: string;
  imageSource?: string;
  originalUrl?: string;
  publishDate: Date;
  isPublished: boolean;
  isMainVisible: boolean;
  viewCount: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

// 컬렉션 이름 상수
export const User = 'users';
export const NewsPost = 'newsposts';
export const ESGPost = 'esgposts';

// 타임스탬프 업데이트 함수 (MongoDB 연산에 사용)
export const withTimestamps = (isNew = false) => {
  const now = new Date();
  return isNew
    ? { createdAt: now, updatedAt: now }
    : { updatedAt: now };
};

// 조회수 증가 함수 (MongoDB 연산에 사용)
export const incrementViewCount = () => ({
  $inc: { viewCount: 1 }
}); 