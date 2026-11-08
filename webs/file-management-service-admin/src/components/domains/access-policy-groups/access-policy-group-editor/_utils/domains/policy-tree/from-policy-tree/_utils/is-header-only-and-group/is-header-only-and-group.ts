import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";

export const isHeaderOnlyAndGroup = (node: AccessPolicyNode) =>
  node.type === "GROUP" && node.operator === "AND" && node.children.every((child) => child.type === "HEADER");
