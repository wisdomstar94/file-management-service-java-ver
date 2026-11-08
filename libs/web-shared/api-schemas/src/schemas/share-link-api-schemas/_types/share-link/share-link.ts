import type { ResBody } from "../../../../types/api-schema-utils/index.js";
import type { DOCUMENT_LIST_API } from "../../../document-api-schemas/index.js";

export type ShareLink = {
  id: string;
  shareLinkKey: string;
  accessPolicyGroup: { id: string; name: string } | null;
  hasPassword: boolean;
  downloadCount: number;
  maxDownloadCount: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  defaultVersionMode: "FOLLOW_DOCUMENT" | "FIXED";
  fixedVersion: ResBody<typeof DOCUMENT_LIST_API>["data"]["items"][number]["latestVersion"] | null;
  /** 이 링크에서 실제로 기본으로 보여질 버전 */
  effectiveDefaultVersion: ResBody<typeof DOCUMENT_LIST_API>["data"]["items"][number]["latestVersion"];
  isShowOtherVersions: boolean;
  isAllowOtherVersionDownload: boolean;
  isShowDownloadStatus: boolean;
  /** `SCHEDULED` 시작 전 · `EXPIRED` 기간 종료 · `EXHAUSTED` 허용 수 소진 */
  availability: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "EXHAUSTED";
  createdAt: string;
  updatedAt: string;
};
