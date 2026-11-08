import type { PUBLIC_SHARE_LINK_DETAIL_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import type { CommonError } from "@fms/error-provider/types/common-error";
import { readAccessPolicyDeniedDetails } from "@/utils/domains/access-policy/read-access-policy-denied-details";
import type { ShareDetailState } from "../../_types/share-detail-state";

export function toShareDetailState(
  result: ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API> | CommonError,
  isPasswordRequired: boolean,
): ShareDetailState {
  if (!isCommonError(result)) {
    return { kind: "OPEN", detail: result.data };
  }
  if (isPasswordRequired && result.errorCode === API_ERROR_CODE.UNAUTHORIZED) {
    return { kind: "PASSWORD_REQUIRED" };
  }
  const details = readAccessPolicyDeniedDetails(result);
  return details ? { kind: "BLOCKED", details } : { kind: "NOT_FOUND" };
}
