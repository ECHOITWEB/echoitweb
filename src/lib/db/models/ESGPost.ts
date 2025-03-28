import mongoose, { Schema, Document, Types } from 'mongoose';
import { ESGCategory, AuthorDepartment, IMultiLingual } from '@/types/esg';

// ESG 게시물 문서 인터페이스
export interface IESGPost extends Document {
  title: IMultiLingual;
  summary: IMultiLingual;
  content: IMultiLingual;
  category: ESGCategory;
  author: {
    department: AuthorDepartment;
    name: string;
  };
  publishDate: Date;
  originalUrl?: string; // 선택사항: 원본 링크
  isMainFeatured: boolean; // 메인 노출 여부
  scheduledPublishDate?: Date; // 선택사항: 예약 송출 시간
  imageSource?: string; // 대표 이미지 URL (News와 일관성)
  thumbnailUrl?: string; // 선택사항: 대표 이미지 URL (기존 호환성 유지)
  viewCount: number;
  isPublished: boolean;
  slug: string; // 슬러그 필드 추가 (News와 일관성)
  tags: string[]; // 태그 필드 추가
  createdAt: Date;
  updatedAt: Date;
}

// 다국어 콘텐츠를 위한 스키마
const multiLingualSchema = new Schema<IMultiLingual>({
  ko: { type: String, required: true },
  en: { type: String, required: false } // 영문은 선택사항으로 변경
}, { _id: false });

// ESG 게시물 스키마
const esgPostSchema = new Schema<IESGPost>(
  {
    title: {
      type: multiLingualSchema,
      required: true,
      validate: {
        validator: function(v: IMultiLingual) {
          return v.ko.length > 0;
        },
        message: '제목은 필수 입력 항목입니다.'
      }
    },
    summary: {
      type: multiLingualSchema,
      required: true,
      validate: {
        validator: function(v: IMultiLingual) {
          return v.ko.length > 0 && v.ko.length <= 200;
        },
        message: '요약은 필수 입력 항목이며 200자를 초과할 수 없습니다.'
      }
    },
    content: {
      type: multiLingualSchema,
      required: true,
      validate: {
        validator: function(v: IMultiLingual) {
          return v.ko.length > 0;
        },
        message: '내용은 필수 입력 항목입니다.'
      }
    },
    category: {
      type: String,
      enum: Object.values(ESGCategory),
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
    publishDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    originalUrl: {
      type: String,
      required: false,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: '올바른 URL 형식이 아닙니다.'
      }
    },
    isMainFeatured: {
      type: Boolean,
      default: true
    },
    scheduledPublishDate: {
      type: Date,
      required: false
    },
    imageSource: {
      type: String,
      required: false
    },
    thumbnailUrl: {
      type: String,
      required: false
    },
    viewCount: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    slug: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 게시물 제목으로 인덱스 생성
esgPostSchema.index({ 'title.ko': 1 });
esgPostSchema.index({ category: 1, publishDate: -1 });
esgPostSchema.index({ slug: 1 }, { unique: true });
esgPostSchema.index({ tags: 1 }); // 태그 검색용 인덱스 추가

// mongoose 객체 확인 후 등록 (SSR 및 클라이언트 측 렌더링 호환성)
export const ESGPost = mongoose.models.ESGPost || mongoose.model<IESGPost>('ESGPost', esgPostSchema);

// default export도 함께 제공하여 호환성 유지
export default ESGPost;
