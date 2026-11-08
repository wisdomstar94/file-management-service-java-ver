import type { ApiSuccessBody } from "@fms/types/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";
import type { CreateShareLinkBody } from "./_types/create-share-link-body/index.js";
import type { ShareLink } from "./_types/share-link/index.js";

export const SHARE_LINK_LIST_API = {
  url: "/api/admin/documents/:documentId/share-links",
  method: "GET",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<ShareLink[]>>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;

/** 링크 생성 · 수정 모달의 접근 정책 그룹 선택지 */
export const SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API = {
  url: "/api/admin/documents/:documentId/share-links/assignable-access-policy-groups",
  method: "GET",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ id: string; name: string }[]>>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;

export const CREATE_SHARE_LINK_API = {
  url: "/api/admin/documents/:documentId/share-links",
  method: "POST",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<CreateShareLinkBody>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<ShareLink>>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;

export const UPDATE_SHARE_LINK_API = {
  url: "/api/admin/documents/:documentId/share-links/:linkId",
  method: "PATCH",
  request: {
    params: typeOf<{ documentId: string; linkId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<Partial<CreateShareLinkBody>>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<ShareLink>>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;

export const DELETE_SHARE_LINK_API = {
  url: "/api/admin/documents/:documentId/share-links/:linkId",
  method: "DELETE",
  request: {
    params: typeOf<{ documentId: string; linkId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["share-links"],
} as const satisfies ApiSchema;
