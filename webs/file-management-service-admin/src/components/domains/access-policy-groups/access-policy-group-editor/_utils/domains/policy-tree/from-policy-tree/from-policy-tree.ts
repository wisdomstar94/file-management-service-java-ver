import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";
import type { EditorBlock } from "../../../../_types/editor-block";
import { createKey } from "../../../create-key";
import { isHeaderOnlyAndGroup } from "./_utils/is-header-only-and-group";
import { toBlock } from "./_utils/to-block";

export function fromPolicyTree(tree: AccessPolicyNode | null): Extract<EditorBlock, { kind: "GROUP" }> {
  if (tree === null) {
    return { kind: "GROUP", key: createKey(), operator: "AND", children: [] };
  }
  if (tree.type === "GROUP" && !isHeaderOnlyAndGroup(tree)) {
    return { kind: "GROUP", key: createKey(), operator: tree.operator, children: tree.children.map(toBlock) };
  }
  return { kind: "GROUP", key: createKey(), operator: "AND", children: [toBlock(tree)] };
}
