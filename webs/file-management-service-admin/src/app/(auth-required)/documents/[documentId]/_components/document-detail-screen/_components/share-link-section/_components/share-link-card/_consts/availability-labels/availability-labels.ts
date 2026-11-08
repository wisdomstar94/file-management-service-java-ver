import type { SHARE_LINK_LIST_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";

export const AVAILABILITY_LABELS: Record<
  ResBody<typeof SHARE_LINK_LIST_API>["data"][number]["availability"],
  { label: string; className: string }
> = {
  ACTIVE: { label: "활성", className: "bg-success-soft text-success" },
  SCHEDULED: { label: "시작 전", className: "bg-warn-soft text-warn" },
  EXPIRED: { label: "만료", className: "bg-chip text-muted" },
  EXHAUSTED: { label: "소진", className: "bg-chip text-muted" },
};
