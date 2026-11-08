import type { SHARE_LINK_LIST_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";

export const UNAVAILABLE_MESSAGES: Record<
  Exclude<ResBody<typeof SHARE_LINK_LIST_API>["data"][number]["availability"], "ACTIVE">,
  string
> = {
  SCHEDULED: "아직 다운로드 가능 기간이 시작되지 않았습니다.",
  EXPIRED: "다운로드 가능 기간이 지났습니다.",
  EXHAUSTED: "다운로드 허용 횟수를 모두 사용했습니다.",
};
