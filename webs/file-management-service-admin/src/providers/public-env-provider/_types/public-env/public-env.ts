/** 서버가 런타임에 읽어 브라우저로 내려주는 환경변수. 이미지를 다시 빌드하지 않고 바꿀 수 있다. */
export type PublicEnv = {
  /** 브라우저가 직접 호출하는 api 주소 (로그인 · 로그아웃 · 업로드 · 다운로드) */
  apiPublicUrl: string;
};
