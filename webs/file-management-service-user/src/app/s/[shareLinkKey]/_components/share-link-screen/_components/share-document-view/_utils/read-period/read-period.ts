import type { PUBLIC_SHARE_LINK_DETAIL_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { formatDate } from "@fms/web-utils/formats/format-date";

export function readPeriod(detail: ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API>["data"]) {
  if (!detail.availableFrom && !detail.availableUntil) {
    return null;
  }
  const from = detail.availableFrom ? formatDate(detail.availableFrom) : "제한 없음";
  const until = detail.availableUntil ? formatDate(detail.availableUntil) : "제한 없음";
  return `다운로드 가능 기간 ${from} ~ ${until}`;
}
