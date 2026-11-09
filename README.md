# 파일 관리 서비스

파일을 업로드하고 외부 공유 링크를 만들고 버전 관리를 할 수 있는 기능을 제공합니다.

이 저장소는 [`file-management-service`](https://github.com/wisdomstar94/file-management-service) 의 서버를 **Java(Spring Boot · JPA · Flyway)** 로 다시 구현한 버전입니다. api 규격 · DB 스키마 · 웹 화면은 원본과 같고, 원본의 api e2e 테스트를 그대로 가져와 Java api 가 원본과 똑같이 동작하는지 검사합니다.

## 빠른 실행

Docker (Compose v2) 와 Node.js 가 설치돼 있다고 가정합니다. JDK 는 없어도 됩니다(api 이미지 안에서 빌드합니다).

```bash
cp .env.local-sample .env.local      # Windows: copy .env.local-sample .env.local
corepack enable                      # package.json 의 packageManager 버전(yarn 4)을 씁니다
yarn install
yarn docker:up:all:local
```

| 화면 | 주소 | 비고 |
| --- | --- | --- |
| 관리자 웹 | http://localhost:3000 | 아이디 `admin` · 비밀번호 `admin1234!` |
| 공개 링크 웹 | `http://localhost:3001/s/<shareLinkKey>` | 관리자 웹에서 만든 외부 공개 링크로 열립니다 |
| API 상태 확인 | http://localhost:4000/api/health | `{"data":{"status":"ok"}}` |

종료는 `yarn docker:down:all:local` 입니다. 업로드 파일 · DB 데이터까지 지우려면 `yarn docker:down:all:local -v` 로 실행합니다.

- Node.js 25 부터는 corepack 이 함께 설치되지 않습니다. `corepack enable` 이 없다고 나오면 `npm install -g corepack` 을 먼저 실행하세요.
- 로컬 개발용 postgres(`dockers/compose.postgres.yml`)와 같은 compose 프로젝트(`fms-java`)라 컨테이너 · 볼륨을 함께 씁니다. 원본 저장소(`fms`)와는 볼륨이 나뉘지만 포트가 같아 동시에 띄울 수는 없습니다.
- Node · yarn 없이 Docker 만으로 띄우는 방법, 로컬 개발, 서비스별 도커 · node 실행, env 설정, 운영 시 주의 사항은 [`docs/run-and-operation-guide.md`](docs/run-and-operation-guide.md) 에 있습니다.

---

## 워크스페이스

빌드 도구가 언어에 따라 나뉩니다.

- **yarn workspaces** (`package.json`): `webs/*` · `libs/web-shared/*` · `libs/internal/*` · `e2e/*`
- **Gradle** (`settings.gradle.kts`): `servers/*` · `libs/server-shared/*`

`libs/contracts` 는 두 빌드가 함께 읽는 JSON 입니다.

### 앱

| 경로 | 이름 | 역할 | 언어 · 주요 기술 |
| --- | --- | --- | --- |
| `servers/api` | `:servers:api` | 관리자 · 공개 링크 api. `/api/admin/**` 는 관리자, `/api/public/**` 는 외부 공개 링크 | Java 25 · Spring Boot 4.1 · Spring Data JPA · PostgreSQL |
| `servers/database-manager` | `:servers:database-manager` | DB 마이그레이션 · 시드 CLI (`migrate` · `info` · `validate` · `seed` · `setup`) | Java 25 · Spring Boot (비웹) · Flyway |
| `webs/file-management-service-admin` | `@fms/admin-web` | 관리자 웹. 자료 · 버전 · 공개 링크 · 계정 · 권한 그룹 · 접근 정책 관리 | TypeScript · Next.js 16 · React 19 · Tailwind CSS 4 |
| `webs/file-management-service-user` | `@fms/user-web` | 외부 공개 링크 웹 (`/s/<shareLinkKey>`). 잠금 해제 · 다운로드 | TypeScript · Next.js 16 · React 19 · Tailwind CSS 4 |

### 공용 라이브러리

| 경로 | 이름 | 역할 | 언어 · 빌드 |
| --- | --- | --- | --- |
| `libs/contracts/shared-consts` | (빌드 없음) | 서버 · 웹이 함께 쓰는 상수의 단일 원본. 권한 코드 · 에러 코드 · 쿠키 이름 · 정책 최대 깊이 · JWT audience | JSON |
| `libs/server-shared/server-consts` | `:libs:server-shared:server-consts` | `shared-consts` JSON 에서 Java 상수(`PermissionCode` 등)를 빌드 시 생성 | Java · Gradle |
| `libs/server-shared/server-types` | `:libs:server-shared:server-types` | 서버 공용 타입 (접근 정책 트리 노드 · 거부 상세) | Java · Gradle |
| `libs/server-shared/server-utils` | `:libs:server-shared:server-utils` | 접근 정책 평가 · IP/CIDR 판정 | Java · Gradle |
| `libs/server-shared/database-entities` | `:libs:server-shared:database-entities` | JPA 엔티티 · Repository (api · database-manager 공용) | Java · Gradle |
| `libs/server-shared/jwt-handler` | `:libs:server-shared:jwt-handler` | HS256 JWT 서명 · 검증 | Java · Gradle |
| `libs/server-shared/password-handler` | `:libs:server-shared:password-handler` | argon2id 비밀번호 해시 | Java · Gradle |
| `libs/web-shared/api-schemas` | `@fms/api-schemas` | api 하나당 schema 객체 하나 (url · 요청 · 응답 타입) | TypeScript · vite |
| `libs/web-shared/consts` | `@fms/consts` | `shared-consts` JSON 에서 `yarn contracts:generate` 로 만든 웹용 상수 | TypeScript · vite |
| `libs/web-shared/types` | `@fms/types` | api 응답 · 에러 · 접근 정책 트리 타입 | TypeScript · vite |
| `libs/web-shared/error-provider` | `@fms/error-provider` | 웹 공통 에러 객체 `CommonError` · `isCommonError` | TypeScript · vite |
| `libs/web-shared/common-utils` | `@fms/common-utils` | IP 버전 판정 · 접근 정책 설명 문구 | TypeScript · vite |
| `libs/web-shared/jwt-handler` | `@fms/jwt-handler` | 관리자 access token 검증 · 만료 시각 읽기 (jose) | TypeScript · vite |
| `libs/web-shared/web-ui` | `@fms/web-ui` | 두 웹이 함께 쓰는 UI 컴포넌트 (버튼 · 입력 · 진행 막대 등) | TypeScript · React · vite |
| `libs/web-shared/web-utils` | `@fms/web-utils` | 날짜 · 파일 크기 포맷, 요청 IP 읽기 · api 전달 헤더 만들기 | TypeScript · vite |
| `libs/internal/biome-config` | `@fms/biome-config` | 공용 biome 설정 · grit lint 규칙 | JSON · GritQL |
