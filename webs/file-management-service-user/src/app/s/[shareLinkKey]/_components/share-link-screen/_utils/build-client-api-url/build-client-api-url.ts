import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest } from "@fms/api-schemas/types/api-schema-utils";
import { buildApiUrl } from "@/utils/commons/build-api-url";

/** 브라우저에서 바로 열 url (다운로드 링크 등) */
export function buildClientApiUrl<S extends ApiSchema>(
  schema: S,
  request: ApiRequest<S>,
  options: { baseUrl?: string } = {},
): string {
  const { params, query } = request as Partial<ApiSchema["request"]>;
  return `${options.baseUrl ?? ""}${buildApiUrl({ url: schema.url, params, query })}`;
}
