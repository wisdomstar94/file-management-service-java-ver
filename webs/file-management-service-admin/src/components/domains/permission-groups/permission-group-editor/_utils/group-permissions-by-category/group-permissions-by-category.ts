import type { PERMISSION_DETAIL_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";

export function groupPermissionsByCategory(permissions: ResBody<typeof PERMISSION_DETAIL_API>["data"][]) {
  const sections = new Map<string, ResBody<typeof PERMISSION_DETAIL_API>["data"][]>();
  for (const permission of permissions) {
    sections.set(permission.category, [...(sections.get(permission.category) ?? []), permission]);
  }
  return [...sections.entries()].map(([category, items]) => ({ category, items }));
}
