import type { COMMON_ERROR_IDENTIFIER } from "../../consts/common-error-identifier/index.js";

/** file-management-service 웹에서 다루는 모든 에러의 공통 규격. 서버 액션 경계를 넘도록 plain object 로 둔다. */
export type CommonError = {
  errorIdentifier: typeof COMMON_ERROR_IDENTIFIER;
  /** api 응답의 에러 코드 또는 uuid */
  errorCode: string;
  /** api 가 400~500 대로 응답했을 때 */
  apiError?: {
    /** params · query 가 모두 반영된 실제 요청 url */
    url: string;
    method: string;
    /** api 응답의 `res.json()` 또는 `res.text()` 값 */
    resPayload?: unknown;
  };
  /** api 에러 응답이 아닌 그 외의 에러일 때 */
  otherError?: {
    message: string;
  };
  /** `Date.now()` */
  timestamp: number;
};
