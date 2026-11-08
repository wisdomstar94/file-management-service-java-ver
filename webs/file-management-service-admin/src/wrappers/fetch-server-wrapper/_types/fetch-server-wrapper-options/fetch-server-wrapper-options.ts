export type FetchServerWrapperOptions = {
  /** `false` 면 401 · 접근 정책 차단에서 로그인 · 차단 화면으로 이동하지 않고 `CommonError` 를 throw 한다. 기본 `true` */
  redirectOnAuthError?: boolean;
  /** `false` 면 권한 없음 · 404 에서 forbidden · not-found 화면으로 이동하지 않고 `CommonError` 를 throw 한다. 기본 `true` */
  redirectOnPageError?: boolean;
  /** 원래 요청 헤더. 없으면 `next/headers` 에서 읽는다. (`proxy.ts` 처럼 읽을 수 없는 곳에서 넘긴다) */
  incoming?: Headers;
  /** api 에 넘길 access token. `undefined` 면 쿠키에서 읽고, `null` 이면 넘기지 않는다. */
  accessToken?: string | null;
};
