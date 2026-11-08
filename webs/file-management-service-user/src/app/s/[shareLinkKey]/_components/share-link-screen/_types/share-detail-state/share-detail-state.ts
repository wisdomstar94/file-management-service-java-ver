import type { PUBLIC_SHARE_LINK_DETAIL_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { AccessPolicyDeniedDetails } from "@fms/types/errors/access-policy-denied-details";

export type ShareDetailState =
  | { kind: "LOADING" }
  | { kind: "OPEN"; detail: ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API>["data"] }
  | { kind: "PASSWORD_REQUIRED" }
  | { kind: "BLOCKED"; details: AccessPolicyDeniedDetails }
  | { kind: "NOT_FOUND" };
