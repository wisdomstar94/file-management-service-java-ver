"use client";

import type { PERMISSION_DETAIL_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import type { PERMISSION_GROUP_DETAIL_API } from "@fms/api-schemas/schemas/permission-group-api-schemas";
import {
  CREATE_PERMISSION_GROUP_API,
  UPDATE_PERMISSION_GROUP_API,
} from "@fms/api-schemas/schemas/permission-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/commons/card";
import { FormField } from "@/components/commons/form-field";
import { PageHeading } from "@/components/commons/page-heading";
import { useAdminSession } from "@/providers/admin-session-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { groupPermissionsByCategory } from "./_utils/group-permissions-by-category";

export function PermissionGroupEditor(props: {
  group: ResBody<typeof PERMISSION_GROUP_DETAIL_API>["data"] | null;
  permissions: ResBody<typeof PERMISSION_DETAIL_API>["data"][];
}) {
  const { group, permissions } = props;
  const router = useRouter();
  const canSave = useAdminSession().hasPermission(group ? "perm.group.update" : "perm.group.create");
  const [name, setName] = useState(group?.name ?? "");
  const [checkedIds, setCheckedIds] = useState(() => new Set(group?.permissions.map((p) => p.id) ?? []));
  const createApi = useCallApiWrapper(CREATE_PERMISSION_GROUP_API, { successMessage: "권한 그룹을 저장했습니다" });
  const updateApi = useCallApiWrapper(UPDATE_PERMISSION_GROUP_API, { successMessage: "권한 그룹을 저장했습니다" });
  const isPending = createApi.isLoading || updateApi.isLoading;
  const sections = groupPermissionsByCategory(permissions);

  function toggle(ids: string[], isChecked: boolean) {
    setCheckedIds((previous) => {
      const next = new Set(previous);
      for (const id of ids) {
        if (isChecked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  async function save() {
    const body = { name, permissionIds: [...checkedIds] };
    const saved = group
      ? await updateApi.fetchApi({ params: { id: group.id }, body })
      : await createApi.fetchApi({ body });
    if (!isCommonError(saved)) {
      router.push("/permissions/groups");
    }
  }

  return (
    <>
      <PageHeading
        title={group ? group.name : "새 권한 그룹"}
        back={{ href: "/permissions/groups", label: "권한 그룹 목록" }}
        actions={
          <>
            <Link
              href="/permissions/groups"
              className="inline-flex h-9.5 items-center rounded-lg border border-line-input bg-white px-3.5 text-[13.5px] font-medium text-ink-2"
            >
              취소
            </Link>
            <Button
              variant="primary"
              disabled={!canSave || isPending}
              title={canSave ? undefined : `권한 그룹 ${group ? "수정" : "생성"} 권한이 없습니다`}
              onClick={save}
            >
              저장
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 rounded-xl border border-line bg-white px-5.5 py-5">
        <FormField label="권한 그룹 식별키">
          <TextInput
            disabled
            value={group?.id ?? "저장 시 자동 생성"}
            className="h-9.5! border-line-table! bg-field! font-mono text-[13px]! text-muted!"
          />
        </FormField>
        <FormField label="권한 그룹명">
          <TextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 자료 운영자"
            disabled={!canSave}
            className="h-9.5! text-[13.5px]!"
          />
        </FormField>
      </div>
      <Card>
        <div className="flex items-center border-b border-line-soft px-5.5 py-4">
          <div className="flex-1 text-[15px] font-bold">권한 선택</div>
          <span className="text-[13px] font-semibold text-primary">
            {checkedIds.size} / {permissions.length}개 선택됨
          </span>
        </div>
        {sections.map((section) => {
          const ids = section.items.map((item) => item.id);
          const isAllChecked = ids.every((id) => checkedIds.has(id));
          return (
            <div
              key={section.category}
              className="grid grid-cols-[220px_minmax(0,1fr)] gap-4 border-b border-line-row px-5.5 py-4"
            >
              <label className="flex cursor-pointer items-center gap-2.5 self-start text-[13.5px] font-semibold">
                <input
                  type="checkbox"
                  className="size-3.75 accent-primary"
                  checked={isAllChecked}
                  disabled={!canSave}
                  onChange={(event) => toggle(ids, event.target.checked)}
                />
                {section.category}
              </label>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2.5">
                {section.items.map((item) => (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border border-line-table px-3 py-2.5 ${checkedIds.has(item.id) ? "bg-primary-row" : "bg-white"}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-3.75 accent-primary"
                      checked={checkedIds.has(item.id)}
                      disabled={!canSave}
                      onChange={(event) => toggle([item.id], event.target.checked)}
                    />
                    <div>
                      <div className="text-[13.5px]">{item.name}</div>
                      <div className="mt-0.5 font-mono text-[11.5px] text-faint">{item.code}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
