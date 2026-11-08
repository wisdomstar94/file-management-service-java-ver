import type { Response } from "supertest";

/** 응답 Set-Cookie 에서 쿠키 하나의 값을 읽는다. 없으면 `undefined` */
export function readSetCookie(res: Response, name: string): string | undefined {
  const setCookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
  const found = setCookies.find((cookie) => cookie.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1).split(";")[0] ?? "") : undefined;
}
