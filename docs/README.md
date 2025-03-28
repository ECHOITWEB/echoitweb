# ECHOIT 웹사이트 클론 프로젝트

서버 사이드 렌더링과 MongoDB Atlas 연동을 갖춘 ECHOIT 기업 웹사이트 클론 프로젝트입니다.

## 기술 스택

- **프론트엔드**: Next.js 14, React, TailwindCSS
- **백엔드**: Next.js API Routes, MongoDB Atlas
- **인증**: JWT 기반 인증 시스템
- **실시간 데이터**: Server-Sent Events (SSE)
- **배포 환경**: Netlify

## 구조

- `/src/app` - Next.js 애플리케이션 코드
- `/src/components` - 재사용 가능한 UI 컴포넌트
- `/src/lib` - 유틸리티 및 라이브러리 함수
- `/src/context` - React 컨텍스트 및 상태 관리
- `/src/lib/db` - MongoDB 데이터베이스 연결 및 모델
- `/src/lib/auth` - JWT 인증 관련 코드
- `/scripts` - 테스트 및 유틸리티 스크립트
- `/docs` - 프로젝트 문서

## 시작하기

### 필수 조건

1. Node.js 18 이상 또는 Bun 런타임
2. MongoDB Atlas 계정
3. Git

### 설치 방법

1. 저장소 클론
   ```bash
   git clone https://github.com/yourusername/echoit-clone.git
   cd echoit-clone
   ```

2. 의존성 설치
   ```bash
   bun install
   ```

3. 환경 변수 설정
   - `.env.local.example`을 `.env.local`로 복사
   - `MONGODB_URI` 변수를 MongoDB Atlas 연결 문자열로 업데이트

4. 개발 서버 실행
   ```bash
   bun run dev
   ```

5. 브라우저에서 `http://localhost:3000` 접속

### MongoDB Atlas 연결 설정

이 프로젝트는 MongoDB Atlas를 데이터베이스로 사용합니다. 연결 설정 방법:

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)에서 계정 생성 및 로그인
2. 새 클러스터 생성 (무료 티어 M0 선택)
3. 데이터베이스 사용자 추가 (Database Access 메뉴)
4. IP 화이트리스트 설정 (Network Access 메뉴)
5. 연결 문자열 가져오기 (Connect → Connect your application)
6. `.env.local` 파일에 연결 문자열 설정:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/echoit?retryWrites=true&w=majority
   ```

자세한 설정 방법은 `docs/mongodb-atlas-setup.md` 문서를 참조하세요.

### 테스트 스크립트 실행

MongoDB 연결 테스트:
```bash
node scripts/test-mongodb-atlas.js
```

인증 시스템 테스트:
```bash
node scripts/test-auth.js
```

실시간 데이터 테스트:
```bash
node scripts/test-realtime.js
```

## 주요 기능

1. **다국어 지원**: 한국어/영어 다국어 지원
2. **반응형 디자인**: 모든 화면 크기에 최적화
3. **관리자 패널**: 콘텐츠 관리 기능
4. **JWT 인증**: 보안 강화된 인증 시스템
5. **실시간 대시보드**: SSE 기반 실시간 데이터
6. **MongoDB Atlas 연동**: 확장 가능한 데이터 관리
7. **역할 기반 접근 제어**: Admin, Editor, Viewer 권한 관리

## 프로젝트 구조 설명

```
echoit-clone/
├── docs/                       # 프로젝트 문서
├── public/                    # 정적 파일
├── scripts/                   # 유틸리티 스크립트
├── src/
│   ├── app/                   # Next.js 앱 구성 요소
│   │   ├── api/               # API 엔드포인트
│   │   │   ├── auth/          # 인증 API
│   │   │   ├── dashboard/     # 대시보드 API (실시간)
│   │   │   ├── esg/           # ESG 콘텐츠 API
│   │   │   ├── news/          # 뉴스 콘텐츠 API
│   │   │   └── users/         # 사용자 관리 API
│   │   ├── admin/             # 관리자 페이지
│   │   ├── business/          # 비즈니스 페이지
│   │   ├── company/           # 회사 소개 페이지
│   │   └── notice/            # 공지사항 페이지
│   ├── components/            # 재사용 컴포넌트
│   ├── context/               # React 컨텍스트
│   ├── lib/                   # 유틸리티 함수
│   │   ├── auth/              # 인증 관련 코드
│   │   ├── db/                # 데이터베이스 코드
│   │   │   ├── models/        # Mongoose 모델
│   │   └── hooks/             # 커스텀 React 훅
│   └── types/                 # TypeScript 타입 정의
└── .env.local                 # 환경 변수 (로컬)
```

## 라이센스

이 프로젝트는 MIT 라이센스로 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.
