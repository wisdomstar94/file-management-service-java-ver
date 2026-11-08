import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { buildApiForwardHeaders } from "@fms/web-utils/requests/build-api-forward-headers";
import { headers } from "next/headers";
import { webEnv } from "@/consts/web-env";
import { buildApiUrl } from "@/utils/commons/build-api-url";
import { createApiCommonError } from "../_utils/create-api-common-error";
import { toRequestBody } from "../_utils/to-request-body";

/**
 * 서버(서버 컴포넌트 · 서버 액션)에서 api 를 호출한다. 400~500 대 응답은 `CommonError` 로 throw 한다.
 * 원래 요청 IP · 헤더를 함께 넘긴다.
 */
export async function fetchServerWrapper<S extends ApiSchema>(schema: S, request: ApiRequest<S>): Promise<ResBody<S>> {
  const { params, query, headers: requestHeaders, body } = request as Partial<ApiSchema["request"]>;
  const url = `${webEnv.apiInternalUrl}${buildApiUrl({ url: schema.url, params, query })}`;

  // 요청 IP 헤더를 호출하는 쪽이 덮어쓰지 못하게 schema 헤더를 먼저 넣고 전달 헤더로 덮는다.
  const finalHeaders = new Headers(requestHeaders as Record<string, string> | undefined);
  const forwardHeaders = buildApiForwardHeaders(await headers(), { trustedProxyHops: webEnv.trustedProxyHops });
  for (const [name, value] of forwardHeaders) {
    finalHeaders.set(name, value);
  }

  const res = await fetch(url, {
    method: schema.method,
    headers: finalHeaders,
    body: toRequestBody(body, finalHeaders),
    cache: "no-store",
  });
  if (res.ok) {
    if (schema.responseType === "stream") {
      return res as ResBody<S>;
    }
    return (res.status === 204 ? null : await res.json()) as ResBody<S>;
  }
  throw await createApiCommonError({ res, url, method: schema.method });
}
