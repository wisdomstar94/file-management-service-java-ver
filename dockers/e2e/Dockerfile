# syntax=docker/dockerfile:1
# 격리된 e2e 테스트 러너. web 을 빌드한 저장소 전체가 필요해 루트 .dockerignore 를 쓴다.
#   e2e-servers : 원본(Express) 시절부터 쓰던 api 블랙박스 테스트(e2e/api-e2e, jest)를 Java api 에 실행한다.
#   e2e-webs    : 웹 playwright 테스트

ARG NODE_IMAGE=node:26.13.0-bookworm-slim

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
# Node 25 부터 corepack 이 함께 설치되지 않아 직접 설치한다.
RUN npm install -g corepack && corepack enable
COPY . .
RUN yarn install --immutable
RUN yarn libs:build \
  && yarn workspace @fms/admin-web build \
  && yarn workspace @fms/user-web build

FROM builder AS e2e-servers
CMD ["yarn", "workspace", "@fms/api-e2e", "e2e"]

FROM mcr.microsoft.com/playwright:v1.65.0-noble AS e2e-webs
WORKDIR /app
COPY --from=builder /app /app
CMD ["sh", "-c", "cd /app/webs/file-management-service-admin && npx playwright test && cd /app/webs/file-management-service-user && npx playwright test"]
