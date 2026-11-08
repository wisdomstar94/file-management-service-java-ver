# syntax=docker/dockerfile:1
# webs/file-management-service-admin (Next standalone) 이미지.
# 빌드 컨텍스트는 저장소 루트. 다른 앱 소스는 같은 폴더의 Dockerfile.dockerignore 로 빠진다.

ARG NODE_IMAGE=node:26.13.0-bookworm-slim

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
# Node 25 부터 corepack 이 함께 설치되지 않아 직접 설치한다.
RUN npm install -g corepack && corepack enable
COPY . .
RUN yarn workspaces focus @fms/admin-web
# 이 앱과 그 의존 libs 만 의존 순서대로 빌드한다.
RUN yarn workspaces foreach -Rt --from '@fms/admin-web' run build

FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder /app/webs/file-management-service-admin/.next/standalone ./
COPY --from=builder /app/webs/file-management-service-admin/.next/static ./webs/file-management-service-admin/.next/static
EXPOSE 3000
CMD ["node", "webs/file-management-service-admin/server.js"]
