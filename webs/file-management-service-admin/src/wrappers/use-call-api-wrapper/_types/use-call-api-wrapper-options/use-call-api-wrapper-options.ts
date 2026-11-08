export type UseCallApiWrapperOptions = {
  /** `action` 은 서버 액션(`callApiActionWrapper`), `client` 는 브라우저에서 api 직접 호출(`fetchClientWrapper`). 기본 `action` */
  via?: "action" | "client";
  /** 성공하면 띄울 토스트 문구 */
  successMessage?: string;
  /** 성공하면 서버 컴포넌트를 다시 불러온다. 기본 `true` */
  refreshOnSuccess?: boolean;
  /** 실패하면 오류 토스트를 띄운다. 기본 `true` */
  showErrorToast?: boolean;
  /** `via: "client"` 에서 api 가 심는 쿠키(로그인 토큰)를 주고받으려면 `include` */
  credentials?: RequestCredentials;
};
