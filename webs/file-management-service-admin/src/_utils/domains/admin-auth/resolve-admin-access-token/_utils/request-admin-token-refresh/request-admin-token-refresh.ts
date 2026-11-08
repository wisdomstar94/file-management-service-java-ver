import { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

/** refresh token 으로 새 토큰을 받는다. 만료 · 폐기 · 접근 정책 차단이면 `null` */
export async function requestAdminTokenRefresh(
  incoming: Headers,
  refreshToken: string,
): Promise<ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"] | null> {
  try {
    const res = await fetchServerWrapper(
      ADMIN_REFRESH_TOKEN_API,
      { body: { refreshToken } },
      { incoming, accessToken: null, redirectOnAuthError: false, redirectOnPageError: false },
    );
    return res.data;
  } catch {
    return null;
  }
}
