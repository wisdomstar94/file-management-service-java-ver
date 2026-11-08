"use client";

import type { PERMISSION_GROUP_LIST_API } from "@fms/api-schemas/schemas/permission-group-api-schemas";
import { DELETE_PERMISSION_GROUP_API } from "@fms/api-schemas/schemas/permission-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { Button } from "@fms/web-ui/components/button";
import { ProgressBar } from "@fms/web-ui/components/progress-bar";
import { formatDate } from "@fms/web-utils/formats/format-date";
import Link from "next/link";
import { useState } from "react";
import { BodyCell } from "@/components/commons/body-cell";
import { Card } from "@/components/commons/card";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { DataTable } from "@/components/commons/data-table";
import { EmptyRow } from "@/components/commons/empty-row";
import { HeadCell } from "@/components/commons/head-cell";
import { IdentifierText } from "@/components/commons/identifier-text";
import { PageHeading } from "@/components/commons/page-heading";
import { useAdminSession } from "@/providers/admin-session-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { NO_CREATE_PERMISSION, NO_DELETE_PERMISSION } from "./_consts/permission-denied-messages";

export function PermissionGroupsScreen(props: {
  groups: ResBody<typeof PERMISSION_GROUP_LIST_API>["data"][number][];
  permissionTotal: number;
}) {
  const { groups, permissionTotal } = props;
  const { hasPermission } = useAdminSession();
  const canCreate = hasPermission("perm.group.create");
  const canDelete = hasPermission("perm.group.delete");
  const [deleting, setDeleting] = useState<ResBody<typeof PERMISSION_GROUP_LIST_API>["data"][number] | null>(null);
  const deleteApi = useCallApiWrapper(DELETE_PERMISSION_GROUP_API, { successMessage: "삭제했습니다" });

  async function deleteGroup(group: ResBody<typeof PERMISSION_GROUP_LIST_API>["data"][number]) {
    await deleteApi.fetchApi({ params: { id: group.id } });
    setDeleting(null);
  }

  return (
    <>
      <PageHeading
        title="권한 그룹 관리"
        description="관리자 계정은 할당된 권한 그룹에 체크된 메뉴와 기능만 이용할 수 있습니다."
        actions={
          canCreate ? (
            <Link
              href="/permissions/groups/new"
              className="inline-flex h-9.5 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13.5px] font-semibold text-white"
            >
              <i className="ti ti-plus text-[16px]" aria-hidden />새 권한 그룹 생성
            </Link>
          ) : (
            <Button variant="primary" disabled title={NO_CREATE_PERMISSION}>
              새 권한 그룹 생성
            </Button>
          )
        }
      />
      <Card>
        <DataTable>
          <thead>
            <tr>
              <HeadCell>권한 그룹 식별키</HeadCell>
              <HeadCell>권한 그룹명</HeadCell>
              <HeadCell>등록된 권한</HeadCell>
              <HeadCell>생성일</HeadCell>
              <HeadCell>수정일</HeadCell>
              <HeadCell align="right">관리</HeadCell>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && <EmptyRow colSpan={6} message="등록된 권한 그룹이 없습니다." />}
            {groups.map((group) => (
              <tr key={group.id}>
                <BodyCell>
                  <IdentifierText value={group.id} />
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-[13.5px]! font-semibold">{group.name}</BodyCell>
                <BodyCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-20">
                      <ProgressBar value={group.permissionCount} max={permissionTotal} />
                    </div>
                    <span className="font-semibold">{group.permissionCount}개</span>
                  </div>
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDate(group.createdAt)}</BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDate(group.updatedAt)}</BodyCell>
                <BodyCell align="right">
                  <div className="inline-flex gap-1.5">
                    <Link
                      href={`/permissions/groups/${group.id}`}
                      className="inline-flex h-7.5 items-center rounded-md border border-line-input bg-white px-3 text-[12.5px] font-medium text-ink-2"
                    >
                      상세
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!canDelete}
                      title={canDelete ? undefined : NO_DELETE_PERMISSION}
                      onClick={() => setDeleting(group)}
                    >
                      삭제
                    </Button>
                  </div>
                </BodyCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Card>
      {deleting && (
        <ConfirmDialog
          message={`'${deleting.name}' 권한 그룹을 삭제합니다. 이 그룹이 할당된 계정이 있으면 삭제할 수 없습니다.`}
          isPending={deleteApi.isLoading}
          onConfirm={() => deleteGroup(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
