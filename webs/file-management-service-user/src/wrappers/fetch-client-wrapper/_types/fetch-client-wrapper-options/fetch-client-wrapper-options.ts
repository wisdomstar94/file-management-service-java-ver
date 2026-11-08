export type FetchClientWrapperOptions = {
  /** schema url 앞에 붙일 api 주소(`API_PUBLIC_URL`). 없으면 같은 origin 기준 상대 경로 */
  baseUrl?: string;
  /** api 가 심은 httpOnly 쿠키(공개 링크 잠금 해제)를 주고받으려면 `include` */
  credentials?: RequestCredentials;
};
