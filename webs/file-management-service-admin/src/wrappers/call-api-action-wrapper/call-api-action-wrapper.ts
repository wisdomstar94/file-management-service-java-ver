"use server";

import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { CommonError } from "@fms/error-provider/types/common-error";
import { fetchServerWrapper } from "../fetch-server-wrapper";
import { serverActionWrapper } from "../server-action-wrapper";
import { assertCallableSchema } from "./_utils/assert-callable-schema";

/** 클라이언트 컴포넌트가 api schema 로 api 를 호출하는 서버 액션. 토큰은 서버에서만 붙인다. */
export async function callApiActionWrapper<S extends ApiSchema>(
  schema: S,
  request: ApiRequest<S>,
): Promise<ResBody<S> | CommonError> {
  return serverActionWrapper(async () => {
    assertCallableSchema(schema, request);
    // 권한 없음 · 404 는 화면 이동 대신 호출한 쪽이 메시지로 보여준다.
    return fetchServerWrapper(schema, request, { redirectOnPageError: false });
  })();
}
