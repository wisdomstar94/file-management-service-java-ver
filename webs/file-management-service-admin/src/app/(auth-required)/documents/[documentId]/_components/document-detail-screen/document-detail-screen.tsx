"use client";

import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import { DELETE_DOCUMENT_API, UPDATE_DOCUMENT_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type {
  SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API,
  SHARE_LINK_LIST_API,
} from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { PageHeading } from "@/components/commons/page-heading";
import { useAdminSession } from "@/providers/admin-session-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { DocumentInfoCards } from "./_components/document-info-cards";
import { ShareLinkSection } from "./_components/share-link-section";
import { VersionTable } from "./_components/version-table";

export function DocumentDetailScreen(props: {
  document: ResBody<typeof DOCUMENT_DETAIL_API>["data"];
  links: ResBody<typeof SHARE_LINK_LIST_API>["data"][number][];
  policyOptions: ResBody<typeof SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API>["data"][number][];
  userWebOrigin: string;
}) {
  const { document, links, policyOptions, userWebOrigin } = props;
  const router = useRouter();
  const { hasPermission } = useAdminSession();
  const canUpdate = hasPermission("file.detail.update");
  const canDelete = hasPermission("file.list.delete");
  const [name, setName] = useState(document.name);
  const [defaultVersionId, setDefaultVersionId] = useState(document.defaultVersionId);
  const [isDeleting, setIsDeleting] = useState(false);
  const updateApi = useCallApiWrapper(UPDATE_DOCUMENT_API, { successMessage: "변경사항을 저장했습니다" });
  // 지운 자료 화면을 다시 불러오면 404 가 나므로 목록으로 이동만 한다.
  const deleteApi = useCallApiWrapper(DELETE_DOCUMENT_API, { successMessage: "삭제했습니다", refreshOnSuccess: false });
  const isPending = updateApi.isLoading || deleteApi.isLoading;

  async function save() {
    await updateApi.fetchApi({ params: { documentId: document.id }, body: { name, defaultVersionId } });
  }

  async function deleteDocument() {
    const deleted = await deleteApi.fetchApi({ params: { documentId: document.id } });
    setIsDeleting(false);
    if (!isCommonError(deleted)) {
      router.push("/documents");
    }
  }

  return (
    <>
      <PageHeading
        title={document.name}
        back={{ href: "/documents", label: "자료 목록" }}
        actions={
          <>
            <Button
              variant="danger"
              disabled={!canDelete}
              title={canDelete ? undefined : "삭제 권한이 없습니다"}
              onClick={() => setIsDeleting(true)}
            >
              자료 삭제
            </Button>
            <Button
              variant="primary"
              disabled={!canUpdate || isPending}
              title={canUpdate ? undefined : "자료 정보 수정 권한이 없습니다"}
              onClick={save}
            >
              변경사항 저장
            </Button>
          </>
        }
      />
      <DocumentInfoCards
        document={document}
        name={name}
        defaultVersionId={defaultVersionId}
        isEditable={canUpdate}
        onNameChange={setName}
        onDefaultVersionChange={setDefaultVersionId}
      />
      <VersionTable document={document} />
      <ShareLinkSection document={document} links={links} policyOptions={policyOptions} userWebOrigin={userWebOrigin} />
      {isDeleting && (
        <ConfirmDialog
          message={`'${document.name}' 자료와 모든 버전(${document.versions.length}개), 외부 공개 링크(${links.length}개)가 삭제됩니다.`}
          isPending={isPending}
          onConfirm={deleteDocument}
          onClose={() => setIsDeleting(false)}
        />
      )}
    </>
  );
}
