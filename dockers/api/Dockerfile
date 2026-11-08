# syntax=docker/dockerfile:1
# servers/api + servers/database-manager (Flyway 마이그레이션 · 시드 포함) 이미지.
# 빌드 컨텍스트는 저장소 루트. web 소스는 같은 폴더의 Dockerfile.dockerignore 로 빠진다.

ARG JDK_IMAGE=eclipse-temurin:25-jdk-noble
ARG JRE_IMAGE=eclipse-temurin:25-jre-noble

FROM ${JDK_IMAGE} AS builder
WORKDIR /app
# 의존성 다운로드를 소스 변경과 분리해 캐시한다.
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && ./gradlew --no-daemon --version
COPY libs/contracts ./libs/contracts
COPY libs/server-shared ./libs/server-shared
COPY servers ./servers
RUN ./gradlew --no-daemon :servers:api:bootJar :servers:database-manager:bootJar

FROM ${JRE_IMAGE}
WORKDIR /app
# compose 의 healthcheck 가 쓴다.
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/servers/api/build/libs/api.jar ./api.jar
COPY --from=builder /app/servers/database-manager/build/libs/database-manager.jar ./database-manager.jar
COPY dockers/scripts/run-migrations.sh ./dockers/scripts/run-migrations.sh
# 윈도우 체크아웃(CRLF)이면 sh 가 `set -e\r` 에서 실패하므로 CR 을 지운다.
RUN sed -i 's/\r$//' ./dockers/scripts/run-migrations.sh
EXPOSE 4000
CMD ["java", "-jar", "/app/api.jar"]
