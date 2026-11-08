import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";

/**
 * 접근 정책 트리를 `(IP 제한 && 헤더 제한(X-Token)) || IP 제한` 처럼 사람이 읽는 식으로 바꿉니다.
 * 트리가 없으면 `제한 없음` 입니다.
 */
export function describeAccessPolicyNode(node: AccessPolicyNode | null, isRoot = true): string {
  if (node === null) {
    return "제한 없음";
  }
  if (node.type === "IP") {
    return "IP 제한";
  }
  if (node.type === "HEADER") {
    return `헤더 제한(${node.name})`;
  }

  const joined = node.children
    .map((child) => describeAccessPolicyNode(child, false))
    .join(node.operator === "AND" ? " && " : " || ");
  const isNeedParentheses = !isRoot && node.children.length > 1;
  return isNeedParentheses ? `(${joined})` : joined;
}
