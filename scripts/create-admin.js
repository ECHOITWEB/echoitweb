// 관리자 계정 생성 스크립트
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB 연결 정보
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/echoit-dev';

// 관리자 계정 정보
const adminUser = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123456',
  name: {
    first: '관리자',
    last: ''
  },
  role: 'admin',
  roles: ['admin'],
  isActive: true
};

// 사용자 스키마 정의
const userSchema = new mongoose.Schema(
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
      first: {
        type: String,
        required: true
      },
      last: {
        type: String,
        required: false,
        default: ''
      }
    },
    roles: [{
      type: String,
      enum: ['admin', 'editor', 'viewer']
    }],
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer'
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
    timestamps: true,
  }
);

// MongoDB 연결 및 관리자 생성
async function createAdmin() {
  try {
    console.log('MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // User 모델 생성
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // 이미 존재하는 관리자 확인
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('이미 관리자 계정이 존재합니다:', adminUser.email);
      await mongoose.disconnect();
      return;
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    // 관리자 계정 생성
    const newAdmin = new User({
      ...adminUser,
      password: hashedPassword
    });

    await newAdmin.save();
    console.log('관리자 계정이 성공적으로 생성되었습니다');
    console.log('이메일:', adminUser.email);
    console.log('비밀번호:', adminUser.password);

    await mongoose.disconnect();
  } catch (error) {
    console.error('관리자 계정 생성 중 오류 발생:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin(); 