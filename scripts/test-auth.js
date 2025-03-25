// 인증 테스트 스크립트
// lib/db/mongodb 모듈을 직접 사용하는 대신 환경 변수에서 URI를 가져옵니다
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// .env.local 파일에서 환경 변수 로드
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');

      envLines.forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            if (value) {
              process.env[key.trim()] = value;
            }
          }
        }
      });

      console.log('✅ .env.local 파일을 성공적으로 로드했습니다.');
    } else {
      console.error('❌ .env.local 파일을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('❌ .env.local 파일 로드 중 오류:', error.message);
  }
}

// 환경 변수 로드
loadEnv();

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MongoDB 연결 문자열이 .env.local 파일에 설정되지 않았습니다.');
  process.exit(1);
}

// MongoDB 연결 함수
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB에 연결되었습니다.');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    throw error;
  }
}

// 사용자 모델 정의 (mongoose 모델과 일치)
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
      type: String,
      required: true,
      trim: true
    },
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

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    return false;
  }
};

// 사용자 모델 생성
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 기본 관리자 계정 생성 함수
async function createDefaultAdmin() {
  try {
    // 데이터베이스 연결
    await connectToDatabase();

    // 기존 관리자 계정 확인
    const existingAdmin = await User.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('기존 관리자 계정이 존재합니다:', existingAdmin.username);
      return existingAdmin;
    }

    // 관리자 계정 생성
    const adminUser = new User({
      username: 'admin',
      email: 'admin@echoit.co.kr',
      password: 'echoit1111@',
      name: '관리자',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('기본 관리자 계정이 생성되었습니다:', adminUser.username);
    return adminUser;
  } catch (error) {
    console.error('관리자 계정 생성 오류:', error);
    throw error;
  }
}

// 테스트 실행
async function runTests() {
  try {
    console.log('인증 시스템 테스트 시작...');

    // 1. 관리자 계정 생성/확인
    const admin = await createDefaultAdmin();
    console.log('관리자 ID:', admin._id);

    // 2. 비밀번호 검증 테스트
    const correctPassword = 'echoit1111@';
    const wrongPassword = 'wrongpassword';

    const isCorrectPasswordValid = await admin.comparePassword(correctPassword);
    const isWrongPasswordValid = await admin.comparePassword(wrongPassword);

    console.log('올바른 비밀번호 검증:', isCorrectPasswordValid ? '성공' : '실패');
    console.log('잘못된 비밀번호 검증:', isWrongPasswordValid ? '성공' : '실패');

    // 3. 에디터 계정 생성 테스트
    const editorExists = await User.findOne({ username: 'editor' });

    if (!editorExists) {
      const editor = new User({
        username: 'editor',
        email: 'editor@echoit.co.kr',
        password: 'editor1234!',
        name: '콘텐츠 에디터',
        role: 'editor'
      });

      await editor.save();
      console.log('에디터 계정이 생성되었습니다:', editor.username);
    } else {
      console.log('기존 에디터 계정이 존재합니다:', editorExists.username);
    }

    // 4. 모든 사용자 조회
    const allUsers = await User.find({});
    console.log('전체 사용자 수:', allUsers.length);
    console.log('사용자 목록:', allUsers.map(user => ({
      username: user.username,
      role: user.role,
      email: user.email
    })));

    console.log('테스트 완료!');
  } catch (error) {
    console.error('테스트 실행 오류:', error);
  } finally {
    // 연결 종료
    await mongoose.connection.close();
    console.log('데이터베이스 연결 종료');
  }
}

// 테스트 실행
runTests();
