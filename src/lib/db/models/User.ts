import mongoose, { Schema, Document, Model } from 'mongoose';
import { hash, compare } from 'bcrypt';

// 사용자 권한 레벨
export enum UserRole {
  ADMIN = 'admin',       // 최고 관리자
  EDITOR = 'editor',     // 콘텐츠 편집자
  VIEWER = 'viewer'      // 읽기 전용 권한
}

// 사용자 문서 인터페이스
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

// 사용자 스키마 정의
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.VIEWER
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
  // 비밀번호가 변경된 경우에만 해싱
  if (!this.isModified('password')) return next();

  try {
    // 비밀번호 해싱 (bcrypt 사용)
    const saltRounds = 10;
    this.password = await hash(this.password, saltRounds);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  try {
    return await compare(password, this.password);
  } catch (error) {
    return false;
  }
};

// 모델 생성 및 내보내기
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
