import { ACCESS_POLICY_GROUP_LIST_API } from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";
import { AccessPolicyGroupsScreen } from "./_components/access-policy-groups-screen";

export default async function AccessPolicyGroupsPage() {
  await requirePagePermission("policy.access");
  const groups = await fetchServerWrapper(ACCESS_POLICY_GROUP_LIST_API, {});
  return <AccessPolicyGroupsScreen groups={groups.data} />;
}
