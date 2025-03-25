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

export default mongoose.models.ESG || mongoose.model('ESG', esgSchema) 