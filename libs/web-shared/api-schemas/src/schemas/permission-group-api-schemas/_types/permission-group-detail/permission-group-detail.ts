import type { ResBody } from "../../../../types/api-schema-utils/index.js";
import type { PERMISSION_DETAIL_API } from "../../../permission-api-schemas/index.js";
import type { PermissionGroupSummary } from "../permission-group-summary/index.js";

export type PermissionGroupDetail = PermissionGroupSummary & {
  permissions: ResBody<typeof PERMISSION_DETAIL_API>["data"][];
};
