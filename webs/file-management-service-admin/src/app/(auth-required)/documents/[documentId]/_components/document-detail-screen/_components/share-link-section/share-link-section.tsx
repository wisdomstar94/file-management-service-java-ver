"use client";

import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type {
  SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API,
  SHARE_LINK_LIST_API,
} from "@fms/api-schemas/schemas/share-link-api-schemas";
import { DELETE_SHARE_LINK_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { Button } from "@fms/web-ui/components/button";
import { useState } from "react";
import { Card } from "@/components/commons/card";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { useAdminSession } from "@/providers/admin-session-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { ShareLinkCard } from "./_components/share-link-card";
import { ShareLinkFormModal } from "./_components/share-link-form-modal";

export function ShareLinkSection(props: {
  document: ResBody<typeof DOCUMENT_DETAIL_API>["data"];
  links: ResBody<typeof SHARE_LINK_LIST_API>["data"][number][];
  policyOptions: ResBody<typeof SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API>["data"][number][];
  userWebOrigin: string;
}) {
  const { document, links, policyOptions, userWebOrigin } = props;
  const { hasPermission } = useAdminSession();
  const canCreate = hasPermission("file.detail.link.create");
  const canUpdate = hasPermission("file.detail.link.update");
  const canDelete = hasPermission("file.detail.link.delete");
  const [editing, setEditing] = useState<ResBody<typeof SHARE_LINK_LIST_API>["data"][number] | "new" | null>(null);
  const [deleting, setDeleting] = useState<ResBody<typeof SHARE_LINK_LIST_API>["data"][number] | null>(null);
  const deleteApi = useCallApiWrapper(DELETE_SHARE_LINK_API, { successMessage: "삭제했습니다" });

  async function deleteLink(link: ResBody<typeof SHARE_LINK_LIST_API>["data"][number]) {
    await deleteApi.fetchApi({ params: { documentId: document.id, linkId: link.id } });
    setDeleting(null);
  }

  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-line-soft px-5.5 py-4">
        <div className="flex-1">
          <div className="text-[15px] font-bold">
            외부 공개 링크 <span className="font-medium text-faint">{links.length}</span>
          </div>
          <div className="mt-0.5 text-[12.5px] text-faint">
            링크마다 접근 정책, 비밀번호, 기간, 노출 범위를 따로 설정합니다.
          </div>
        </div>
        <Button
          variant="primary"
          icon="ti ti-link-plus"
          className="h-9!"
          disabled={!canCreate}
          title={canCreate ? undefined : "외부 공개 링크 생성 권한이 없습니다"}
          onClick={() => setEditing("new")}
        >
          링크 생성
        </Button>
      </div>
      {links.length === 0 && (
        <div className="px-5.5 py-10 text-center text-[13.5px] text-faint">생성된 링크가 없습니다.</div>
      )}
      {links.map((link) => (
        <ShareLinkCard
          key={link.id}
          link={link}
          url={`${userWebOrigin}/s/${link.shareLinkKey}`}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={() => setEditing(link)}
          onDelete={() => setDeleting(link)}
        />
      ))}
      {editing && (
        <ShareLinkFormModal
          document={document}
          link={editing === "new" ? null : editing}
          policyOptions={policyOptions}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message="이 링크를 삭제하면 링크를 받은 사용자가 더 이상 접근할 수 없습니다."
          isPending={deleteApi.isLoading}
          onConfirm={() => deleteLink(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </Card>
  );
}
