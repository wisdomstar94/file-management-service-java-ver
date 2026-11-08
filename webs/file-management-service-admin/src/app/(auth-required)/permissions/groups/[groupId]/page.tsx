import {
  PERMISSION_GROUP_ASSIGNABLE_PERMISSIONS_API,
  PERMISSION_GROUP_DETAIL_API,
} from "@fms/api-schemas/schemas/permission-group-api-schemas";
import { PermissionGroupEditor } from "@/components/domains/permission-groups/permission-group-editor";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

export default async function PermissionGroupDetailPage(props: PageProps<"/permissions/groups/[groupId]">) {
  await requirePagePermission("perm.group.access");
  const { groupId } = await props.params;
  const [group, permissions] = await Promise.all([
    fetchServerWrapper(PERMISSION_GROUP_DETAIL_API, { params: { id: groupId } }),
    fetchServerWrapper(PERMISSION_GROUP_ASSIGNABLE_PERMISSIONS_API, {}),
  ]);
  return <PermissionGroupEditor group={group.data} permissions={permissions.data} />;
}
