import type { AccessPolicyIpMode } from "@fms/types/access-policies/access-policy-node";

export const MODES: { mode: AccessPolicyIpMode; title: string; description: string }[] = [
  {
    mode: "ALLOW_ALL_EXCEPT",
    title: "기본 허용 · 지정 IP 차단",
    description: "모든 IP를 허용하고, 아래 목록만 차단합니다.",
  },
  {
    mode: "DENY_ALL_EXCEPT",
    title: "기본 차단 · 지정 IP 허용",
    description: "모든 IP를 차단하고, 아래 목록만 허용합니다.",
  },
];
