import { ADMIN_ACCESS_TOKEN_COOKIE } from "@fms/consts/cookies/admin-auth-cookie-names";
import type { AccessPolicyDeniedDetails } from "@fms/types/errors/access-policy-denied-details";
import type { ApiFailBody } from "@fms/types/responses/api-response-body";
import { cookies, headers } from "next/headers";
import { webEnv } from "@/consts/web-env";
import { buildApiForwardHeaders } from "@/utils/commons/build-api-forward-headers";

/** 차단된 이유를 보여주려고 접근 확인을 한 번 더 호출한다. 이미 통과되는 상태면 정보 없이 다시 시도만 안내한다. */
export async function readDeniedDetails(): Promise<AccessPolicyDeniedDetails | null> {
  const token = (await cookies()).get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const res = await fetch(`${webEnv.apiInternalUrl}/api/admin/auth/access-check`, {
    headers: buildApiForwardHeaders(await headers(), token),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as ApiFailBody | null;
  return res.status === 403 ? ((body?.error.details as AccessPolicyDeniedDetails) ?? null) : null;
}
