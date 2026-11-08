import { DOCUMENT_LIST_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ReqQuery } from "@fms/api-schemas/types/api-schema-utils";
import { readPageParam } from "@/utils/commons/read-page-param";
import { requirePagePermission } from "@/utils/domains/permission/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";
import { DocumentsScreen } from "./_components/documents-screen";

export default async function DocumentsPage(props: PageProps<"/documents">) {
  await requirePagePermission("file.list.access");
  const searchParams = await props.searchParams;
  const query: ReqQuery<typeof DOCUMENT_LIST_API> = { page: readPageParam(searchParams.page), size: 20 };
  if (typeof searchParams.keyword === "string" && searchParams.keyword) {
    query.keyword = searchParams.keyword;
  }
  if (searchParams.days === "7" || searchParams.days === "30") {
    query.createdWithinDays = Number(searchParams.days);
  }
  const documents = await fetchServerWrapper(DOCUMENT_LIST_API, { query });
  return <DocumentsScreen documents={documents.data} />;
}
