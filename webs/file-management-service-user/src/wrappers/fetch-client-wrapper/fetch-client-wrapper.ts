import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { buildApiUrl } from "@/utils/commons/build-api-url";
import { createApiCommonError } from "../_utils/create-api-common-error";
import { toRequestBody } from "../_utils/to-request-body";
import type { FetchClientWrapperOptions } from "./_types/fetch-client-wrapper-options";

/** 브라우저에서 api 를 직접 호출한다. 400~500 대 응답은 `CommonError` 로 throw 한다. */
export async function fetchClientWrapper<S extends ApiSchema>(
  schema: S,
  request: ApiRequest<S>,
  options: FetchClientWrapperOptions = {},
): Promise<ResBody<S>> {
  const { params, query, headers: requestHeaders, body } = request as Partial<ApiSchema["request"]>;
  const url = `${options.baseUrl ?? ""}${buildApiUrl({ url: schema.url, params, query })}`;
  const headers = new Headers(requestHeaders as Record<string, string> | undefined);

  const res = await fetch(url, {
    method: schema.method,
    headers,
    body: toRequestBody(body, headers),
    credentials: options.credentials,
  });
  if (res.ok) {
    if (schema.responseType === "stream") {
      return res as ResBody<S>;
    }
    return (res.status === 204 ? null : await res.json()) as ResBody<S>;
  }
  throw await createApiCommonError({ res, url, method: schema.method });
}
