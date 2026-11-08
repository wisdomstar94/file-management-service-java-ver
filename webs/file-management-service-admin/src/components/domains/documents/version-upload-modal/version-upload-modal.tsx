"use client";

import { ADMIN_SHORT_TIME_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import { CREATE_DOCUMENT_API } from "@fms/api-schemas/schemas/document-api-schemas";
import {
  CREATE_DOCUMENT_VERSION_API,
  UPDATE_DOCUMENT_VERSION_API,
} from "@fms/api-schemas/schemas/document-version-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import { type SubmitEvent, useState } from "react";
import { FormField } from "@/components/commons/form-field";
import { Modal } from "@/components/commons/modal";
import { useToast } from "@/providers/toast-provider";
import type { VersionUploadMode } from "@/types/version-upload-mode";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { FileDropZone } from "./_components/file-drop-zone";
import { TITLES } from "./_consts/titles";

/** 새 자료 등록 · 새 버전 등록 · 버전명 수정을 같은 모달로 처리한다. 버전 수정은 파일을 바꾸지 않는다. */
export function VersionUploadModal(props: {
  mode: VersionUploadMode;
  onClose: () => void;
  onSaved?: (document: ResBody<typeof DOCUMENT_DETAIL_API>["data"]) => void;
}) {
  const { mode, onClose, onSaved } = props;
  const [file, setFile] = useState<File | null>(null);
  const showToast = useToast();
  const updateVersionApi = useCallApiWrapper(UPDATE_DOCUMENT_VERSION_API, { successMessage: "저장했습니다" });
  const shortTimeTokenApi = useCallApiWrapper(ADMIN_SHORT_TIME_TOKEN_API, { refreshOnSuccess: false });
  // 파일은 Next 서버를 거치지 않고 브라우저가 api 로 바로 올린다.
  const createDocumentApi = useCallApiWrapper(CREATE_DOCUMENT_API, { via: "client", successMessage: "등록했습니다" });
  const createVersionApi = useCallApiWrapper(CREATE_DOCUMENT_VERSION_API, {
    via: "client",
    successMessage: "등록했습니다",
  });
  const isPending = [updateVersionApi, shortTimeTokenApi, createDocumentApi, createVersionApi].some(
    (api) => api.isLoading,
  );
  const isEdit = mode.kind === "edit-version";

  async function submit(form: FormData) {
    const versionName = String(form.get("versionName") ?? "");
    if (mode.kind === "edit-version") {
      return updateVersionApi.fetchApi({
        params: { documentId: mode.documentId, versionId: mode.version.id },
        body: { versionName },
      });
    }
    const token = await shortTimeTokenApi.fetchApi({
      body:
        mode.kind === "new-document"
          ? { purpose: "UPLOAD_DOCUMENT" }
          : { purpose: "UPLOAD_DOCUMENT_VERSION", documentId: mode.documentId },
    });
    if (isCommonError(token)) {
      return token;
    }
    const headers = { authorization: `Bearer ${token.data.shortTimeToken}` };
    const body = new FormData();
    if (mode.kind === "new-document") {
      body.set("name", String(form.get("name") ?? ""));
    }
    body.set("versionName", versionName);
    body.set("file", file as File);
    return mode.kind === "new-document"
      ? createDocumentApi.fetchApi({ headers, body })
      : createVersionApi.fetchApi({ params: { documentId: mode.documentId }, headers, body });
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEdit && !file) {
      showToast("파일을 선택하세요.", "error");
      return;
    }
    const saved = await submit(new FormData(event.currentTarget));
    if (!isCommonError(saved)) {
      onSaved?.(saved.data);
      onClose();
    }
  }

  return (
    <Modal title={TITLES[mode.kind]} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 px-5.5 py-5">
          {mode.kind === "new-document" && (
            <FormField label="자료명">
              <TextInput name="name" required placeholder="예: 2026 하반기 브랜드 가이드라인" />
            </FormField>
          )}
          <FormField label="버전명">
            <TextInput
              name="versionName"
              required
              defaultValue={isEdit ? mode.version.versionName : ""}
              placeholder="예: v0.13"
              className="font-mono"
            />
          </FormField>
          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">파일</span>
              <FileDropZone file={file} onChange={setFile} />
            </div>
          )}
          <div className="flex gap-2 rounded-lg bg-field p-3 text-[12.5px] leading-normal text-muted">
            <i className="ti ti-info-circle shrink-0 text-[16px] text-primary" aria-hidden />
            {isEdit
              ? "버전명만 바꿉니다. 파일을 바꾸려면 새 버전을 등록하세요."
              : "같은 주제의 파일인지는 시스템에서 확인하지 않습니다. 등록 전 내용을 확인해 주세요."}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line-soft px-5.5 py-3.5">
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isEdit ? "저장" : "등록"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
