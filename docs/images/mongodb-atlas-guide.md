# MongoDB Atlas 시각적 가이드

이 문서는 Echo IT 프로젝트를 위한 MongoDB Atlas 설정의 주요 단계에 대한 시각적 가이드를 제공합니다.

## 1. MongoDB Atlas 대시보드

MongoDB Atlas에 로그인하면 다음과 같은 대시보드를 볼 수 있습니다. "Build a Database" 버튼을 클릭하여 새 클러스터를 생성합니다.

![MongoDB Atlas 대시보드](https://webimages.mongodb.com/_com_assets/cms/l8sx7eoqk4klqwad9-First%20Cluster.png?auto=format%252Ccompress)

## 2. 클러스터 생성

무료 티어(M0 Sandbox)를 선택하고 원하는 클라우드 제공업체와 리전을 선택합니다.

## 3. 클러스터 연결 설정

클러스터가 생성되면 "Connect" 버튼을 클릭하여 연결 설정을 진행합니다.

![클러스터 연결](https://coding-boot-camp.github.io/full-stack/static/032c22ace0ae8a466b5b0d7bbb21bd35/c1b63/100-cluster-dashboard.png)

## 4. 데이터베이스 접근 관리

"Database Access"에서 새 사용자를 생성하고, "Network Access"에서 IP 허용 목록을 설정합니다.

## 5. 연결 문자열 획득

"Connect your application"을 선택하고 Node.js 드라이버를 선택한 후 연결 문자열을 복사합니다.

## 6. 앱에 연결 문자열 적용

복사한 연결 문자열에서 `<username>`, `<password>` 부분을 실제 값으로 대체하고 `.env.local` 파일에 설정합니다.

## 7. 앱 실행 및 테스트

마지막으로 앱을 실행하여 MongoDB Atlas와의 연결을 테스트합니다.

## 8. 클러스터 모니터링

MongoDB Atlas 대시보드에서 클러스터 성능과 상태를 모니터링할 수 있습니다.

![클러스터 모니터링](https://imgix.datadoghq.com/img/blog/monitor-atlas-performance-metrics-with-datadog/MongoDB_Atlas_Dashboard-rev2.png?auto=format&w=847&dpr=2)

---

자세한 설정 방법은 `docs/mongodb-atlas-setup.md` 문서를 참조하세요.
