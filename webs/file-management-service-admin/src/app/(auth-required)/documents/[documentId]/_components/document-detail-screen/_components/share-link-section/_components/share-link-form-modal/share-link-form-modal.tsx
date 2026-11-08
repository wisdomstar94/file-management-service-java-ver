"use client";

import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type {
  SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API,
  SHARE_LINK_LIST_API,
} from "@fms/api-schemas/schemas/share-link-api-schemas";
import { CREATE_SHARE_LINK_API, UPDATE_SHARE_LINK_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import { formatDate } from "@fms/web-utils/formats/format-date";
import { type SubmitEvent, useState } from "react";
import { ChoiceCard } from "@/components/commons/choice-card";
import { FormField } from "@/components/commons/form-field";
import { Modal } from "@/components/commons/modal";
import { SelectInput } from "@/components/commons/select-input";
import { ToggleSwitch } from "@/components/commons/toggle-switch";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { TOGGLES } from "./_consts/toggles";
import { toKstDateBoundary } from "./_utils/to-kst-date-boundary";

export function ShareLinkFormModal(props: {
  document: ResBody<typeof DOCUMENT_DETAIL_API>["data"];
  link: ResBody<typeof SHARE_LINK_LIST_API>["data"][number] | null;
  policyOptions: ResBody<typeof SHARE_LINK_ASSIGNABLE_ACCESS_POLICY_GROUPS_API>["data"][number][];
  onClose: () => void;
}) {
  const { document, link, policyOptions, onClose } = props;
  const [isPasswordOn, setIsPasswordOn] = useState(link?.hasPassword ?? false);
  const [mode, setMode] = useState(link?.defaultVersionMode ?? "FOLLOW_DOCUMENT");
  const [toggles, setToggles] = useState<Record<(typeof TOGGLES)[number]["key"], boolean>>({
    isShowOtherVersions: link?.isShowOtherVersions ?? false,
    isAllowOtherVersionDownload: link?.isAllowOtherVersionDownload ?? false,
    isShowDownloadStatus: link?.isShowDownloadStatus ?? true,
  });
  const createApi = useCallApiWrapper(CREATE_SHARE_LINK_API, { successMessage: "링크를 생성했습니다" });
  const updateApi = useCallApiWrapper(UPDATE_SHARE_LINK_API, { successMessage: "링크를 저장했습니다" });
  const isPending = createApi.isLoading || updateApi.isLoading;
  const defaultVersion = document.versions.find((version) => version.isDefault) ?? document.latestVersion;

  function readPassword(form: FormData): { password?: string | null } {
    const password = String(form.get("password") ?? "");
    if (!isPasswordOn) {
      return { password: null };
    }
    // 이미 비밀번호가 있는 링크에서 입력칸을 비워 두면 기존 비밀번호를 그대로 둔다.
    return password === "" && link?.hasPassword ? {} : { password };
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const maxDownloadCount = String(form.get("maxDownloadCount") ?? "");
    const body = {
      accessPolicyGroupId: String(form.get("accessPolicyGroupId") ?? "") || null,
      maxDownloadCount: maxDownloadCount === "" ? null : Number(maxDownloadCount),
      availableFrom: toKstDateBoundary(String(form.get("availableFrom") ?? ""), "start"),
      availableUntil: toKstDateBoundary(String(form.get("availableUntil") ?? ""), "end"),
      defaultVersionMode: mode,
      fixedVersionId: mode === "FIXED" ? String(form.get("fixedVersionId") ?? "") : null,
      ...toggles,
      isAllowOtherVersionDownload: toggles.isShowOtherVersions && toggles.isAllowOtherVersionDownload,
    };
    const saved = link
      ? await updateApi.fetchApi({
          params: { documentId: document.id, linkId: link.id },
          body: { ...body, ...readPassword(form) },
        })
      : await createApi.fetchApi({
          params: { documentId: document.id },
          body: { ...body, password: readPassword(form).password ?? null },
        });
    if (!isCommonError(saved)) {
      onClose();
    }
  }

  return (
    <Modal title={link ? "외부 공개 링크 수정" : "외부 공개 링크 생성"} width={600} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4.5 px-5.5 py-5">
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="접근 정책 그룹" className="col-span-2">
              <SelectInput name="accessPolicyGroupId" defaultValue={link?.accessPolicyGroup?.id ?? ""}>
                <option value="">제한 없음 (누구나 접근)</option>
                {policyOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="다운로드 시작일">
              <TextInput
                type="date"
                name="availableFrom"
                defaultValue={link?.availableFrom ? formatDate(link.availableFrom) : ""}
              />
            </FormField>
            <FormField label="다운로드 종료일">
              <TextInput
                type="date"
                name="availableUntil"
                defaultValue={link?.availableUntil ? formatDate(link.availableUntil) : ""}
              />
            </FormField>
            <FormField label="총 다운로드 허용 수" hint="비워두면 무제한">
              <TextInput type="number" name="maxDownloadCount" min={1} defaultValue={link?.maxDownloadCount ?? ""} />
            </FormField>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[13px] font-semibold">
                비밀번호 설정
                <ToggleSwitch label="비밀번호 설정" isOn={isPasswordOn} onChange={setIsPasswordOn} />
              </div>
              {isPasswordOn ? (
                <TextInput
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  minLength={4}
                  required={!link?.hasPassword}
                  placeholder={link?.hasPassword ? "바꿀 때만 입력" : "4자 이상"}
                />
              ) : (
                <div className="flex h-10 items-center text-[13px] text-faint">비밀번호 없이 공개</div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">기본 버전</span>
            <div className="grid grid-cols-2 gap-2">
              <ChoiceCard isSelected={mode === "FOLLOW_DOCUMENT"} onSelect={() => setMode("FOLLOW_DOCUMENT")}>
                <span className="block text-[13px] font-semibold">자료 설정 따름</span>
                <span className="mt-0.5 block text-[12px] text-muted">현재 {defaultVersion.versionName}</span>
              </ChoiceCard>
              <ChoiceCard isSelected={mode === "FIXED"} onSelect={() => setMode("FIXED")}>
                <span className="block text-[13px] font-semibold">이 링크만 별도 지정</span>
                <span className="mt-0.5 block text-[12px] text-muted">자료 설정과 무관</span>
              </ChoiceCard>
            </div>
            {mode === "FIXED" && (
              <SelectInput
                name="fixedVersionId"
                aria-label="별도 지정할 버전"
                defaultValue={link?.fixedVersion?.id ?? document.latestVersion.id}
              >
                {document.versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.versionName}
                  </option>
                ))}
              </SelectInput>
            )}
          </div>
          <div className="rounded-[10px] border border-line-table">
            {TOGGLES.map((toggle) => {
              const isDisabled = toggle.key === "isAllowOtherVersionDownload" && !toggles.isShowOtherVersions;
              return (
                <div
                  key={toggle.key}
                  className={`flex items-center gap-3 border-b border-line-row px-3.5 py-3 last:border-b-0 ${isDisabled ? "opacity-50" : ""}`}
                >
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold">{toggle.label}</div>
                    <div className="mt-0.5 text-[12px] text-faint">{toggle.description}</div>
                  </div>
                  <ToggleSwitch
                    label={toggle.label}
                    isOn={toggles[toggle.key] && !isDisabled}
                    onChange={(isOn) => !isDisabled && setToggles((previous) => ({ ...previous, [toggle.key]: isOn }))}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line-soft px-5.5 py-3.5">
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {link ? "저장" : "생성"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
