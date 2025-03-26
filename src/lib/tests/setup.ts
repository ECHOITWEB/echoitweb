import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') });

// 테스트 환경을 위한 MongoDB 연결 URI 설정
const MONGODB_URI = process.env.MONGODB_URI || '';
process.env.MONGODB_URI = MONGODB_URI.replace('/echoit?', '/echoit_test?');

// MongoDB 연결 URI 확인
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
}

// Jest 타임아웃 설정
jest.setTimeout(30000); 