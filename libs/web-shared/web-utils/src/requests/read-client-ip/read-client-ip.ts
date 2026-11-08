/**
 * 요청 IP 를 X-Forwarded-For 의 오른쪽에서 `trustedProxyHops` 번째 값으로 고른다.
 * 프록시는 자기 주소가 아니라 자기에게 접속한 주소를 끝에 붙이므로, 신뢰하는 프록시가 N 대면 오른쪽에서 N 번째 값이 실제 클라이언트다.
 * 예) 브라우저 → nginx → 웹 이면 1 이고, nginx 가 붙인 맨 오른쪽 값을 쓴다. 그보다 왼쪽은 클라이언트가 써 보낸 값일 수 있다.
 *
 * 0(웹을 직접 노출)은 1 과 똑같이 맨 오른쪽 값을 쓴다. 원래는 헤더 대신 소켓 IP 를 써야 하지만 Next 에서는 소켓 IP 를 직접 얻을 수 없다.
 * Next 서버는 이 헤더가 비어 있을 때만 소켓 IP 로 채우므로, 클라이언트가 헤더를 보내면 그 값이 그대로 쓰여 위조를 걸러낼 수 없다.
 */
export function readClientIp(headers: Headers, trustedProxyHops: number): string {
  const entries = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (entries.length === 0) {
    return "";
  }
  return entries[Math.max(0, entries.length - Math.max(1, trustedProxyHops))];
}
