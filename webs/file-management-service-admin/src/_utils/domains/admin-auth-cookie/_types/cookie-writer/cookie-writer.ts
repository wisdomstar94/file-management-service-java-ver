/** next 의 `cookies()` 와 `NextResponse.cookies` 가 공통으로 가진 메서드 */
export type CookieWriter = {
  set: (name: string, value: string, options: Record<string, unknown>) => unknown;
  delete: (options: { name: string; domain?: string; path: string }) => unknown;
};
