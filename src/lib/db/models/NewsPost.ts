import mongoose, { Schema, Document, Types } from 'mongoose';

export enum NewsCategory {
  COMPANY = 'company',
  PRODUCT = 'product',
  AWARD = 'award',
  MEDIA = 'media',
  EVENT = 'event',
  OTHER = 'other'
}

export enum AuthorDepartment {
  ESG = 'ESG 경영팀',
  CSR = '사회공헌팀',
  RND = '기술연구소',
  HR = '인사팀',
  ADMIN = '운영자',
  CUSTOM = '직접 입력'
}

export interface IMultiLingual {
  ko: string;
  en?: string;
}

export interface INewsPost extends Document {
  title: IMultiLingual;
  summary: IMultiLingual;
  content: IMultiLingual;
  category: NewsCategory;
  author: {
    department: AuthorDepartment;
    name: string;
  };
  publishDate: Date;
  imageSource?: string;
  originalUrl?: string;
  viewCount: number;
  isPublished: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const multiLingualSchema = new Schema({
  ko: { type: String, required: true },
  en: { type: String }
});

const newsPostSchema = new Schema<INewsPost>(
  {
    title: { type: multiLingualSchema, required: true },
    summary: { type: multiLingualSchema, required: true },
    content: { type: multiLingualSchema, required: true },
    category: {
      type: String,
      enum: Object.values(NewsCategory),
      required: true
    },
    author: {
      department: {
        type: String,
        enum: Object.values(AuthorDepartment),
        required: true
      },
      name: { type: String, required: true }
    },
    publishDate: { type: Date, required: true },
    imageSource: { type: String },
    originalUrl: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: '올바른 URL 형식이 아닙니다.'
      }
    },
    viewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    slug: { type: String, required: true, unique: true }
  },
  {
    timestamps: true
  }
);

// 인덱스 생성
newsPostSchema.index({ 'title.ko': 1 });
newsPostSchema.index({ category: 1 });

export const NewsPost = mongoose.models.NewsPost || mongoose.model<INewsPost>('NewsPost', newsPostSchema);

export default NewsPost;
