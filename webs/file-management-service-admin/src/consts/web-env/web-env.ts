/** admin-web 서버 쪽에서만 읽는 환경변수 */
export const webEnv = {
  /** web 서버가 api 를 호출할 주소. 내부 주소든 공인 IP · 도메인이든 web 서버에서 닿으면 된다. */
  apiInternalUrl: process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000",
  /** 브라우저가 api 를 직접 호출할 주소 (로그인 · 로그아웃 · 업로드 · 다운로드). 사용자 브라우저에서 닿아야 한다. */
  apiPublicUrl: process.env.API_PUBLIC_URL ?? "http://localhost:4000",
  /** api 와 같은 `JWT_SECRET_ADMIN_ACCOUNT`. access token 검증에만 쓴다. */
  adminAccessTokenSecret: process.env.JWT_SECRET_ADMIN_ACCOUNT ?? "",
  /** access token 만료까지 이 시간(초)보다 적게 남으면 미리 갱신한다. 검증한 토큰이 api 호출 전에 만료되지 않게 한다. */
  accessTokenRefreshBeforeSeconds: Number(process.env.WEB_ACCESS_TOKEN_REFRESH_BEFORE_SECONDS ?? 60),
  /** admin-web 앞단에 있는 신뢰할 수 있는 프록시 수. X-Forwarded-For 의 오른쪽에서 이만큼 건너뛴 값을 요청 IP 로 본다. */
  trustedProxyHops: Number(process.env.WEB_TRUSTED_PROXY_HOPS ?? 0),
  isSecureCookie: process.env.WEB_SECURE_COOKIE === "true",
  /** 토큰 쿠키를 api 와 함께 쓸 상위 도메인. api 의 `COOKIE_DOMAIN` 과 같은 값이어야 한다. 비우면 호스트 한정 */
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  userWebOrigin: process.env.USER_WEB_ORIGIN ?? "http://localhost:3001",
};
