import { webEnv } from "@/consts/web-env";

// 로그인 · 로그아웃은 api 가 쿠키를 심고 지운다. 같은 쿠키를 갱신하도록 도메인 · 경로를 api 와 똑같이 맞춘다.
export const createAdminTokenCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: webEnv.isSecureCookie,
  domain: webEnv.cookieDomain,
  path: "/",
});
