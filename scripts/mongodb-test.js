/**
 * MongoDB 연결 및 모델 테스트 스크립트
 * 사용법: node mongodb-test.js 또는 bun mongodb-test.js
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// 로깅 유틸리티
const log = {
  info: (msg) => console.log(`\x1b[36mINFO\x1b[0m: ${msg}`),
  success: (msg) => console.log(`\x1b[32mSUCCESS\x1b[0m: ${msg}`),
  error: (msg) => console.log(`\x1b[31mERROR\x1b[0m: ${msg}`),
  warning: (msg) => console.log(`\x1b[33mWARNING\x1b[0m: ${msg}`),
  header: (msg) => console.log(`\n\x1b[1m\x1b[37m${msg}\x1b[0m\n` + '-'.repeat(msg.length))
};

// 환경 변수에서 MongoDB URI 가져오기 또는 기본값 사용
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/echoit-test';

// 사용자 스키마 정의
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
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
    required: true
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
}, {
  timestamps: true
});

// 여러 언어 지원 스키마 정의
const multiLingualSchema = new Schema({
  ko: { type: String, required: true },
  en: { type: String, required: true }
}, { _id: false });

// 뉴스 게시물 스키마 정의
const newsPostSchema = new Schema({
  title: {
    type: multiLingualSchema,
    required: true
  },
  subtitle: {
    type: multiLingualSchema,
    required: true
  },
  content: {
    type: multiLingualSchema,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// ESG 게시물 스키마 정의
const esgPostSchema = new Schema({
  title: {
    type: multiLingualSchema,
    required: true
  },
  subtitle: {
    type: multiLingualSchema,
    required: true
  },
  content: {
    type: multiLingualSchema,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  esgType: {
    type: String,
    enum: ['environment', 'social', 'governance'],
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// 모델 정의
const User = mongoose.models.User || mongoose.model('User', userSchema);
const NewsPost = mongoose.models.NewsPost || mongoose.model('NewsPost', newsPostSchema);
const ESGPost = mongoose.models.ESGPost || mongoose.model('ESGPost', esgPostSchema);

/**
 * MongoDB 연결 테스트
 */
