import mongoose from 'mongoose';
import { ConnectOptions } from 'mongoose';

// 주 MongoDB URI와 보조 URI 설정
const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_URI_SUB = process.env.MONGODB_URI_SUB as string;

// 연결 URI 검증
if (!MONGODB_URI && !MONGODB_URI_SUB) {
  throw new Error('MongoDB 연결 문자열이 설정되지 않았습니다. MONGODB_URI 또는 MONGODB_URI_SUB를 설정하세요.');
}

// MongoDB 연결 옵션
const connectionOptions: ConnectOptions = {
  serverSelectionTimeoutMS: 30000, // 서버 선택 타임아웃 (30초)
  socketTimeoutMS: 45000,          // 소켓 타임아웃 (45초)
  maxPoolSize: 10,                 // 최대 연결 풀 크기
  connectTimeoutMS: 30000,         // 연결 타임아웃 (30초)
  retryWrites: true,               // 쓰기 재시도
  retryReads: true,                // 읽기 재시도
  family: 4                        // IPv4 사용
};

/**
 * MongoDB 데이터베이스 연결 함수
 * 주 URI 연결 실패 시 보조 URI 사용
 */
export async function connectToDatabase() {
  // 이미 연결된 경우 바로 반환
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB 기존 연결 사용 중');
    return;
  }

  let connectionError = null;

  // 첫 번째 URI로 연결 시도
  if (MONGODB_URI) {
    try {
      console.log('주 MongoDB URI로 연결 시도 중...');
      await mongoose.connect(MONGODB_URI, connectionOptions);
      console.log('주 MongoDB URI로 연결 성공!');
      
      // 연결 이벤트 리스너 추가
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB 연결 오류 발생:', err);
      });
      
      return;
    } catch (error: any) {
      connectionError = error;
      console.error('주 MongoDB URI 연결 실패:', error.message || '알 수 없는 오류');
      console.log('보조 URI로 시도합니다...');
    }
  }

  // 첫 번째 연결 실패 시 보조 URI로 시도
  if (MONGODB_URI_SUB) {
    try {
      console.log('보조 MongoDB URI로 연결 시도 중...');
      await mongoose.connect(MONGODB_URI_SUB, connectionOptions);
      console.log('보조 MongoDB URI로 연결 성공!');
      
      // 연결 이벤트 리스너 추가
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB 연결 오류 발생:', err);
      });
      
      return;
    } catch (error: any) {
      console.error('보조 MongoDB URI 연결도 실패:', error.message || '알 수 없는 오류');
      
      // 두 연결 모두 실패한 경우 최초 오류 또는 현재 오류 반환
      throw new Error(`MongoDB 연결 실패: ${error.message || '알 수 없는 오류'}`);
    }
  } else if (connectionError) {
    // 보조 URI가 없고 주 URI 연결이 실패한 경우
    throw new Error(`MongoDB 연결 실패: ${connectionError.message || '알 수 없는 오류'}`);
  }
} 