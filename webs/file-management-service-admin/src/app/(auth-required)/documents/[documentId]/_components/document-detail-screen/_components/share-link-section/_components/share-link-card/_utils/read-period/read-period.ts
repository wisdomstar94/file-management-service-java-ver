import type { SHARE_LINK_LIST_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { formatDate } from "@fms/web-utils/formats/format-date";

export function readPeriod(link: ResBody<typeof SHARE_LINK_LIST_API>["data"][number]) {
  if (!link.availableFrom && !link.availableUntil) {
    return "제한 없음";
  }
  return `${link.availableFrom ? formatDate(link.availableFrom) : "제한 없음"} ~ ${link.availableUntil ? formatDate(link.availableUntil) : "제한 없음"}`;
}
