export const OPERATORS = [
  { operator: "AND" as const, title: "모두 통과", description: "모든 제한을 통과해야 접근을 허용합니다." },
  { operator: "OR" as const, title: "하나 이상 통과", description: "제한 중 하나만 통과해도 접근을 허용합니다." },
];
