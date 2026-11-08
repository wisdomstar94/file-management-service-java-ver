import { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import {
  SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API,
  SHARE_LINK_LIST_API,
} from "@fms/api-schemas/schemas/share-link-api-schemas";
import { webEnv } from "@/consts/web-env";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";
import { DocumentDetailScreen } from "./_components/document-detail-screen";

export default async function DocumentDetailPage(props: PageProps<"/documents/[documentId]">) {
  const me = await requirePagePermission("file.detail.access");
  const { documentId } = await props.params;
  const params = { documentId };
  const canEditLinks = (() => {
    if (me.permissionCodes.includes("file.detail.link.create")) {
      return true;
    }
    if (me.permissionCodes.includes("file.detail.link.update")) {
      return true;
    }
    return false;
  })();
  const [document, links, policyOptions] = await Promise.all([
    fetchServerWrapper(DOCUMENT_DETAIL_API, { params }),
    fetchServerWrapper(SHARE_LINK_LIST_API, { params }),
    canEditLinks
      ? fetchServerWrapper(SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API, { params })
      : Promise.resolve({ data: [] }),
  ]);
  return (
    <DocumentDetailScreen
      document={document.data}
      links={links.data}
      policyOptions={policyOptions.data}
      userWebOrigin={webEnv.userWebOrigin}
    />
  );
}
