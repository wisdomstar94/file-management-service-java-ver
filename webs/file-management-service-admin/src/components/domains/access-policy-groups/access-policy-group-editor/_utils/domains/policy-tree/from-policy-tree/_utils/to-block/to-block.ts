import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";
import type { EditorBlock } from "../../../../../../_types/editor-block";
import { createKey } from "../../../../../create-key";
import { isHeaderOnlyAndGroup } from "../is-header-only-and-group";
import { toHeaderRow } from "../to-header-row";

export function toBlock(node: AccessPolicyNode): EditorBlock {
  if (node.type === "IP") {
    return { kind: "IP", key: createKey(), mode: node.mode, cidrs: [...node.cidrs] };
  }
  if (node.type === "HEADER") {
    return { kind: "HEADERS", key: createKey(), rows: [toHeaderRow(node)] };
  }
  if (isHeaderOnlyAndGroup(node)) {
    return { kind: "HEADERS", key: createKey(), rows: node.children.map((child) => toHeaderRow(child as never)) };
  }
  return { kind: "GROUP", key: createKey(), operator: node.operator, children: node.children.map(toBlock) };
}
