import { ADMIN_ACCESS_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE } from "@fms/consts/cookies/admin-auth-cookie-names";
import { webEnv } from "@/consts/web-env";
import type { CookieWriter } from "../_types/cookie-writer";

export function clearAdminTokenCookies(cookies: CookieWriter): void {
  cookies.delete({ name: ADMIN_ACCESS_TOKEN_COOKIE, domain: webEnv.cookieDomain, path: "/" });
  cookies.delete({ name: ADMIN_REFRESH_TOKEN_COOKIE, domain: webEnv.cookieDomain, path: "/" });
}
