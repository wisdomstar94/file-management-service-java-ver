import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@fms/consts/cookies/admin-auth-cookie-names";
import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import type { CommonError } from "@fms/error-provider/types/common-error";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { webEnv } from "@/consts/web-env";
import { buildApiForwardHeaders } from "@/utils/commons/build-api-forward-headers";
import { buildApiUrl } from "@/utils/commons/build-api-url";
import { createApiCommonError } from "../_utils/create-api-common-error";
import { toRequestBody } from "../_utils/to-request-body";
import type { FetchServerWrapperOptions } from "./_types/fetch-server-wrapper-options";

/**
 * 서버(서버 컴포넌트 · 서버 액션 · proxy)에서 api 를 호출한다.
 * 400~500 대 응답은 `CommonError` 로 throw 한다. 이동 옵션이 켜져 있으면 해당 화면으로 먼저 이동한다.
 */
export async function fetchServerWrapper<S extends ApiSchema>(
  schema: S,
  request: ApiRequest<S>,
  options: FetchServerWrapperOptions = {},
): Promise<ResBody<S>> {
  const { redirectOnAuthError = true, redirectOnPageError = true } = options;
  const { params, query, headers: requestHeaders, body } = request as Partial<ApiSchema["request"]>;
  const url = `${webEnv.apiInternalUrl}${buildApiUrl({ url: schema.url, params, query })}`;

  const accessToken =
    options.accessToken === undefined
      ? (await cookies()).get(ADMIN_ACCESS_TOKEN_COOKIE)?.value
      : (options.accessToken ?? undefined);
  // 요청 IP · 토큰 헤더를 호출하는 쪽이 덮어쓰지 못하게 schema 헤더를 먼저 넣고 전달 헤더로 덮는다.
  const forwardHeaders = buildApiForwardHeaders(options.incoming ?? (await headers()), accessToken);
  const finalHeaders = new Headers(requestHeaders as Record<string, string> | undefined);
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

  const error: CommonError = await createApiCommonError({ res, url, method: schema.method });
  if (redirectOnAuthError) {
    if (res.status === 401) {
      redirect("/login");
    }
    if (error.errorCode === API_ERROR_CODE.ACCESS_POLICY_DENIED) {
      redirect("/access-denied");
    }
  }
  if (redirectOnPageError) {
    if (error.errorCode === API_ERROR_CODE.PERMISSION_DENIED) {
      redirect("/forbidden");
    }
    if (res.status === 404) {
      notFound();
    }
  }
  throw error;
}
