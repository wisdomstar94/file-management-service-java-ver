export type AccessPolicyIpMode = "ALLOW_ALL_EXCEPT" | "DENY_ALL_EXCEPT";

export type AccessPolicyHeaderMatchType = "EQUALS" | "CONTAINS" | "REGEX" | "EXISTS";

export type AccessPolicyGroupNode = { type: "GROUP"; operator: "AND" | "OR"; children: AccessPolicyNode[] };

export type AccessPolicyIpNode = { type: "IP"; mode: AccessPolicyIpMode; cidrs: string[] };

export type AccessPolicyHeaderNode = {
  type: "HEADER";
  name: string;
  matchType: AccessPolicyHeaderMatchType;
  value?: string;
};

export type AccessPolicyNode = AccessPolicyGroupNode | AccessPolicyIpNode | AccessPolicyHeaderNode;
