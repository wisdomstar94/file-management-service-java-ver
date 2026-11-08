/** user-web 서버 쪽에서만 읽는 환경변수 */
export const webEnv = {
  /** web 서버가 api 를 호출할 주소. 내부 주소든 공인 IP · 도메인이든 web 서버에서 닿으면 된다. */
  apiInternalUrl: process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000",
  /** 브라우저가 api 를 직접 호출할 주소. 사용자 브라우저에서 닿아야 한다. */
  apiPublicUrl: process.env.API_PUBLIC_URL ?? "http://localhost:4000",
  /** user-web 앞단에 있는 신뢰할 수 있는 프록시 수. X-Forwarded-For 의 오른쪽에서 이만큼 건너뛴 값을 요청 IP 로 본다. */
  trustedProxyHops: Number(process.env.WEB_TRUSTED_PROXY_HOPS ?? 0),
};
