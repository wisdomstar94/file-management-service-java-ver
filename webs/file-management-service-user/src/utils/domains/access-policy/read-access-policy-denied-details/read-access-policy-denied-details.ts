import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import type { CommonError } from "@fms/error-provider/types/common-error";
import type { AccessPolicyDeniedDetails } from "@fms/types/errors/access-policy-denied-details";
import type { ApiFailBody } from "@fms/types/responses/api-response-body";

/** 접근 정책에 막힌 에러면 차단 화면에 보여줄 정보를, 아니면 `null` 을 돌려준다. */
export function readAccessPolicyDeniedDetails(error: unknown): AccessPolicyDeniedDetails | null {
  if (!isCommonError(error) || error.errorCode !== API_ERROR_CODE.ACCESS_POLICY_DENIED) {
    return null;
  }
  const body = (error as CommonError).apiError?.resPayload as Partial<ApiFailBody> | undefined;
  return (body?.error?.details as AccessPolicyDeniedDetails | undefined) ?? null;
}
