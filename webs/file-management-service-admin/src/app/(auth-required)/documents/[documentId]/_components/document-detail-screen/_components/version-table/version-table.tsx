"use client";

import { ADMIN_SHORT_TIME_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import {
  DELETE_DOCUMENT_VERSION_API,
  DOWNLOAD_DOCUMENT_VERSION_API,
} from "@fms/api-schemas/schemas/document-version-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { readFileIcon } from "@fms/web-utils/files/read-file-icon";
import { formatDateTime } from "@fms/web-utils/formats/format-date-time";
import { formatFileSize } from "@fms/web-utils/formats/format-file-size";
import { useState } from "react";
import { BodyCell } from "@/components/commons/body-cell";
import { Card } from "@/components/commons/card";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { DataTable } from "@/components/commons/data-table";
import { HeadCell } from "@/components/commons/head-cell";
import { VersionUploadModal } from "@/components/domains/documents/version-upload-modal";
import { useAdminSession } from "@/providers/admin-session-provider";
import { usePublicEnv } from "@/providers/public-env-provider";
import type { VersionUploadMode } from "@/types/version-upload-mode";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { buildClientApiUrl } from "./_utils/build-client-api-url";

export function VersionTable(props: { document: ResBody<typeof DOCUMENT_DETAIL_API>["data"] }) {
  const { document } = props;
  const { hasPermission } = useAdminSession();
  const canCreate = hasPermission("file.detail.version.create");
  const canUpdate = hasPermission("file.detail.version.update");
  const [uploadMode, setUploadMode] = useState<VersionUploadMode | null>(null);
  const [deleting, setDeleting] = useState<ResBody<typeof DOCUMENT_DETAIL_API>["data"]["versions"][number] | null>(
    null,
  );
  const { apiPublicUrl } = usePublicEnv();
  const deleteApi = useCallApiWrapper(DELETE_DOCUMENT_VERSION_API, { successMessage: "삭제했습니다" });
  const shortTimeTokenApi = useCallApiWrapper(ADMIN_SHORT_TIME_TOKEN_API, { refreshOnSuccess: false });
  const isLastVersion = document.versions.length === 1;

  async function deleteVersion(version: ResBody<typeof DOCUMENT_DETAIL_API>["data"]["versions"][number]) {
    await deleteApi.fetchApi({ params: { documentId: document.id, versionId: version.id } });
    setDeleting(null);
  }

  /** 파일은 브라우저가 api 에서 바로 받는다. 이 버전에만 쓸 수 있는 단기 토큰을 먼저 받는다. */
  async function download(version: ResBody<typeof DOCUMENT_DETAIL_API>["data"]["versions"][number]) {
    const params = { documentId: document.id, versionId: version.id };
    const token = await shortTimeTokenApi.fetchApi({ body: { purpose: "DOWNLOAD_DOCUMENT_VERSION", ...params } });
    if (isCommonError(token)) {
      return;
    }
    window.location.assign(
      buildClientApiUrl(
        DOWNLOAD_DOCUMENT_VERSION_API,
        { params, query: { shortTimeToken: token.data.shortTimeToken } },
        { baseUrl: apiPublicUrl },
      ),
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-line-soft px-5.5 py-4">
        <div className="flex-1">
          <div className="text-[15px] font-bold">버전 관리</div>
          <div className="mt-0.5 text-[12.5px] text-faint">새 파일을 올리면 기존 버전은 이력으로 남습니다.</div>
        </div>
        <Button
          variant="primary"
          icon="ti ti-upload"
          className="h-9!"
          disabled={!canCreate}
          title={canCreate ? undefined : "새 버전 등록 권한이 없습니다"}
          onClick={() => setUploadMode({ kind: "new-version", documentId: document.id })}
        >
          새 버전 등록
        </Button>
      </div>
      <DataTable>
        <thead>
          <tr>
            <HeadCell className="px-5.5!">버전명</HeadCell>
            <HeadCell>파일명</HeadCell>
            <HeadCell>등록일</HeadCell>
            <HeadCell>수정일</HeadCell>
            <HeadCell align="right" className="px-5.5!">
              관리
            </HeadCell>
          </tr>
        </thead>
        <tbody>
          {document.versions.map((version) => {
            const fileIcon = readFileIcon(version.fileName);
            const deleteBlockedReason = !canUpdate
              ? "버전 수정 · 삭제 권한이 없습니다"
              : isLastVersion
                ? "자료에는 버전이 1개 이상 있어야 합니다"
                : undefined;
            return (
              <tr key={version.id}>
                <BodyCell className="whitespace-nowrap px-5.5!">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[13px] font-semibold">{version.versionName}</span>
                    {version.isLatest && (
                      <span className="rounded-full bg-primary-soft px-1.75 py-0.5 text-[11px] font-semibold text-primary">
                        최신
                      </span>
                    )}
                    {version.isDefault && (
                      <span className="rounded-full bg-success-soft px-1.75 py-0.5 text-[11px] font-semibold text-success">
                        기본
                      </span>
                    )}
                  </div>
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-[13.5px]!">
                  <div className="flex items-center gap-2">
                    <i className={`ti ${fileIcon.icon} text-[17px]`} style={{ color: fileIcon.color }} aria-hidden />
                    {version.fileName}
                    <span className="text-[12px] text-faint-2">{formatFileSize(version.fileSize)}</span>
                  </div>
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDateTime(version.createdAt)}</BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDateTime(version.updatedAt)}</BodyCell>
                <BodyCell align="right" className="px-5.5!">
                  <div className="inline-flex gap-1.5">
                    <Button size="sm" disabled={shortTimeTokenApi.isLoading} onClick={() => download(version)}>
                      다운로드
                    </Button>
                    <Button
                      size="sm"
                      disabled={!canUpdate}
                      title={canUpdate ? undefined : "버전 수정 · 삭제 권한이 없습니다"}
                      onClick={() => setUploadMode({ kind: "edit-version", documentId: document.id, version })}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={deleteBlockedReason !== undefined}
                      title={deleteBlockedReason}
                      onClick={() => setDeleting(version)}
                    >
                      삭제
                    </Button>
                  </div>
                </BodyCell>
              </tr>
            );
          })}
        </tbody>
      </DataTable>
      {uploadMode && <VersionUploadModal mode={uploadMode} onClose={() => setUploadMode(null)} />}
      {deleting && (
        <ConfirmDialog
          message={`${deleting.versionName} (${deleting.fileName}) 버전을 삭제합니다. 외부 링크에서 이 버전을 기본으로 지정한 경우 자료 설정을 따르도록 바뀝니다.`}
          isPending={deleteApi.isLoading}
          onConfirm={() => deleteVersion(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </Card>
  );
}
