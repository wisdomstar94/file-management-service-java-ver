import { ADMIN_ACCESS_CHECK_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import type { NextRequest } from "next/server";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

export async function checkAccessPolicy(request: NextRequest, accessToken: string) {
  try {
    await fetchServerWrapper(
      ADMIN_ACCESS_CHECK_API,
      {},
      { incoming: request.headers, accessToken, redirectOnAuthError: false, redirectOnPageError: false },
    );
    return "ALLOWED" as const;
  } catch (error) {
    const isDenied = isCommonError(error) && error.errorCode === API_ERROR_CODE.ACCESS_POLICY_DENIED;
    return isDenied ? ("DENIED" as const) : ("UNAUTHORIZED" as const);
  }
}
