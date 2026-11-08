import { ACCESS_POLICY_GROUP_DETAIL_API } from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import { AccessPolicyGroupEditor } from "@/components/domains/access-policy-groups/access-policy-group-editor";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

export default async function AccessPolicyGroupDetailPage(props: PageProps<"/access-policy-groups/[groupId]">) {
  await requirePagePermission("policy.access");
  const { groupId } = await props.params;
  const group = await fetchServerWrapper(ACCESS_POLICY_GROUP_DETAIL_API, { params: { id: groupId } });
  return <AccessPolicyGroupEditor group={group.data} />;
}
