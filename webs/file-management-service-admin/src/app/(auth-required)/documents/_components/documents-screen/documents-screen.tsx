"use client";

import type { DOCUMENT_LIST_API } from "@fms/api-schemas/schemas/document-api-schemas";
import { BULK_DELETE_DOCUMENTS_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { Button } from "@fms/web-ui/components/button";
import { VersionBadge } from "@fms/web-ui/components/version-badge";
import { readFileIcon } from "@fms/web-utils/files/read-file-icon";
import { formatDate } from "@fms/web-utils/formats/format-date";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BodyCell } from "@/components/commons/body-cell";
import { Card } from "@/components/commons/card";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { DataTable } from "@/components/commons/data-table";
import { EmptyRow } from "@/components/commons/empty-row";
import { HeadCell } from "@/components/commons/head-cell";
import { PageHeading } from "@/components/commons/page-heading";
import { Pagination } from "@/components/commons/pagination";
import { VersionUploadModal } from "@/components/domains/documents/version-upload-modal";
import { useAdminSession } from "@/providers/admin-session-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { DocumentsToolbar } from "./_components/documents-toolbar";

export function DocumentsScreen(props: { documents: ResBody<typeof DOCUMENT_LIST_API>["data"] }) {
  const { documents } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useAdminSession();
  const canCreate = hasPermission("file.list.create");
  const canDelete = hasPermission("file.list.delete");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [deleting, setDeleting] = useState<{ ids: string[]; message: string } | null>(null);
  const bulkDeleteApi = useCallApiWrapper(BULK_DELETE_DOCUMENTS_API, { successMessage: "삭제했습니다" });
  const isAllChecked = documents.items.length > 0 && documents.items.every((item) => selectedIds.has(item.id));

  function toggle(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }

  async function deleteDocuments(ids: string[]) {
    await bulkDeleteApi.fetchApi({ body: { ids } });
    setSelectedIds(new Set());
    setDeleting(null);
  }

  const buildHref = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    return `/documents?${next.toString()}`;
  };

  return (
    <>
      <PageHeading
        title="자료 관리"
        description="자료별 버전 이력과 외부 공개 링크를 관리합니다."
        actions={
          <Button
            variant="primary"
            icon="ti ti-plus"
            disabled={!canCreate}
            title={canCreate ? undefined : "새 자료 등록 권한이 없습니다"}
            onClick={() => setIsCreating(true)}
          >
            새 자료 등록
          </Button>
        }
      />
      <Card>
        <DocumentsToolbar
          selectedCount={selectedIds.size}
          canDelete={canDelete}
          onBulkDelete={() =>
            setDeleting({
              ids: [...selectedIds],
              message: `선택한 자료 ${selectedIds.size}개와 각 자료의 모든 버전, 외부 공개 링크가 삭제됩니다.`,
            })
          }
        />
        <DataTable>
          <thead>
            <tr>
              <HeadCell className="w-11 pr-0!">
                <input
                  type="checkbox"
                  aria-label="전체 선택"
                  className="size-3.75 accent-primary"
                  checked={isAllChecked}
                  onChange={() =>
                    setSelectedIds(isAllChecked ? new Set() : new Set(documents.items.map((item) => item.id)))
                  }
                />
              </HeadCell>
              <HeadCell>자료명</HeadCell>
              <HeadCell>최신버전</HeadCell>
              <HeadCell>기본버전</HeadCell>
              <HeadCell>자료 등록일</HeadCell>
              <HeadCell>최신버전 등록일</HeadCell>
              <HeadCell align="right">관리</HeadCell>
            </tr>
          </thead>
          <tbody>
            {documents.items.length === 0 && <EmptyRow colSpan={7} message="등록된 자료가 없습니다." />}
            {documents.items.map((document) => (
              <tr key={document.id} className={selectedIds.has(document.id) ? "bg-primary-row" : "bg-white"}>
                <BodyCell className="pr-0!">
                  <input
                    type="checkbox"
                    aria-label={`${document.name} 선택`}
                    className="size-3.75 accent-primary"
                    checked={selectedIds.has(document.id)}
                    onChange={() => toggle(document.id)}
                  />
                </BodyCell>
                <BodyCell className="text-[13.5px]!">
                  <Link href={`/documents/${document.id}`} className="flex items-center gap-2.5 text-ink">
                    <div className="flex size-7.5 shrink-0 items-center justify-center rounded-[7px] bg-chip text-sub">
                      <i
                        className={`ti ${readFileIcon(document.latestVersionFileName).icon} text-[16px]`}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="whitespace-nowrap font-semibold">{document.name}</div>
                      <div className="text-[12px] text-faint">버전 {document.versionCount}개</div>
                    </div>
                  </Link>
                </BodyCell>
                <BodyCell>
                  <VersionBadge>{document.latestVersion.versionName}</VersionBadge>
                </BodyCell>
                <BodyCell className="whitespace-nowrap">
                  {document.fixedDefaultVersion ? (
                    <VersionBadge tone="warn">{`${document.fixedDefaultVersion.versionName} 고정`}</VersionBadge>
                  ) : (
                    <span className="text-muted">최신 버전 따름</span>
                  )}
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDate(document.createdAt)}</BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">
                  {formatDate(document.latestVersionCreatedAt)}
                </BodyCell>
                <BodyCell align="right">
                  <div className="inline-flex gap-1.5">
                    <Link
                      href={`/documents/${document.id}`}
                      className="inline-flex h-7.5 items-center rounded-md border border-line-input bg-white px-3 text-[12.5px] font-medium text-ink-2"
                    >
                      상세
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!canDelete}
                      title={canDelete ? undefined : "삭제 권한이 없습니다"}
                      onClick={() =>
                        setDeleting({
                          ids: [document.id],
                          message: `'${document.name}' 자료와 모든 버전(${document.versionCount}개), 외부 공개 링크가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`,
                        })
                      }
                    >
                      삭제
                    </Button>
                  </div>
                </BodyCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <Pagination page={documents.page} size={documents.size} total={documents.total} buildHref={buildHref} />
      </Card>
      {isCreating && (
        <VersionUploadModal
          mode={{ kind: "new-document" }}
          onClose={() => setIsCreating(false)}
          onSaved={(saved) => router.push(`/documents/${saved.id}`)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={deleting.message}
          isPending={bulkDeleteApi.isLoading}
          onConfirm={() => deleteDocuments(deleting.ids)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
