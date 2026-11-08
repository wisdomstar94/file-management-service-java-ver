"use client";

import type { PERMISSION_DETAIL_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import { UPDATE_PERMISSION_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import type { SubmitEvent } from "react";
import { FormField } from "@/components/commons/form-field";
import { Modal } from "@/components/commons/modal";
import { TextAreaInput } from "@/components/commons/text-area-input";
import { useAdminSession } from "@/providers/admin-session-provider";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";

export function PermissionFormModal(props: {
  permission: ResBody<typeof PERMISSION_DETAIL_API>["data"];
  categories: string[];
  onClose: () => void;
}) {
  const { permission, categories, onClose } = props;
  const isReadOnly = !useAdminSession().hasPermission("perm.update");
  const updateApi = useCallApiWrapper(UPDATE_PERMISSION_API, { successMessage: "저장했습니다" });

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      category: String(form.get("category") ?? ""),
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
    };
    const result = await updateApi.fetchApi({ params: { id: permission.id }, body });
    if (!isCommonError(result)) {
      onClose();
    }
  }

  return (
    <Modal title="권한 상세" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isReadOnly} className="m-0 flex flex-col gap-4 border-0 px-5.5 py-5">
          <FormField label="권한 식별키" hint="권한 식별키는 바꿀 수 없습니다.">
            <TextInput name="code" disabled defaultValue={permission.code} className="font-mono" />
          </FormField>
          <FormField label="분류">
            <TextInput
              name="category"
              required
              list="permission-categories"
              defaultValue={permission.category}
              placeholder="예: 자료 상세 페이지"
            />
            <datalist id="permission-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </FormField>
          <FormField label="권한명">
            <TextInput name="name" required defaultValue={permission.name} placeholder="예: 새 버전 등록 권한" />
          </FormField>
          <FormField label="설명">
            <TextAreaInput name="description" rows={3} defaultValue={permission.description} />
          </FormField>
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-line-soft px-5.5 py-3.5">
          <Button onClick={onClose}>{isReadOnly ? "닫기" : "취소"}</Button>
          {!isReadOnly && (
            <Button type="submit" variant="primary" disabled={updateApi.isLoading}>
              저장
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
