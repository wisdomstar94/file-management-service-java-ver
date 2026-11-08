"use client";

import type {
  ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API,
  ADMIN_ACCOUNT_DETAIL_API,
} from "@fms/api-schemas/schemas/admin-account-api-schemas";
import { CREATE_ADMIN_ACCOUNT_API, UPDATE_ADMIN_ACCOUNT_API } from "@fms/api-schemas/schemas/admin-account-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import { formatDateTime } from "@fms/web-utils/formats/format-date-time";
import type { SubmitEvent } from "react";
import { FormField } from "@/components/commons/form-field";
import { Modal } from "@/components/commons/modal";
import { SelectInput } from "@/components/commons/select-input";
import { TextAreaInput } from "@/components/commons/text-area-input";
import { useAdminSession } from "@/providers/admin-session-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { readOptionalFormValue } from "./_utils/read-optional-form-value";

/** `account` 가 없으면 생성, 있으면 상세(수정) 모달 */
export function AccountFormModal(props: {
  account: ResBody<typeof ADMIN_ACCOUNT_DETAIL_API>["data"] | null;
  options: ResBody<typeof ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API>["data"];
  onClose: () => void;
}) {
  const { account, options, onClose } = props;
  const { hasPermission } = useAdminSession();
  const isReadOnly = !hasPermission(account ? "account.update" : "account.create");
  const createApi = useCallApiWrapper(CREATE_ADMIN_ACCOUNT_API, { successMessage: "관리자 계정을 생성했습니다" });
  const updateApi = useCallApiWrapper(UPDATE_ADMIN_ACCOUNT_API, { successMessage: "관리자 계정을 저장했습니다" });
  const isPending = createApi.isLoading || updateApi.isLoading;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      nickname: String(form.get("nickname") ?? ""),
      memo: String(form.get("memo") ?? ""),
      permissionGroupId: String(form.get("permissionGroupId") ?? ""),
      accessPolicyGroupId: String(form.get("accessPolicyGroupId") ?? ""),
      password: readOptionalFormValue(form, "password"),
    };
    const result = account
      ? await updateApi.fetchApi({ params: { id: account.id }, body })
      : await createApi.fetchApi({
          body: { ...body, loginId: String(form.get("loginId") ?? ""), password: body.password ?? "" },
        });
    if (!isCommonError(result)) {
      onClose();
    }
  }

  return (
    <Modal title={account ? "관리자 계정 상세" : "새 관리자 계정 생성"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isReadOnly} className="m-0 grid grid-cols-2 gap-3.5 border-0 px-5.5 py-5">
          {account && (
            <FormField label="계정 식별키" className="col-span-2">
              <TextInput
                disabled
                value={account.id}
                className="border-line-table! bg-field! font-mono text-[13px]! text-muted!"
              />
            </FormField>
          )}
          <FormField label="아이디">
            <TextInput
              name="loginId"
              required
              defaultValue={account?.loginId}
              disabled={!!account}
              placeholder="영문, 숫자"
            />
          </FormField>
          <FormField label="닉네임">
            <TextInput name="nickname" required defaultValue={account?.nickname} />
          </FormField>
          {!isReadOnly && (
            <FormField label="비밀번호" className="col-span-2">
              <TextInput
                name="password"
                type="password"
                autoComplete="new-password"
                required={!account}
                minLength={8}
                placeholder={account ? "변경 시에만 입력" : "8자 이상"}
              />
            </FormField>
          )}
          <FormField label="권한 그룹">
            <SelectInput name="permissionGroupId" required defaultValue={account?.permissionGroup.id}>
              {options.permissionGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="접근 정책 그룹">
            <SelectInput name="accessPolicyGroupId" required defaultValue={account?.accessPolicyGroup.id}>
              {options.accessPolicyGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="메모" className="col-span-2">
            <TextAreaInput name="memo" rows={3} defaultValue={account?.memo} />
          </FormField>
          {account && (
            <dl className="col-span-2 m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg bg-field px-3.5 py-3 text-[13px]">
              <dt className="text-faint">계정 생성일</dt>
              <dd className="m-0">{formatDateTime(account.createdAt)}</dd>
              <dt className="text-faint">최근 접속일</dt>
              <dd className="m-0">{account.lastAccessedAt ? formatDateTime(account.lastAccessedAt) : "-"}</dd>
            </dl>
          )}
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-line-soft px-5.5 py-3.5">
          <Button onClick={onClose}>{isReadOnly ? "닫기" : "취소"}</Button>
          {!isReadOnly && (
            <Button type="submit" variant="primary" disabled={isPending}>
              {account ? "저장" : "생성"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
