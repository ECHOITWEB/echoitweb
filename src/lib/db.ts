import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI가 설정되지 않았습니다.');
}

// 캐시 타입 정의
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 전역 타입 확장
declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('MongoDB 연결 초기화 중...', MONGODB_URI);
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 서버 선택 타임아웃: 10초
      socketTimeoutMS: 45000, // 소켓 타임아웃: 45초
      family: 4, // IPv4 사용
      maxPoolSize: 10, // 최대 연결 풀 크기
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('MongoDB 연결 성공!');
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB 연결 실패:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB 기존 연결 재사용');
    return cached.conn;
  } catch (e) {
    console.error('MongoDB 연결 오류 발생:', e);
    cached.promise = null;
    throw e;
  }
} 