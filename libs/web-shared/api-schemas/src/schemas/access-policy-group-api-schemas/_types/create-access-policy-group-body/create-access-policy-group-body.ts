import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";

export type CreateAccessPolicyGroupBody = {
  name: string;
  ruleTree: AccessPolicyNode | null;
};
