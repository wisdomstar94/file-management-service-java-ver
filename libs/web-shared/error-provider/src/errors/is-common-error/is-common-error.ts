import { COMMON_ERROR_IDENTIFIER } from "../../consts/common-error-identifier/index.js";
import type { CommonError } from "../../types/common-error/index.js";

export function isCommonError(v: unknown): v is CommonError {
  if (typeof v !== "object" || v === null) {
    return false;
  }
  const record = v as Record<string, unknown>;
  return (
    record.errorIdentifier === COMMON_ERROR_IDENTIFIER &&
    typeof record.errorCode === "string" &&
    typeof record.timestamp === "number"
  );
}
