// 사용자 정보 확인 스크립트
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결 정보
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_SUB || 'mongodb://localhost:27017/echoit-dev';

// 사용자 스키마 정의
const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    name: {
      first: String,
      last: String
    },
    roles: [String],
    role: String,
    isActive: Boolean,
    lastLogin: Date
  },
  {
    timestamps: true,
  }
);

// MongoDB 연결 및 사용자 확인
async function checkUsers() {
  try {
    console.log('MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // User 모델 생성
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // 모든 사용자 찾기
    const users = await User.find({}).select('-password');
    
    console.log('===== 등록된 사용자 목록 =====');
    if (users.length === 0) {
      console.log('등록된 사용자가 없습니다.');
    } else {
      users.forEach(user => {
        console.log(`--------------------------`);
        console.log(`이름: ${user.name.first} ${user.name.last}`);
        console.log(`사용자명: ${user.username}`);
        console.log(`이메일: ${user.email}`);
        console.log(`역할: ${user.role}`);
        console.log(`활성 상태: ${user.isActive ? '활성' : '비활성'}`);
        console.log(`마지막 로그인: ${user.lastLogin || '없음'}`);
        console.log(`생성 일자: ${user.createdAt}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('사용자 조회 중 오류 발생:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkUsers(); 