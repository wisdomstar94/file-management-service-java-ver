# 작업 규칙

## DB 마이그레이션

- DB 마이그레이션은 Flyway SQL 파일이며 `servers/database-manager/src/main/resources/db/migration` 에 있습니다.
- 새 파일은 반드시 `yarn db:new-migration -Pname=<PascalCase 이름>` 으로 만들고 내용을 채웁니다. (`V<현재 시각 ms>__<이름>.sql`)
- 파일명의 버전(timestamp)을 직접 짓거나 고치지 않습니다. 이전 파일 번호에 일정 값을 더하는 식으로 만들면 언제 만든 DB 마이그레이션인지 알 수 없게 됩니다.
- 이미 어떤 DB 에든 적용된 DB 마이그레이션은 이름 · 내용을 바꾸지 않습니다. Flyway checksum 이 어긋나 migrate 가 멈춥니다. 되돌릴 때는 새 마이그레이션을 만듭니다.
- JPA 엔티티(`libs/server-shared/database-entities`)를 바꾸면 같은 변경을 마이그레이션 SQL 로 씁니다. api 는 `ddl-auto=validate` 라 어긋나면 기동하지 않습니다.
- `yarn lint:check` 가 `scripts/check-migrations.mjs` 로 파일명 형식 · 버전(둥근 값 · 미래 · 중복)과 커밋된 파일의 이름 변경 · 삭제를 검사합니다. 내용 변경은 migrate 할 때 Flyway checksum 이, 엔티티와 SQL 의 어긋남은 api 기동 시 `ddl-auto=validate` 가 잡습니다.

## 서버 · 웹 공용 상수

- 권한 코드 · 에러 코드 · 쿠키 이름 등 서버(Java)와 웹(TS)이 함께 쓰는 상수는 `libs/contracts/shared-consts/*.json` 에서만 고칩니다.
- 고친 뒤 `yarn contracts:generate` 로 `libs/web-shared/consts` 를 다시 만듭니다. Java 상수는 Gradle 빌드가 만듭니다.
