import { PERMISSION_GROUP_ASSIGNABLE_PERMISSIONS_API } from "@fms/api-schemas/schemas/permission-group-api-schemas";
import { PermissionGroupEditor } from "@/components/domains/permission-groups/permission-group-editor";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

export default async function NewPermissionGroupPage() {
  await requirePagePermission("perm.group.create");
  const permissions = await fetchServerWrapper(PERMISSION_GROUP_ASSIGNABLE_PERMISSIONS_API, {});
  return <PermissionGroupEditor group={null} permissions={permissions.data} />;
}
