/** `FormData` 는 그대로, 그 외 값은 JSON 으로 보낸다. JSON 이면 `headers` 에 content-type 을 붙인다. */
export function toRequestBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }
  if (body instanceof FormData) {
    return body;
  }
  headers.set("content-type", "application/json");
  return JSON.stringify(body);
}
