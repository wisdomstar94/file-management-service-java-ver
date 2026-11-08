import { readClientIp } from "../read-client-ip/index.js";
import { DROP_HEADERS } from "./_consts/drop-headers/index.js";

/**
 * 브라우저 요청 헤더를 api 로 넘길 헤더로 바꾼다. 접근 정책의 헤더 제한이 원래 요청 헤더로 평가되도록 그대로 넘기고,
 * 요청 IP 는 X-Forwarded-For 한 개로 정리해 넘긴다(api 는 웹 서버를 신뢰 프록시로 둔다).
 */
export function buildApiForwardHeaders(
  incoming: Headers,
  options: { trustedProxyHops: number; accessToken?: string },
): Headers {
  const headers = new Headers();
  incoming.forEach((value, name) => {
    if (!DROP_HEADERS.has(name.toLowerCase())) {
      headers.set(name, value);
    }
  });
  const clientIp = readClientIp(incoming, options.trustedProxyHops);
  if (clientIp) {
    headers.set("x-forwarded-for", clientIp);
  }
  if (options.accessToken) {
    headers.set("authorization", `Bearer ${options.accessToken}`);
  }
  return headers;
}
