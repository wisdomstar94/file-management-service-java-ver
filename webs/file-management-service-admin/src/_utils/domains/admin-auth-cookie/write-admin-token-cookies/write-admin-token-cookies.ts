import type { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { ADMIN_ACCESS_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE } from "@fms/consts/cookies/admin-auth-cookie-names";
import type { CookieWriter } from "../_types/cookie-writer";
import { createAdminTokenCookieOptions } from "../_utils/create-admin-token-cookie-options";

export function writeAdminTokenCookies(
  cookies: CookieWriter,
  tokens: ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"],
): void {
  cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...createAdminTokenCookieOptions(),
    expires: new Date(tokens.accessTokenExpiresAt),
  });
  cookies.set(ADMIN_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...createAdminTokenCookieOptions(),
    expires: new Date(tokens.refreshTokenExpiresAt),
  });
}