async function testMongoDBConnection() {
  log.header('MongoDB 연결 테스트');

  try {
    log.info(`MongoDB URI: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    log.success('MongoDB 연결 성공!');

    // 데이터베이스 정보
    const dbStats = await mongoose.connection.db.stats();
    log.info(`데이터베이스 이름: ${mongoose.connection.db.databaseName}`);
    log.info(`컬렉션 수: ${dbStats.collections}`);
    log.info(`문서 수: ${dbStats.objects}`);

    return true;
  } catch (error) {
    log.error(`MongoDB 연결 실패: ${error.message}`);
    return false;
  }
}

/**
 * 모델 CRUD 테스트
 */
async function testModelOperations() {
  log.header('모델 CRUD 테스트');

  try {
    // 1. 사용자 생성
    log.info('테스트 사용자 생성 중...');
    const testUsername = `test_user_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;

    const user = new User({
      username: testUsername,
      email: testEmail,
      password: 'password123',
      name: '테스트 사용자',
      role: 'editor'
    });

    await user.save();
    log.success(`사용자 생성 성공! ID: ${user._id}`);

    // 2. 뉴스 게시물 생성
    log.info('테스트 뉴스 게시물 생성 중...');
    const newsPost = new NewsPost({
      title: {
        ko: '테스트 뉴스 제목',
        en: 'Test News Title'
      },
      subtitle: {
        ko: '테스트 뉴스 부제목',
        en: 'Test News Subtitle'
      },
      content: {
        ko: '테스트 뉴스 내용',
        en: 'Test News Content'
      },
      slug: `test-news-${Date.now()}`,
      author: user._id,
      category: 'test',
      tags: ['test', 'news']
    });

    await newsPost.save();
    log.success(`뉴스 게시물 생성 성공! ID: ${newsPost._id}`);

    // 3. ESG 게시물 생성
    log.info('테스트 ESG 게시물 생성 중...');
    const esgPost = new ESGPost({
      title: {
        ko: '테스트 ESG 제목',
        en: 'Test ESG Title'
      },
      subtitle: {
        ko: '테스트 ESG 부제목',
        en: 'Test ESG Subtitle'
      },
      content: {
        ko: '테스트 ESG 내용',
        en: 'Test ESG Content'
      },
      slug: `test-esg-${Date.now()}`,
      author: user._id,
      category: 'test',
      esgType: 'environment',
      tags: ['test', 'esg', 'environment']
    });

    await esgPost.save();
    log.success(`ESG 게시물 생성 성공! ID: ${esgPost._id}`);

    // 4. 데이터 조회
    log.info('데이터 조회 테스트 중...');

    const foundUser = await User.findById(user._id);
    log.success(`사용자 조회 성공: ${foundUser.username}`);

    const foundNewsPost = await NewsPost.findById(newsPost._id);
    log.success(`뉴스 게시물 조회 성공: ${foundNewsPost.title.ko}`);

    const foundESGPost = await ESGPost.findById(esgPost._id);
    log.success(`ESG 게시물 조회 성공: ${foundESGPost.title.ko}`);

    // 5. 데이터 업데이트
    log.info('데이터 업데이트 테스트 중...');

    foundNewsPost.viewCount = 100;
    await foundNewsPost.save();
    log.success(`뉴스 게시물 업데이트 성공: 조회수 ${foundNewsPost.viewCount}`);

    foundESGPost.isPublished = true;
    foundESGPost.publishedAt = new Date();
    await foundESGPost.save();
    log.success(`ESG 게시물 업데이트 성공: 게시 상태 ${foundESGPost.isPublished}`);

    // 6. 연관 데이터 조회
    log.info('연관 데이터 조회 테스트 중...');

    const newsWithAuthor = await NewsPost.findById(newsPost._id).populate('author');
    log.success(`뉴스 게시물 작성자 조회 성공: ${newsWithAuthor.author.name}`);

    // 7. 집계 쿼리
    log.info('집계 쿼리 테스트 중...');

    const newsCategoryStats = await NewsPost.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    log.success(`뉴스 카테고리 통계 조회 성공: ${JSON.stringify(newsCategoryStats)}`);

    const esgTypeStats = await ESGPost.aggregate([
      { $group: { _id: '$esgType', count: { $sum: 1 } } }
    ]);
    log.success(`ESG 유형 통계 조회 성공: ${JSON.stringify(esgTypeStats)}`);

    // 8. 데이터 삭제 (테스트 후 정리)
    log.info('테스트 데이터 정리 중...');

    await NewsPost.findByIdAndDelete(newsPost._id);
    await ESGPost.findByIdAndDelete(esgPost._id);
    await User.findByIdAndDelete(user._id);

    log.success('테스트 데이터 정리 완료');

    return true;
  } catch (error) {
    log.error(`모델 테스트 실패: ${error.message}`);
    return false;
  }
}

/**
 * 데이터베이스 쿼리 성능 테스트
 */
async function testQueryPerformance() {
  log.header('MongoDB 쿼리 성능 테스트');

  try {
    // 간단한 쿼리 성능 테스트
    log.info('단일 문서 조회 성능 테스트...');

    const start1 = Date.now();
    const users = await User.find().limit(1);
    const time1 = Date.now() - start1;

    log.success(`단일 문서 조회 소요 시간: ${time1}ms`);

    // 인덱스 사용 쿼리 테스트
    log.info('인덱스 사용 조회 성능 테스트...');

    const start2 = Date.now();
    const posts = await NewsPost.find({ slug: { $exists: true } }).limit(10);
    const time2 = Date.now() - start2;

    log.success(`인덱스 사용 조회 소요 시간: ${time2}ms`);

    // 집계 파이프라인 성능 테스트
    log.info('집계 파이프라인 성능 테스트...');

    const start3 = Date.now();
    const stats = await NewsPost.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$viewCount' } } },
      { $sort: { count: -1 } }
    ]);
    const time3 = Date.now() - start3;

    log.success(`집계 파이프라인 소요 시간: ${time3}ms`);

    return true;
  } catch (error) {
    log.error(`쿼리 성능 테스트 실패: ${error.message}`);
    return false;
  }
}

/**
 * 메인 테스트 함수
 */
async function runTests() {
  try {
    console.log("\n" + "=".repeat(50));
    console.log("        MongoDB & Mongoose ORM 테스트 스크립트");
    console.log("=".repeat(50) + "\n");

    // 1. 연결 테스트
    const connectionSuccess = await testMongoDBConnection();
    if (!connectionSuccess) {
      throw new Error('MongoDB 연결에 실패하여 테스트를 중단합니다.');
    }

    // 2. 모델 CRUD 테스트
    await testModelOperations();

    // 3. 쿼리 성능 테스트
    await testQueryPerformance();

    console.log("\n" + "=".repeat(50));
    console.log("             테스트 완료");
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    log.error(`테스트 실패: ${error.message}`);
  } finally {
    // 연결 종료
    await mongoose.connection.close();
    log.info('MongoDB 연결 종료');
  }
}

// 테스트 실행
runTests();
