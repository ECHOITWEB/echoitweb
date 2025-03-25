import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';

// 다국어 콘텐츠를 위한 인터페이스
interface IMultiLingual {
  ko: string;
  en: string;
}

// 뉴스 게시물 문서 인터페이스
export interface INewsPost extends Document {
  title: IMultiLingual;
  subtitle: IMultiLingual;
  content: IMultiLingual;
  slug: string;
  author: Types.ObjectId | IUser;
  imageUrl: string;
  category: string;
  tags: string[];
  viewCount: number;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// 다국어 콘텐츠를 위한 스키마
const multiLingualSchema = new Schema<IMultiLingual>({
  ko: { type: String, required: true },
  en: { type: String, required: true }
}, { _id: false });

// 뉴스 게시물 스키마
const newsPostSchema = new Schema<INewsPost>(
  {
    title: {
      type: multiLingualSchema,
      required: true,
      validate: {
        validator: function(v: IMultiLingual) {
          return v.ko.length > 0 && v.en.length > 0;
        },
        message: '제목은 한국어와 영어 모두 입력해야 합니다.'
      }
    },
    subtitle: {
      type: multiLingualSchema,
      required: true
    },
    content: {
      type: multiLingualSchema,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    viewCount: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// 게시물 제목과 슬러그로 인덱스 생성
newsPostSchema.index({ 'title.ko': 1 });
newsPostSchema.index({ 'title.en': 1 });

// 게시물 게시 시 publishedAt 자동 설정
newsPostSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// 모델 생성 및 내보내기
export const NewsPost = mongoose.models.NewsPost || mongoose.model<INewsPost>('NewsPost', newsPostSchema);

export default NewsPost;
