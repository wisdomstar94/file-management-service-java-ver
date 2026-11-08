import type { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { readAdminAccessTokenExpiresAt } from "@fms/jwt-handler/tokens/read-admin-access-token-expires-at";
import { webEnv } from "@/consts/web-env";
import { requestAdminTokenRefresh } from "./_utils/request-admin-token-refresh";

/**
 * 유효한 access token 을 돌려준다. 없거나 만료가 가까우면 refresh token 으로 새로 받아 `refreshed` 에 담는다.
 * 미리 갱신하다 실패하면 아직 유효한 기존 토큰을 그대로 쓴다. 쓸 수 있는 토큰이 없으면 `accessToken` 이 `null` 이다.
 */
export async function resolveAdminAccessToken(props: {
  incoming: Headers;
  accessToken?: string;
  refreshToken?: string;
}): Promise<{ accessToken: string | null; refreshed: ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"] | null }> {
  const { incoming, accessToken, refreshToken } = props;
  const expiresAt = accessToken
    ? await readAdminAccessTokenExpiresAt({ token: accessToken, secret: webEnv.adminAccessTokenSecret })
    : null;
  const validAccessToken = accessToken && expiresAt ? accessToken : null;
  const isRefreshDue = !expiresAt || expiresAt.getTime() - Date.now() < webEnv.accessTokenRefreshBeforeSeconds * 1000;
  if (!isRefreshDue || !refreshToken) {
    return { accessToken: validAccessToken, refreshed: null };
  }
  const refreshed = await requestAdminTokenRefresh(incoming, refreshToken);
  return { accessToken: refreshed?.accessToken ?? validAccessToken, refreshed };
}
