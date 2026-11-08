import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";
import type { HeaderRow } from "../../../../../../_types/editor-block";
import { createKey } from "../../../../../create-key";

export const toHeaderRow = (node: Extract<AccessPolicyNode, { type: "HEADER" }>): HeaderRow => ({
  key: createKey(),
  name: node.name,
  matchType: node.matchType,
  value: node.value ?? "",
});
