import mongoose from 'mongoose';

// 한글이 포함된 문자열을 URL 친화적인 문자열로 변환하는 함수
function generateSafeSlug(text) {
  if (!text) return '';
  
  // 한글이 포함되어 있는지 확인
  const containsKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
  
  if (containsKorean) {
    // 한글이 포함된 경우 타임스탬프를 추가한 기본 슬러그 생성
    const timestamp = Date.now();
    return `esg-${timestamp}`;
  }
  
  // 한글이 없는 경우 안전한 슬러그 생성 (공백을 하이픈으로 변환, 특수문자 제거)
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          // 공백을 하이픈으로 변환
    .replace(/[^\w\-]+/g, '')      // 알파벳, 숫자, 하이픈, 언더스코어 외 제거
    .replace(/\-\-+/g, '-')        // 여러 개의 하이픈을 하나로 변환
    .replace(/^-+/, '')            // 시작 부분의 하이픈 제거
    .replace(/-+$/, '');           // 끝 부분의 하이픈 제거
}

const ESGPostSchema = new mongoose.Schema({
  title: {
    ko: { type: String, required: true },
    en: { type: String }
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    ko: { type: String },
    en: { type: String }
  },
  content: {
    ko: { type: String, required: true },
    en: { type: String }
  },
  category: {
    type: String,
    enum: ['environment', 'social', 'governance', 'sustainability', 'report', 'other'],
    default: 'other',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.Mixed,
    default: '관리자'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  imageSource: {
    thumbnail: { type: String },
    medium: { type: String },
    large: { type: String },
    original: { type: String }
  },
  thumbnailUrl: { type: String },
  isPublished: {
    type: Boolean,
    default: true
  },
  isMainFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  originalUrl: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 슬러그 검증 및 중복 방지 pre-save 미들웨어 추가
ESGPostSchema.pre('save', async function(next) {
  // 새 문서이거나 슬러그가 수정된 경우에만 실행
  if (this.isNew || this.isModified('slug')) {
    // 슬러그가 비어있거나 한글이 포함된 경우 title 기반으로 슬러그 생성
    if (!this.slug || /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(this.slug)) {
      // 영문 제목이 있으면 영문 제목 기반, 없으면 한글 제목 기반으로 슬러그 생성
      const baseText = this.title.en || this.title.ko || 'esg';
      this.slug = generateSafeSlug(baseText);
      
      // 슬러그가 짧은 경우 타임스탬프 추가
      if (this.slug.length < 5) {
        this.slug = `${this.slug || 'esg'}-${Date.now()}`;
      }
    }

    // 단순 키워드 슬러그에 타임스탬프 추가 (예: 'esg', 'environment' 등)
    const shortKeywords = ['esg', 'env', 'csr', 'sdg', 'co2'];
    if (shortKeywords.includes(this.slug.toLowerCase())) {
      this.slug = `${this.slug}-${Date.now()}`;
    }

    // 슬러그 중복 확인
    try {
      const ESGPost = mongoose.model('ESGPost');
      const existingPost = await ESGPost.findOne({ slug: this.slug, _id: { $ne: this._id } });
      
      if (existingPost) {
        console.log(`슬러그 중복 발견: ${this.slug}, 새 슬러그 생성 중...`);
        // 타임스탬프로 고유 슬러그 생성
        this.slug = `${this.slug}-${Date.now()}`;
        console.log(`새로운 슬러그 생성됨: ${this.slug}`);
      }
    } catch (error) {
      console.error('슬러그 중복 검사 중 오류:', error);
    }
  }
  next();
});

// updateAt 필드 업데이트 미들웨어
ESGPostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 조회수 증가 메서드
ESGPostSchema.methods.incrementViewCount = function() {
  this.viewCount = (this.viewCount || 0) + 1;
  return this.save();
};

// ESGPost 모델이 이미 있는지 확인하고 없으면 생성
const ESGPost = mongoose.models.ESGPost || mongoose.model('ESGPost', ESGPostSchema);

export default ESGPost; 