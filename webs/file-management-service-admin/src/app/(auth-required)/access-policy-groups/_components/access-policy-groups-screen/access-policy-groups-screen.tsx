"use client";

import type { ACCESS_POLICY_GROUP_LIST_API } from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import { DELETE_ACCESS_POLICY_GROUP_API } from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { Button } from "@fms/web-ui/components/button";
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

export function AccessPolicyGroupsScreen(props: {
  groups: ResBody<typeof ACCESS_POLICY_GROUP_LIST_API>["data"][number][];
}) {
  const { hasPermission } = useAdminSession();
  const canCreate = hasPermission("policy.create");
  const canDelete = hasPermission("policy.delete");
  const [deleting, setDeleting] = useState<ResBody<typeof ACCESS_POLICY_GROUP_LIST_API>["data"][number] | null>(null);
  const deleteApi = useCallApiWrapper(DELETE_ACCESS_POLICY_GROUP_API, { successMessage: "삭제했습니다" });

  async function deleteGroup(group: ResBody<typeof ACCESS_POLICY_GROUP_LIST_API>["data"][number]) {
    await deleteApi.fetchApi({ params: { id: group.id } });
    setDeleting(null);
  }

  return (
    <>
      <PageHeading
        title="접근 정책 그룹 관리"
        description="로그인과 페이지 접근 시 적용되는 IP · 헤더 제한 묶음입니다."
        actions={
          canCreate ? (
            <Link
              href="/access-policy-groups/new"
              className="inline-flex h-9.5 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13.5px] font-semibold text-white"
            >
              <i className="ti ti-plus text-[16px]" aria-hidden />새 접근 정책 그룹 생성
            </Link>
          ) : (
            <Button variant="primary" disabled title={NO_CREATE_PERMISSION}>
              새 접근 정책 그룹 생성
            </Button>
          )
        }
      />
      <Card>
        <DataTable>
          <thead>
            <tr>
              <HeadCell>접근 정책 그룹 식별키</HeadCell>
              <HeadCell>접근 정책 그룹명</HeadCell>
              <HeadCell>생성일</HeadCell>
              <HeadCell>수정일</HeadCell>
              <HeadCell align="right">관리</HeadCell>
            </tr>
          </thead>
          <tbody>
            {props.groups.length === 0 && <EmptyRow colSpan={5} message="등록된 접근 정책 그룹이 없습니다." />}
            {props.groups.map((group) => (
              <tr key={group.id}>
                <BodyCell>
                  <IdentifierText value={group.id} />
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-[13.5px]! font-semibold">{group.name}</BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDate(group.createdAt)}</BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDate(group.updatedAt)}</BodyCell>
                <BodyCell align="right">
                  <div className="inline-flex gap-1.5">
                    <Link
                      href={`/access-policy-groups/${group.id}`}
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
          message={`'${deleting.name}' 접근 정책 그룹을 삭제합니다. 이 그룹이 할당된 계정이나 공개 링크가 있으면 삭제할 수 없습니다.`}
          isPending={deleteApi.isLoading}
          onConfirm={() => deleteGroup(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
