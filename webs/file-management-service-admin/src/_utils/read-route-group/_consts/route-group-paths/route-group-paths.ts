/** 로그인하지 않아야만 들어갈 수 있는 경로 — `(guest-only)` 라우트 그룹 */
export const GUEST_ONLY_PATHS = ["/login"];

/** 로그인 여부와 관계없이 들어갈 수 있는 경로 — `(public)` 라우트 그룹 */
export const PUBLIC_PATHS = ["/access-denied", "/forbidden"];
