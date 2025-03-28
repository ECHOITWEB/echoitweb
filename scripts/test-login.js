// 로그인 테스트 스크립트
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// 로그인 테스트 함수
async function testLogin(email, password) {
  try {
    console.log(`[로그인 테스트] 이메일: ${email}, 비밀번호: ${password}`);
    console.log('MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // User 모델 생성
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // 사용자 찾기
    console.log(`사용자 검색 중: ${email}`);
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`[실패] 사용자를 찾을 수 없음: ${email}`);
      return false;
    }
    
    console.log(`사용자 찾음: ${user.username} (${user.email})`);
    
    // 비밀번호 확인
    console.log('비밀번호 확인 중...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('[실패] 비밀번호가 일치하지 않음');
      return false;
    }
    
    console.log(`[성공] ${user.username} 사용자 로그인 성공`);
    
    // 마지막 로그인 업데이트
    user.lastLogin = new Date();
    await user.save();
    console.log('마지막 로그인 시간 업데이트됨');
    
    return true;
  } catch (error) {
    console.error('로그인 테스트 중 오류 발생:', error);
    return false;
  } finally {
    await mongoose.disconnect();
  }
}

// 사용자가 입력한 이메일과 비밀번호로 테스트
const testEmail = process.argv[2] || 'admin@echoit.co.kr';
const testPassword = process.argv[3] || 'admin123456';

// 로그인 테스트 실행
testLogin(testEmail, testPassword).then(success => {
  if (success) {
    console.log('===== 로그인 테스트 성공 =====');
  } else {
    console.log('===== 로그인 테스트 실패 =====');
  }
}); 