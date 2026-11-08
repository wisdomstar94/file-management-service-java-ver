import type { ApiQueryValue } from "@fms/api-schemas/types/api-schema";
import { createOtherCommonError } from "../create-other-common-error";

/** `:name` 경로 변수를 `params` 로 채우고 `query` 를 붙인다. */
export function buildApiUrl(props: {
  url: string;
  params?: Readonly<Record<string, string>>;
  query?: Readonly<Record<string, ApiQueryValue>>;
}): string {
  const { url, params, query } = props;
  const path = url.replace(/:(\w+)/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined) {
      throw createOtherCommonError({ message: `경로 변수 ${name} 값이 없습니다. (${url})` });
    }
    return encodeURIComponent(value);
  });

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }
    for (const item of Array.isArray(value) ? value : [value]) {
      search.append(key, String(item));
    }
  }
  const queryString = search.toString();
  return queryString ? `${path}?${queryString}` : path;
}
