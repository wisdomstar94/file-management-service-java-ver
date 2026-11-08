import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";
import type { EditorBlock } from "../../../../../../_types/editor-block";

export function toNode(block: EditorBlock): AccessPolicyNode {
  if (block.kind === "IP") {
    return { type: "IP", mode: block.mode, cidrs: block.cidrs.map((cidr) => cidr.trim()).filter(Boolean) };
  }
  if (block.kind === "HEADERS") {
    const headers = block.rows.map((row) => ({
      type: "HEADER" as const,
      name: row.name.trim(),
      matchType: row.matchType,
      ...(row.matchType === "EXISTS" ? {} : { value: row.value }),
    }));
    return headers.length === 1 ? headers[0] : { type: "GROUP", operator: "AND", children: headers };
  }
  return { type: "GROUP", operator: block.operator, children: block.children.map(toNode) };
}
