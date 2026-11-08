import type { ApiErrorBody } from "../../errors/api-error-body/index.js";

export type ApiSuccessBody<TData> = { data: TData; error?: never };

export type ApiFailBody = { data?: never; error: ApiErrorBody };

/** api 의 모든 JSON 응답 본문. 본문이 없는 204 와 파일 다운로드는 제외한다. */
export type ApiResponseBody<TData> = ApiSuccessBody<TData> | ApiFailBody;
