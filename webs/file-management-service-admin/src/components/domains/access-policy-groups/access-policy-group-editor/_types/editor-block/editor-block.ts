import type { AccessPolicyHeaderMatchType, AccessPolicyIpMode } from "@fms/types/access-policies/access-policy-node";

export type HeaderRow = { key: string; name: string; matchType: AccessPolicyHeaderMatchType; value: string };

/**
 * 편집 화면의 블록. 시안의 「특정 헤더 제한」 블록은 여러 헤더 조건을 모두 통과해야 하므로
 * 헤더만 담긴 AND 그룹(또는 헤더 1개)을 `HEADERS` 블록 하나로 보여준다. 의미가 같으므로 저장하면 원래 구조로 돌아간다.
 */
export type EditorBlock =
  | { kind: "GROUP"; key: string; operator: "AND" | "OR"; children: EditorBlock[] }
  | { kind: "IP"; key: string; mode: AccessPolicyIpMode; cidrs: string[] }
  | { kind: "HEADERS"; key: string; rows: HeaderRow[] };
