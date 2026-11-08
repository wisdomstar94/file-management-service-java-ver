import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";
import type { AccessPolicyGroupSummary } from "../access-policy-group-summary/index.js";

export type AccessPolicyGroupDetail = AccessPolicyGroupSummary & {
  ruleTree: AccessPolicyNode | null;
  usedAccountCount: number;
  usedShareLinkCount: number;
};
