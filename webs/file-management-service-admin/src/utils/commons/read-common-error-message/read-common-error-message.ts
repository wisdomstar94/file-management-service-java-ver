import type { CommonError } from "@fms/error-provider/types/common-error";
import type { ApiFailBody } from "@fms/types/responses/api-response-body";

/** 400 검증 오류면 필드별 첫 메시지를, 아니면 api 메시지 또는 그 외 에러 메시지를 돌려준다. */
export function readCommonErrorMessage(error: CommonError): string {
  const body = error.apiError?.resPayload as Partial<ApiFailBody> | undefined;
  const issues = (body?.error?.details as { issues?: { message: string }[] } | undefined)?.issues;
  return issues?.[0]?.message ?? body?.error?.message ?? error.otherError?.message ?? "요청을 처리하지 못했습니다.";
}
