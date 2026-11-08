import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import { createOtherCommonError } from "@/utils/commons/create-other-common-error";

/** 브라우저가 넘긴 schema 라 그대로 믿지 않는다. 공개 api 경로 · json 응답 · 헤더 없음만 허용한다. */
export function assertCallableSchema(schema: ApiSchema, request: { headers?: unknown }) {
  const isPublicApi = schema.url.startsWith("/api/public/") && !schema.url.includes("..");
  if (!isPublicApi || schema.responseType === "stream" || request.headers !== undefined) {
    throw createOtherCommonError({
      message: `서버 액션으로 호출할 수 없는 api 입니다. (${schema.method} ${schema.url})`,
    });
  }
}
