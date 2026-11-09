// 자동 생성 파일입니다. 직접 고치지 말고 libs/contracts/shared-consts 의 JSON 을 고친 뒤 `yarn contracts:generate` 를 실행하세요.

/**
 * 코드가 실제로 검사하는 권한 코드 목록입니다.
 *
 * 여기에 있는 코드만 api 의 `@RequirePermission` · 관리자 웹의 `hasPermission` · `requirePagePermission` · 메뉴 노출 판정에 쓸 수 있고, DB 의 권한은 시드가 이 목록으로만 추가합니다.
 * `seed` 는 DB 에 처음 넣을 분류·권한명입니다.
 */
export const PERMISSION_CODE_REGISTRY = {
  "file.list.access": { seed: { category: "자료 목록 페이지", name: "접근 권한" } },
  "file.list.create": { seed: { category: "자료 목록 페이지", name: "새 자료 등록 권한" } },
  "file.list.delete": { seed: { category: "자료 목록 페이지", name: "자료 삭제 권한" } },
  "file.detail.access": { seed: { category: "자료 상세 페이지", name: "접근 권한" } },
  "file.detail.update": { seed: { category: "자료 상세 페이지", name: "자료 정보 수정 권한" } },
  "file.detail.version.create": { seed: { category: "자료 상세 페이지", name: "새 버전 등록 권한" } },
  "file.detail.version.update": { seed: { category: "자료 상세 페이지", name: "버전 수정 · 삭제 권한" } },
  "file.detail.link.create": { seed: { category: "자료 상세 페이지", name: "외부 공개 링크 생성 권한" } },
  "file.detail.link.update": { seed: { category: "자료 상세 페이지", name: "외부 공개 링크 수정 권한" } },
  "file.detail.link.delete": { seed: { category: "자료 상세 페이지", name: "외부 공개 링크 삭제 권한" } },
  "account.access": { seed: { category: "관리자 계정 관리", name: "접근 권한" } },
  "account.create": { seed: { category: "관리자 계정 관리", name: "생성 권한" } },
  "account.update": { seed: { category: "관리자 계정 관리", name: "수정 권한" } },
  "account.delete": { seed: { category: "관리자 계정 관리", name: "삭제 권한" } },
  "policy.access": { seed: { category: "접근 정책 그룹 관리", name: "접근 권한" } },
  "policy.create": { seed: { category: "접근 정책 그룹 관리", name: "생성 권한" } },
  "policy.update": { seed: { category: "접근 정책 그룹 관리", name: "수정 권한" } },
  "policy.delete": { seed: { category: "접근 정책 그룹 관리", name: "삭제 권한" } },
  "perm.group.access": { seed: { category: "권한 그룹 관리", name: "접근 권한" } },
  "perm.group.create": { seed: { category: "권한 그룹 관리", name: "생성 권한" } },
  "perm.group.update": { seed: { category: "권한 그룹 관리", name: "수정 권한" } },
  "perm.group.delete": { seed: { category: "권한 그룹 관리", name: "삭제 권한" } },
  "perm.access": { seed: { category: "권한 관리", name: "접근 권한" } },
  "perm.update": { seed: { category: "권한 관리", name: "수정 권한" } },
} as const satisfies Record<string, { seed: { category: string; name: string } }>;
