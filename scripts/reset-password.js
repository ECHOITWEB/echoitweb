// 비밀번호 재설정 스크립트
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

// 비밀번호 재설정 함수
async function resetPassword(email, newPassword) {
  try {
    console.log(`[비밀번호 재설정] 이메일: ${email}, 새 비밀번호: ${newPassword}`);
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
    
    // 비밀번호 해싱
    console.log('비밀번호 해싱 중...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // 비밀번호 업데이트
    user.password = hashedPassword;
    await user.save();
    
    console.log(`[성공] ${user.username} 사용자의 비밀번호가 재설정되었습니다.`);
    return true;
  } catch (error) {
    console.error('비밀번호 재설정 중 오류 발생:', error);
    return false;
  } finally {
    await mongoose.disconnect();
  }
}

// 사용자가 입력한 이메일과 새 비밀번호로 재설정
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('사용법: node reset-password.js <이메일> <새 비밀번호>');
  process.exit(1);
}

// 비밀번호 재설정 실행
resetPassword(email, newPassword).then(success => {
  if (success) {
    console.log('===== 비밀번호 재설정 성공 =====');
  } else {
    console.log('===== 비밀번호 재설정 실패 =====');
  }
}); 