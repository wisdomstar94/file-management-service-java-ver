import { PERMISSION_LIST_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";
import { PermissionsScreen } from "./_components/permissions-screen";

export default async function PermissionsPage() {
  await requirePagePermission("perm.access");
  const permissions = await fetchServerWrapper(PERMISSION_LIST_API, {});
  return <PermissionsScreen permissions={permissions.data} />;
}
