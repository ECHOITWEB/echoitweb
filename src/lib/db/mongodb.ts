import mongoose from 'mongoose';

// MongoDB 연결 URI (실제 프로덕션에서는 환경 변수로 관리)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/echoit';

// 글로벌 변수로 연결 인스턴스 캐싱 (개발 모드에서 핫 리로딩시 재사용)
declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * MongoDB에 연결하는 함수
 * @returns Mongoose 연결 인스턴스
 */
export async function connectToDatabase() {
  // 이미 연결된 경우 재사용
  if (cached.conn) {
    return cached.conn;
  }

  // URI가 없는 경우 오류 발생
  if (!MONGODB_URI) {
    throw new Error('MongoDB 연결 문자열이 설정되지 않았습니다. .env.local 또는 환경 변수에 MONGODB_URI를 설정하세요.');
  }

  // 연결이 진행 중이면 기존 Promise 재사용
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // 연결 풀 크기 설정
      serverSelectionTimeoutMS: 10000, // 서버 선택 타임아웃 설정
      socketTimeoutMS: 45000, // 소켓 타임아웃 설정
      family: 4 // IPv4 사용 (필요한 경우)
    };

    // 연결 시도
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB 연결 성공');
        return mongoose.connection;
      })
      .catch(err => {
        console.error('MongoDB 연결 실패:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// 연결 상태 모니터링
mongoose.connection.on('connected', () => {
  console.log('MongoDB에 연결되었습니다.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 연결이 끊어졌습니다.');
});

// 애플리케이션 종료 시 연결 종료
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
