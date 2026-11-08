import { PUBLIC_SHARE_LINK_GATE_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import { readAccessPolicyDeniedDetails } from "@/utils/domains/access-policy/read-access-policy-denied-details";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

/** 접근 정책만 서버에서 확인한다. 비밀번호 · 자료 정보는 api 의 잠금 해제 쿠키가 필요해 브라우저가 직접 받는다. */
export async function readGateState(shareLinkKey: string) {
  return fetchServerWrapper(PUBLIC_SHARE_LINK_GATE_API, { params: { shareLinkKey } })
    .then((gate) => ({ kind: "PASSED" as const, isPasswordRequired: gate.data.state === "PASSWORD_REQUIRED" }))
    .catch((error: unknown) => {
      const details = readAccessPolicyDeniedDetails(error);
      return details ? { kind: "BLOCKED" as const, details } : { kind: "NOT_FOUND" as const };
    });
}
