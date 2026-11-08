import {
  PERMISSION_GROUP_ASSIGNABLE_PERMISSIONS_API,
  PERMISSION_GROUP_LIST_API,
} from "@fms/api-schemas/schemas/permission-group-api-schemas";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";
import { PermissionGroupsScreen } from "./_components/permission-groups-screen";

export default async function PermissionGroupsPage() {
  await requirePagePermission("perm.group.access");
  const [groups, permissions] = await Promise.all([
    fetchServerWrapper(PERMISSION_GROUP_LIST_API, {}),
    fetchServerWrapper(PERMISSION_GROUP_ASSIGNABLE_PERMISSIONS_API, {}),
  ]);
  return <PermissionGroupsScreen groups={groups.data} permissionTotal={permissions.data.length} />;
}
