# 📰 뉴스 데이터베이스 관리 규칙

## 1. 데이터베이스 구조
- **컬렉션 이름**: `newsposts`
- **데이터베이스 이름**: `echoit`
- **연결 방식**: MongoDB Atlas 클라우드 서비스

## 2. 표준 접근 방식
- **반드시** `news-db-manager.js`를 통해서만 뉴스 데이터베이스에 접근할 것
- **반드시** `newsService`를 통해서만 뉴스 관련 기능을 사용할 것
- 직접 MongoDB 드라이버를 사용하거나 컬렉션에 직접 접근하는 코드 작성 금지

## 3. 데이터 구조 표준
```typescript
interface NewsPost {
  _id: ObjectId;              // MongoDB ID
  title: {                    // 뉴스 제목 (다국어 지원)
    ko: string;               // 한국어 제목
    en?: string;              // 영어 제목 (선택)
  };
  slug: string;               // URL 슬러그 (고유값)
  summary?: {                 // 요약 (선택, 다국어 지원)
    ko?: string;
    en?: string;
  };
  content: {                  // 본문 내용 (다국어 지원)
    ko: string;
    en?: string;
  };
  category: string;           // 카테고리
  author: {                   // 작성자 정보
    name: string;
    department: string;
    id?: string;
  };
  publishDate: Date;          // 발행일
  imageSource?: string;       // 대표 이미지 URL
  tags?: string[];            // 태그 배열
  viewCount: number;          // 조회수
  isPublished: boolean;       // 발행 상태
  createdAt: Date;            // 생성일
  updatedAt: Date;            // 수정일
  createdBy?: string;         // 생성자 ID
}
```

## 4. 뉴스 관리 정책
1. **중앙화된 접근**
   - 모든 뉴스 관련 작업은 `src/lib/services/news.service.js`를 통해 수행
   - 모든 DB 작업은 `news-db-manager.js`를 통해 수행

2. **ID 관리**
   - MongoDB ObjectId를 사용하여 고유 ID 부여
   - 클라이언트에 제공 시 문자열로 변환

3. **슬러그 관리**
   - 뉴스 제목에서 자동 생성
   - 슬러그는 URL 친화적이고 고유해야 함
   - 제목 변경 시 슬러그도 자동 업데이트

4. **언어 관리**
   - 기본 언어는 한국어(`ko`)
   - 다국어 컨텐츠는 동일 문서 내 객체로 관리

5. **발행 관리**
   - `isPublished` 필드로 발행 상태 관리
   - 발행되지 않은 뉴스는 관리자만 확인 가능

## 5. API 엔드포인트 정책
- **GET /api/posts/news**: 모든 뉴스 조회 (관리자용)
- **GET /api/posts/news/published**: 발행된 뉴스만 조회 (공개용)
- **GET /api/posts/news/[id]**: 특정 ID의 뉴스 조회
- **POST /api/posts/news**: 새 뉴스 생성
- **PUT /api/posts/news/[id]**: 뉴스 업데이트
- **DELETE /api/posts/news/[id]**: 뉴스 삭제

## 6. 특수 뉴스 관리
- 테스트용 뉴스(adsfasdf, ㅁㅇㄴㄹㅇㄴㅁㄹㅇㄹ, 랄랄라) 포함 모든 뉴스는 동일한 컬렉션에서 관리
- 테스트용 뉴스의 경우 해당 제목으로 검색하여 관리
- 관리 페이지에서 이러한 뉴스는 테스트용으로 표시

## 7. 백업 정책
- 매일 자동 백업 수행
- 중요 데이터 변경 전 수동 백업 권장
- 백업 파일은 JSON 형식으로 저장

## 8. 보안 정책
- 뉴스 생성/수정/삭제는 에디터 이상 권한 필요
- 모든 API 요청은 인증 미들웨어로 검증
- 사용자 입력은 서버 측에서 검증 후 저장 