"use client";

import type { PERMISSION_DETAIL_API, PERMISSION_LIST_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { Button } from "@fms/web-ui/components/button";
import { formatDate } from "@fms/web-utils/formats/format-date";
import { useState } from "react";
import { BodyCell } from "@/components/commons/body-cell";
import { Card } from "@/components/commons/card";
import { DataTable } from "@/components/commons/data-table";
import { EmptyRow } from "@/components/commons/empty-row";
import { HeadCell } from "@/components/commons/head-cell";
import { PageHeading } from "@/components/commons/page-heading";
import { PermissionFormModal } from "./_components/permission-form-modal";

export function PermissionsScreen(props: { permissions: ResBody<typeof PERMISSION_LIST_API>["data"] }) {
  const { items, codeOnlyPermissionCodes } = props.permissions;
  const [editing, setEditing] = useState<ResBody<typeof PERMISSION_DETAIL_API>["data"] | null>(null);
  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <>
      <PageHeading title="권한 관리" description="메뉴 · 기능 단위로 할 수 있는 동작을 정의합니다." />
      {codeOnlyPermissionCodes.length > 0 && (
        <div
          role="alert"
          className="flex gap-2.5 rounded-xl border border-danger-line bg-danger-soft px-4 py-3.5 text-[13px] text-ink-2"
        >
          <i className="ti ti-alert-triangle shrink-0 text-[18px] text-danger" aria-hidden />
          <div>
            <div className="font-semibold">코드에는 있으나 등록되지 않은 권한 코드가 있습니다.</div>
            <div className="mt-1 text-sub">
              이 코드로 막힌 기능은 지금 아무도 쓸 수 없습니다. 시드(
              <span className="font-mono">yarn workspace @fms/database-manager seed</span>)를 실행해 권한을 추가하세요
              :&nbsp;
              <span className="font-mono">{codeOnlyPermissionCodes.join(", ")}</span>
            </div>
          </div>
        </div>
      )}
      <Card>
        <DataTable>
          <thead>
            <tr>
              <HeadCell>권한 식별키</HeadCell>
              <HeadCell>권한명</HeadCell>
              <HeadCell>생성일</HeadCell>
              <HeadCell>수정일</HeadCell>
              <HeadCell align="right">관리</HeadCell>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <EmptyRow colSpan={5} message="등록된 권한이 없습니다." />}
            {items.map((permission) => (
              <tr key={permission.id}>
                <BodyCell className="whitespace-nowrap font-mono text-[12.5px]! text-sub">{permission.code}</BodyCell>
                <BodyCell className="whitespace-nowrap text-[13.5px]!">
                  <span className="text-faint">{permission.category} – </span>
                  <span className="font-semibold">{permission.name}</span>
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDate(permission.createdAt)}</BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDate(permission.updatedAt)}</BodyCell>
                <BodyCell align="right">
                  <Button size="sm" onClick={() => setEditing(permission)}>
                    상세
                  </Button>
                </BodyCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Card>
      {editing && <PermissionFormModal permission={editing} categories={categories} onClose={() => setEditing(null)} />}
    </>
  );
}
