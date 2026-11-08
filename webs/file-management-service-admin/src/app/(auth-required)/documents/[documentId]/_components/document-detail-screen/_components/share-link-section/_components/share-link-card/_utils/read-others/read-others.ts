import type { SHARE_LINK_LIST_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";

export function readOthers(link: ResBody<typeof SHARE_LINK_LIST_API>["data"][number]) {
  if (!link.isShowOtherVersions) {
    return "숨김";
  }
  return link.isAllowOtherVersionDownload ? "표시 · 다운로드 허용" : "표시 · 다운로드 불가";
}
