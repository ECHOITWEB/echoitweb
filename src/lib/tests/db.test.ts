import { connectToDatabase } from '../db/mongodb';
import { User, UserRole, NewsPost, ESGPost } from '../db/models';
import mongoose from 'mongoose';

// 전역 설정
jest.setTimeout(30000); // 타임아웃 증가

// 테스트 전에 데이터베이스 연결
beforeAll(async () => {
  try {
    await connectToDatabase();
    console.log('테스트 데이터베이스에 연결되었습니다.');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    throw error;
  }
});

// 모든 테스트 후 연결 종료
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('데이터베이스 연결이 종료되었습니다.');
  } catch (error) {
    console.error('데이터베이스 연결 종료 실패:', error);
  }
});

describe('Database Connection Tests', () => {
  it('should connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});

describe('User Model Tests', () => {
  let testUser: any;

  beforeAll(async () => {
    await User.deleteMany({ email: 'test@example.com' });
  });

  it('should create a new user', async () => {
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      name: '테스트 사용자',
      role: UserRole.ADMIN
    });

    expect(testUser.email).toBe('test@example.com');
    expect(testUser.role).toBe(UserRole.ADMIN);
  });

  it('should compare password correctly', async () => {
    const isMatch = await testUser.comparePassword('testpassword123');
    expect(isMatch).toBe(true);
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test@example.com' });
  });
});

describe('News Post Model Tests', () => {
  let testUser: any;
  let testPost: any;

  beforeAll(async () => {
    testUser = await User.create({
      username: 'newsauthor',
      email: 'news@example.com',
      password: 'password123',
      name: '뉴스 작성자',
      role: UserRole.EDITOR
    });
  });

  it('should create a news post', async () => {
    testPost = await NewsPost.create({
      title: {
        ko: '테스트 뉴스 제목',
        en: 'Test News Title'
      },
      subtitle: {
        ko: '테스트 부제목',
        en: 'Test Subtitle'
      },
      content: {
        ko: '테스트 내용입니다.',
        en: 'This is test content.'
      },
      slug: 'test-news',
      author: testUser._id,
      category: 'company',
      isPublished: true
    });

    expect(testPost.title.ko).toBe('테스트 뉴스 제목');
    expect(testPost.isPublished).toBe(true);
    expect(testPost.publishedAt).toBeTruthy();
  });

  afterAll(async () => {
    await NewsPost.deleteMany({ slug: 'test-news' });
    await User.deleteMany({ email: 'news@example.com' });
  });
});

describe('ESG Post Model Tests', () => {
  let testUser: any;
  let testPost: any;

  beforeAll(async () => {
    testUser = await User.create({
      username: 'esgauthor',
      email: 'esg@example.com',
      password: 'password123',
      name: 'ESG 작성자',
      role: UserRole.EDITOR
    });
  });

  it('should create an ESG post', async () => {
    testPost = await ESGPost.create({
      title: {
        ko: 'ESG 테스트 제목',
        en: 'ESG Test Title'
      },
      subtitle: {
        ko: 'ESG 부제목',
        en: 'ESG Subtitle'
      },
      content: {
        ko: 'ESG 테스트 내용입니다.',
        en: 'This is ESG test content.'
      },
      slug: 'test-esg',
      author: testUser._id,
      category: 'environment',
      esgType: 'environment',
      isPublished: true
    });

    expect(testPost.title.ko).toBe('ESG 테스트 제목');
    expect(testPost.esgType).toBe('environment');
    expect(testPost.isPublished).toBe(true);
  });

  afterAll(async () => {
    await ESGPost.deleteMany({ slug: 'test-esg' });
    await User.deleteMany({ email: 'esg@example.com' });
  });
}); 