"use client";

import type {
  ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API,
  ADMIN_ACCOUNT_DETAIL_API,
  ADMIN_ACCOUNT_LIST_API,
} from "@fms/api-schemas/schemas/admin-account-api-schemas";
import { DELETE_ADMIN_ACCOUNT_API } from "@fms/api-schemas/schemas/admin-account-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { Button } from "@fms/web-ui/components/button";
import { formatDate } from "@fms/web-utils/formats/format-date";
import { formatDateTime } from "@fms/web-utils/formats/format-date-time";
import { useState } from "react";
import { BodyCell } from "@/components/commons/body-cell";
import { Card } from "@/components/commons/card";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { DataTable } from "@/components/commons/data-table";
import { EmptyRow } from "@/components/commons/empty-row";
import { HeadCell } from "@/components/commons/head-cell";
import { IdentifierText } from "@/components/commons/identifier-text";
import { PageHeading } from "@/components/commons/page-heading";
import { Pagination } from "@/components/commons/pagination";
import { useAdminSession } from "@/providers/admin-session-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { AccountFormModal } from "./_components/account-form-modal";
import { NO_CREATE_PERMISSION, NO_DELETE_PERMISSION } from "./_consts/permission-denied-messages";

export function AccountsScreen(props: {
  accounts: ResBody<typeof ADMIN_ACCOUNT_LIST_API>["data"];
  options: ResBody<typeof ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API>["data"];
}) {
  const { accounts, options } = props;
  const { hasPermission } = useAdminSession();
  const canCreate = hasPermission("account.create");
  const canDelete = hasPermission("account.delete");
  const [editing, setEditing] = useState<ResBody<typeof ADMIN_ACCOUNT_DETAIL_API>["data"] | "new" | null>(null);
  const [deleting, setDeleting] = useState<ResBody<typeof ADMIN_ACCOUNT_DETAIL_API>["data"] | null>(null);
  const deleteApi = useCallApiWrapper(DELETE_ADMIN_ACCOUNT_API, { successMessage: "삭제했습니다" });

  async function deleteAccount(account: ResBody<typeof ADMIN_ACCOUNT_DETAIL_API>["data"]) {
    await deleteApi.fetchApi({ params: { id: account.id } });
    setDeleting(null);
  }

  return (
    <>
      <PageHeading
        title="관리자 계정 관리"
        description="계정마다 권한 그룹과 접근 정책 그룹을 하나씩 지정합니다."
        actions={
          <Button
            variant="primary"
            icon="ti ti-plus"
            disabled={!canCreate}
            title={canCreate ? undefined : NO_CREATE_PERMISSION}
            onClick={() => setEditing("new")}
          >
            새 관리자 계정 생성
          </Button>
        }
      />
      <Card>
        <DataTable>
          <thead>
            <tr>
              <HeadCell>계정 식별키</HeadCell>
              <HeadCell>아이디 · 닉네임</HeadCell>
              <HeadCell>메모</HeadCell>
              <HeadCell>권한 그룹</HeadCell>
              <HeadCell>접근 정책 그룹</HeadCell>
              <HeadCell>계정 생성일</HeadCell>
              <HeadCell>최근 접속일</HeadCell>
              <HeadCell align="right">관리</HeadCell>
            </tr>
          </thead>
          <tbody>
            {accounts.items.length === 0 && <EmptyRow colSpan={8} message="등록된 관리자 계정이 없습니다." />}
            {accounts.items.map((account) => (
              <tr key={account.id}>
                <BodyCell>
                  <IdentifierText value={account.id} />
                </BodyCell>
                <BodyCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7.5 items-center justify-center rounded-full bg-chip text-[12px] font-bold text-sub">
                      {account.nickname.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold">{account.loginId}</div>
                      <div className="text-[12px] text-faint">{account.nickname}</div>
                    </div>
                  </div>
                </BodyCell>
                <BodyCell className="max-w-55 truncate text-sub">{account.memo || "-"}</BodyCell>
                <BodyCell className="whitespace-nowrap">
                  <span className="rounded-full bg-primary-soft px-2.25 py-0.75 text-[12px] font-semibold text-primary">
                    {account.permissionGroup.name}
                  </span>
                </BodyCell>
                <BodyCell className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.25">
                    <i className="ti ti-shield-lock text-[15px] text-faint" aria-hidden />
                    {account.accessPolicyGroup.name}
                  </span>
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDate(account.createdAt)}</BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">
                  {account.lastAccessedAt ? formatDateTime(account.lastAccessedAt) : "-"}
                </BodyCell>
                <BodyCell align="right">
                  <div className="inline-flex gap-1.5">
                    <Button size="sm" onClick={() => setEditing(account)}>
                      상세
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!canDelete}
                      title={canDelete ? undefined : NO_DELETE_PERMISSION}
                      onClick={() => setDeleting(account)}
                    >
                      삭제
                    </Button>
                  </div>
                </BodyCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <Pagination
          page={accounts.page}
          size={accounts.size}
          total={accounts.total}
          buildHref={(page) => `/accounts?page=${page}`}
        />
      </Card>
      {editing && (
        <AccountFormModal
          account={editing === "new" ? null : editing}
          options={options}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={`'${deleting.loginId}' 계정을 삭제합니다.`}
          isPending={deleteApi.isLoading}
          onConfirm={() => deleteAccount(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
