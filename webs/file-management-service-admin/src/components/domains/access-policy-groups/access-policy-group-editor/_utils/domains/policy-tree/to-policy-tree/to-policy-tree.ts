import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";
import type { EditorBlock } from "../../../../_types/editor-block";
import { toNode } from "./_utils/to-node";

/** 조건이 하나도 없으면 `null`(제한 없음) */
export function toPolicyTree(root: Extract<EditorBlock, { kind: "GROUP" }>): AccessPolicyNode | null {
  return root.children.length === 0 ? null : toNode(root);
}
