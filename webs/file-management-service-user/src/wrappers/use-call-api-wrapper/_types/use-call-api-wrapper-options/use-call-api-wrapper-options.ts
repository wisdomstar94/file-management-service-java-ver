export type UseCallApiWrapperOptions = {
  /**
   * `action` 은 서버 액션(`callApiActionWrapper`), `client` 는 브라우저에서 api 직접 호출(`fetchClientWrapper`). 기본 `action`
   * `client` 는 api 가 심은 쿠키(공개 링크 잠금 해제)를 주고받도록 `credentials: "include"` 로 호출한다.
   */
  via?: "action" | "client";
  /** 성공하면 서버 컴포넌트를 다시 불러온다. 기본 `true` */
  refreshOnSuccess?: boolean;
};
