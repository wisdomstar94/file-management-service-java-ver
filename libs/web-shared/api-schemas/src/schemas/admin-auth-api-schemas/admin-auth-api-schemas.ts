import type { ApiSuccessBody } from "@fms/types/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";
import type { AdminToken } from "./_types/admin-token/index.js";

/** 로그인하면 api 가 토큰을 httpOnly 쿠키로 심는다. */
export const ADMIN_LOGIN_API = {
  url: "/api/admin/auth/login",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ loginId: string; password: string }>(),
    query: typeOf<undefined>(),
  },
  /** 토큰은 api 가 httpOnly 쿠키로만 내려주고 본문에는 담지 않는다. */
  response: typeOf<ApiSuccessBody<{ isLoggedIn: true }>>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

/** 관리자 웹 서버가 토큰을 갱신할 때 호출한다. 서버 간 호출이라 토큰을 본문으로 주고받는다. */
export const ADMIN_REFRESH_TOKEN_API = {
  url: "/api/admin/auth/refresh",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ refreshToken: string }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AdminToken>>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

/** 쿠키의 refresh token 을 폐기하고 토큰 쿠키를 지운다. */
export const ADMIN_LOGOUT_API = {
  url: "/api/admin/auth/logout",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

export const ADMIN_ACCESS_CHECK_API = {
  url: "/api/admin/auth/access-check",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ isAllowed: true }>>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

export const ADMIN_ME_API = {
  url: "/api/admin/auth/me",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response:
    typeOf<
      ApiSuccessBody<{
        id: string;
        loginId: string;
        nickname: string;
        permissionGroupName: string;
        accessPolicyGroupName: string;
        permissionCodes: string[];
      }>
    >(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

/** 브라우저가 api 를 직접 호출하는 업로드 · 다운로드용 단기 토큰을 받는다. 토큰은 지정한 동작 · 대상에만 쓸 수 있다. */
export const ADMIN_SHORT_TIME_TOKEN_API = {
  url: "/api/admin/auth/short-time-token",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<
      | { purpose: "UPLOAD_DOCUMENT" }
      | { purpose: "UPLOAD_DOCUMENT_VERSION"; documentId: string }
      | { purpose: "DOWNLOAD_DOCUMENT_VERSION"; documentId: string; versionId: string }
    >(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ shortTimeToken: string; expiresAt: string }>>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;
