import mongoose from 'mongoose'

const esgSchema = new mongoose.Schema({
  titleKo: { type: String, required: true },
  titleEn: { type: String, required: true },
  authorKo: { type: String, required: true },
  authorEn: { type: String, required: true },
  contentKo: { type: String, required: true },
  contentEn: { type: String, required: true },
  category: { type: String, enum: ['E', 'S', 'G'], required: true },
  date: { type: Date, required: true },
  thumbnailUrl: { type: String },
  originalLink: { type: String },
  isMainFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// 인덱스 추가
esgSchema.index({ category: 1 });
esgSchema.index({ date: -1 });
esgSchema.index({ isMainFeatured: 1 });

// 모델명을 소문자 복수형으로 변경
export default mongoose.models.esgs || mongoose.model('esgs', esgSchema) 