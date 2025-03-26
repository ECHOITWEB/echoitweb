// MongoDB에 관리자 사용자를 생성하는 스크립트
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 파일 경로 수정
const envLocalPath = path.resolve(process.cwd(), '.env.local');
let MONGODB_URI = 'mongodb://localhost:27017/echo-it'; // 기본값

console.log('환경 파일 경로:', envLocalPath);

try {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const mongoUriMatch = envContent.match(/MONGODB_URI=(.+)/);
  if (mongoUriMatch && mongoUriMatch[1]) {
    MONGODB_URI = mongoUriMatch[1].trim();
    console.log('MongoDB URI를 .env.local 파일에서 로드했습니다.');
  }
} catch (error) {
  console.warn('.env.local 파일을 읽을 수 없습니다. 기본 URI를 사용합니다:', error.message);
}

const saltRounds = 10;

// 관리자 사용자 데이터
const adminUser = {
  username: 'admin',
  email: 'webadmin@echoit.co.kr',
  password: 'echoit1111@', // 실제 사용 시 강력한 비밀번호로 변경 필요
  name: {
    first: '관리자',
    last: ''
  },
  role: 'admin',
  roles: ['admin'], // User 모델에 맞게 추가
  isActive: true,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

async function createAdminUser() {
  let client;

  try {
    // MongoDB에 연결
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('MongoDB에 연결되었습니다.');

    const db = client.db();
    const usersCollection = db.collection('users');

    // 기존 관리자 확인
    const existingAdmin = await usersCollection.findOne({ 
      $or: [
        { username: adminUser.username },
        { email: adminUser.email }
      ]
    });

    if (existingAdmin) {
      console.log('이미 사용 중인 사용자 이름 또는 이메일입니다.');
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds);
    
    // 해시된 비밀번호로 사용자 데이터 업데이트
    const userToInsert = {
      ...adminUser,
      password: hashedPassword
    };

    // 사용자 생성
    const result = await usersCollection.insertOne(userToInsert);
    
    if (result.insertedId) {
      console.log('관리자 사용자가 성공적으로 생성되었습니다:', result.insertedId);
    } else {
      console.log('사용자 생성에 실패했습니다.');
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB 연결이 닫혔습니다.');
    }
  }
}

// 스크립트 실행
createAdminUser(); 