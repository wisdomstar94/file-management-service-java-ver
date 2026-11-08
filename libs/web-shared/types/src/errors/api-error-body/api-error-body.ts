import type { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";

export type ApiErrorBody = {
  code: (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];
  message: string;
  requestKey?: string;
  details?: unknown;
};
