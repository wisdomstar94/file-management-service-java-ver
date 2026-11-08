import { ADMIN_ACCESS_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE } from "@fms/consts/cookies/admin-auth-cookie-names";
import { type NextRequest, NextResponse } from "next/server";
import { checkAccessPolicy } from "./_utils/domains/access-policy/check-access-policy";
import { nextWithAccessToken } from "./_utils/domains/admin-auth/next-with-access-token";
import { resolveAdminAccessToken } from "./_utils/domains/admin-auth/resolve-admin-access-token";
import { clearAdminTokenCookies } from "./_utils/domains/admin-auth-cookie/clear-admin-token-cookies";
import { writeAdminTokenCookies } from "./_utils/domains/admin-auth-cookie/write-admin-token-cookies";
import { readRouteGroup } from "./_utils/read-route-group";

export async function proxy(request: NextRequest) {
  const routeGroup = readRouteGroup(request.nextUrl.pathname);
  if (routeGroup === "public") {
    return NextResponse.next();
  }

  const { accessToken, refreshed } = await resolveAdminAccessToken({
    incoming: request.headers,
    accessToken: request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value,
  });
  const withCookies = (response: NextResponse) => {
    if (refreshed) {
      writeAdminTokenCookies(response.cookies, refreshed);
    }
    return response;
  };

  if (routeGroup === "guest-only") {
    return accessToken ? withCookies(NextResponse.redirect(new URL("/documents", request.url))) : NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    const response = NextResponse.redirect(loginUrl);
    clearAdminTokenCookies(response.cookies);
    return response;
  }

  const result = await checkAccessPolicy(request, accessToken);
  if (result === "DENIED") {
    return withCookies(NextResponse.rewrite(new URL("/access-denied", request.url)));
  }
  if (result === "UNAUTHORIZED") {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearAdminTokenCookies(response.cookies);
    return response;
  }
  return withCookies(nextWithAccessToken(request, accessToken));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|jpg|webp)$).*)"],
};
