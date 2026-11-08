import type { ApiSuccessBody } from "@fms/types/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";
import type { ResBody } from "../../types/api-schema-utils/index.js";
import type { SHARE_LINK_LIST_API } from "../share-link-api-schemas/index.js";
import type { PublicShareLinkVersion } from "./_types/public-share-link-version/index.js";

export const PUBLIC_SHARE_LINK_GATE_API = {
  url: "/api/public/share-links/:shareLinkKey",
  method: "GET",
  request: {
    params: typeOf<{ shareLinkKey: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ state: "PASSWORD_REQUIRED" | "OPEN" }>>(),
  tags: ["public-share-links"],
} as const satisfies ApiSchema;

export const PUBLIC_SHARE_LINK_UNLOCK_API = {
  url: "/api/public/share-links/:shareLinkKey/unlock",
  method: "POST",
  request: {
    params: typeOf<{ shareLinkKey: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ password: string }>(),
    query: typeOf<undefined>(),
  },
  /** 잠금 해제 토큰은 api 가 그 링크 경로 한정 httpOnly 쿠키로 심고 본문에는 담지 않는다. */
  response: typeOf<ApiSuccessBody<{ expiresAt: string }>>(),
  tags: ["public-share-links"],
} as const satisfies ApiSchema;

export const PUBLIC_SHARE_LINK_DETAIL_API = {
  url: "/api/public/share-links/:shareLinkKey/detail",
  method: "GET",
  request: {
    params: typeOf<{ shareLinkKey: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response:
    typeOf<
      ApiSuccessBody<{
        documentName: string;
        defaultVersion: PublicShareLinkVersion;
        /** 「기본 버전 외 다른 버전 표시」 가 꺼져 있으면 `null` */
        otherVersions: PublicShareLinkVersion[] | null;
        isAllowOtherVersionDownload: boolean;
        /** 「다운로드 현황 표시」 가 꺼져 있으면 `null` */
        downloadStatus: { downloadCount: number; maxDownloadCount: number | null } | null;
        availableFrom: string | null;
        availableUntil: string | null;
        availability: ResBody<typeof SHARE_LINK_LIST_API>["data"][number]["availability"];
      }>
    >(),
  tags: ["public-share-links"],
} as const satisfies ApiSchema;

export const PUBLIC_SHARE_LINK_DOWNLOAD_API = {
  url: "/api/public/share-links/:shareLinkKey/versions/:versionId/download",
  method: "GET",
  request: {
    params: typeOf<{ shareLinkKey: string; versionId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  /** 브라우저가 바로 이동하는 주소. 받을 수 없으면 공개 링크 화면으로 303 리다이렉트한다. */
  response: typeOf<Response>(),
  responseType: "stream",
  tags: ["public-share-links"],
} as const satisfies ApiSchema;
