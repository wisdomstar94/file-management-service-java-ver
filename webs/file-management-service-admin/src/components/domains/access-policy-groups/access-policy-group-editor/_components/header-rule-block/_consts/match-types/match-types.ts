import type { AccessPolicyHeaderMatchType } from "@fms/types/access-policies/access-policy-node";

export const MATCH_TYPES: { value: AccessPolicyHeaderMatchType; label: string }[] = [
  { value: "EQUALS", label: "일치" },
  { value: "CONTAINS", label: "포함" },
  { value: "REGEX", label: "정규식" },
  { value: "EXISTS", label: "존재" },
];
