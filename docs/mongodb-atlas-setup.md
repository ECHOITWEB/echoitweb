# MongoDB Atlas 설정 가이드

이 가이드는 ECHOIT 클론 프로젝트를 위한 MongoDB Atlas 설정 과정을 안내합니다.

## 1. MongoDB Atlas 계정 생성

1. [MongoDB Atlas 회원가입 페이지](https://www.mongodb.com/cloud/atlas/register)에 접속합니다.
2. 이메일, 비밀번호 등 필요한 정보를 입력하여 계정을 생성합니다.
3. 가입 후 Welcome 페이지에서 "Build a Database" 버튼을 클릭합니다.

## 2. 클러스터 생성

1. 무료 "Shared" 클러스터를 선택합니다 (Free tier).
2. 클라우드 제공업체(AWS, Google Cloud, Azure)를 선택합니다.
3. 리전은 지리적으로 가까운 곳을 선택합니다 (예: 서울, 도쿄 등).
4. 클러스터 이름은 기본값(Cluster0)을 사용하거나 원하는 이름으로 변경합니다.
5. "Create Cluster" 버튼을 클릭하여 클러스터 생성을 완료합니다.

## 3. 데이터베이스 사용자 생성

1. 왼쪽 메뉴에서 "Database Access"를 선택합니다.
2. "Add New Database User" 버튼을 클릭합니다.
3. 인증 방식은 "Password"를 선택합니다.
4. 사용자 이름과 비밀번호를 입력합니다.
   - 사용자 이름 예: `echoit-admin`
   - 비밀번호는 복잡하게 설정하고 안전하게 보관하세요.
5. 데이터베이스 사용자 권한으로 "Read and Write to Any Database"를 선택합니다.
6. "Add User" 버튼을 클릭하여 사용자를 생성합니다.

## 4. IP 액세스 리스트 설정

1. 왼쪽 메뉴에서 "Network Access"를 선택합니다.
2. "Add IP Address" 버튼을 클릭합니다.
3. 개발 환경에서는 "Allow Access from Anywhere"를 선택합니다.
   - 이는 `0.0.0.0/0` IP 범위를 추가합니다.
   - 프로덕션 환경에서는 보안을 위해 특정 IP만 허용하는 것이 좋습니다.
4. "Confirm" 버튼을 클릭합니다.

## 5. 연결 문자열 가져오기

1. 왼쪽 메뉴에서 "Database"를 선택합니다.
2. 클러스터 화면에서 "Connect" 버튼을 클릭합니다.
3. "Connect your application"을 선택합니다.
4. Driver로 "Node.js"를 선택하고, 버전은 최신 버전을 선택합니다.
5. 연결 문자열을 복사합니다. 다음과 유사한 형태입니다:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. `<username>`과 `<password>`를 3단계에서 생성한 사용자 정보로 교체합니다.
7. 데이터베이스 이름을 추가합니다. 연결 문자열에 `mongodb.net/?` 부분을 `mongodb.net/echoit?`로 변경합니다.

## 6. 프로젝트에 연결 문자열 적용하기

1. 프로젝트 루트 디렉토리의 `.env.local` 파일을 엽니다.
2. `MONGODB_URI` 변수의 값을 5단계에서 얻은 연결 문자열로 설정합니다:
   ```
   MONGODB_URI=mongodb+srv://echoit-admin:your-password@cluster0.xxxxx.mongodb.net/echoit?retryWrites=true&w=majority
   ```

## 7. 연결 테스트하기

1. 터미널을 열고 프로젝트 루트 디렉토리로 이동합니다.
2. 다음 명령을 실행하여 MongoDB Atlas 연결을 테스트합니다:
   ```
   node scripts/test-mongodb-atlas.js
   ```
3. 성공적으로 연결되면 다음과 같은 메시지가 표시됩니다:
   ```
   ✅ MongoDB Atlas에 성공적으로 연결되었습니다!
   ```

## 8. 주의사항

- `.env.local` 파일은 민감한 정보가 포함되어 있으므로 GitHub 등 공개 저장소에 업로드하지 마세요.
- 비밀번호는 안전하게 관리하세요.
- 프로덕션 환경에서는 적절한 네트워크 액세스 제한을 설정하세요.
- MongoDB Atlas의 무료 티어는 제한된 스토리지와 성능을 제공합니다. 실제 프로덕션 환경에서는 요구 사항에 맞는 유료 플랜을 고려하세요.

## 9. 문제 해결

- **인증 오류(Authentication failed)**: 사용자 이름과 비밀번호를 확인하세요.
- **연결 시간 초과(Connection timed out)**: IP 액세스 목록에 현재 IP가 허용되어 있는지 확인하세요.
- **호스트를 찾을 수 없음(Host not found)**: 연결 문자열의 형식이 올바른지 확인하세요.

## 10. 추가 리소스

- [MongoDB Atlas 공식 문서](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js 드라이버 문서](https://docs.mongodb.com/drivers/node/)
