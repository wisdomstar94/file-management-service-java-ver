import { COMMON_ERROR_IDENTIFIER } from "@fms/error-provider/consts/common-error-identifier";
import type { CommonError } from "@fms/error-provider/types/common-error";
import type { ApiFailBody } from "@fms/types/responses/api-response-body";

/** api 의 400~500 대 응답. 응답 본문이 JSON 이면 해석한 값을, 아니면 텍스트를 그대로 담는다. */
export async function createApiCommonError(props: {
  res: Response;
  url: string;
  method: string;
}): Promise<CommonError> {
  const { res, url, method } = props;
  const text = await res.text().catch(() => "");
  let resPayload: unknown = text || undefined;
  try {
    resPayload = text ? JSON.parse(text) : undefined;
  } catch {
    // JSON 이 아니면 텍스트 그대로 둔다.
  }
  const code = (resPayload as Partial<ApiFailBody> | undefined)?.error?.code;
  return {
    errorIdentifier: COMMON_ERROR_IDENTIFIER,
    errorCode: typeof code === "string" ? code : crypto.randomUUID(),
    apiError: { url, method, resPayload },
    timestamp: Date.now(),
  };
}
