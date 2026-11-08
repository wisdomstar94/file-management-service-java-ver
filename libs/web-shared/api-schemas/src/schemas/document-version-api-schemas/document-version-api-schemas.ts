import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";
import type { ResBody } from "../../types/api-schema-utils/index.js";
import type { DOCUMENT_DETAIL_API } from "../document-api-schemas/index.js";

/**
 * 브라우저가 api 를 직접 호출한다. `authorization` 에 `UPLOAD_DOCUMENT_VERSION` 용 short-time token 을 담는다.
 * 본문은 `versionName` 텍스트 필드 + `file` 을 담은 `FormData`
 */
export const CREATE_DOCUMENT_VERSION_API = {
  url: "/api/admin/documents/:documentId/versions",
  method: "POST",
  request: {
    params: typeOf<{ documentId: string }>(),
    headers: typeOf<{ authorization: string }>(),
    body: typeOf<FormData>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ResBody<typeof DOCUMENT_DETAIL_API>>(),
  tags: ["document-versions"],
} as const satisfies ApiSchema;

export const UPDATE_DOCUMENT_VERSION_API = {
  url: "/api/admin/documents/:documentId/versions/:versionId",
  method: "PATCH",
  request: {
    params: typeOf<{ documentId: string; versionId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ versionName: string }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ResBody<typeof DOCUMENT_DETAIL_API>>(),
  tags: ["document-versions"],
} as const satisfies ApiSchema;

export const DELETE_DOCUMENT_VERSION_API = {
  url: "/api/admin/documents/:documentId/versions/:versionId",
  method: "DELETE",
  request: {
    params: typeOf<{ documentId: string; versionId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ResBody<typeof DOCUMENT_DETAIL_API>>(),
  tags: ["document-versions"],
} as const satisfies ApiSchema;

/** 브라우저가 링크로 직접 연다. `shortTimeToken` 에 `DOWNLOAD_DOCUMENT_VERSION` 용 short-time token 을 담는다. */
export const DOWNLOAD_DOCUMENT_VERSION_API = {
  url: "/api/admin/documents/:documentId/versions/:versionId/download",
  method: "GET",
  request: {
    params: typeOf<{ documentId: string; versionId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<{ shortTimeToken: string }>(),
  },
  response: typeOf<Response>(),
  responseType: "stream",
  tags: ["document-versions"],
} as const satisfies ApiSchema;
