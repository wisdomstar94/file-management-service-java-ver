import { IPV4_PATTERN } from "./_consts/ipv4-pattern/index.js";

/**
 * IP 문자열의 버전을 판정합니다. 올바른 IP 가 아니면 `0` 입니다.
 * 브라우저에서도 쓸 수 있도록 `node:net` 대신 URL 파서로 IPv6 를 검증합니다.
 */
export function readIpVersion(ip: string): 0 | 4 | 6 {
  if (IPV4_PATTERN.test(ip)) {
    return 4;
  }
  if (!ip.includes(":")) {
    return 0;
  }
  try {
    new URL(`http://[${ip}]`);
    return 6;
  } catch {
    return 0;
  }
}
