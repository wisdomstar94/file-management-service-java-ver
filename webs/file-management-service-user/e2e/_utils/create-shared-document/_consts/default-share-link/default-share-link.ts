import type { CREATE_SHARE_LINK_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";

export const DEFAULT_LINK: ReqBody<typeof CREATE_SHARE_LINK_API> = {
  accessPolicyGroupId: null,
  password: null,
  maxDownloadCount: null,
  availableFrom: null,
  availableUntil: null,
  defaultVersionMode: "FOLLOW_DOCUMENT",
  fixedVersionId: null,
  isShowOtherVersions: false,
  isAllowOtherVersionDownload: false,
  isShowDownloadStatus: true,
};
