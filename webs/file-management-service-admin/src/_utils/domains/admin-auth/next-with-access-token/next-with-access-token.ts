import { ADMIN_ACCESS_TOKEN_COOKIE } from "@fms/consts/cookies/admin-auth-cookie-names";
import { type NextRequest, NextResponse } from "next/server";

/** 새로 받은 토큰을 이번 요청의 서버 컴포넌트도 읽을 수 있게 요청 쿠키에도 반영한다. */
export function nextWithAccessToken(request: NextRequest, accessToken: string) {
  request.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, accessToken);
  return NextResponse.next({ request: { headers: request.headers } });
}
