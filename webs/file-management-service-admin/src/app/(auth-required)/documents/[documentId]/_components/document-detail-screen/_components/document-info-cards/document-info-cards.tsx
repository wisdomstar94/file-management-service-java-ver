"use client";

import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { VersionBadge } from "@fms/web-ui/components/version-badge";
import { formatDateTime } from "@fms/web-utils/formats/format-date-time";
import { SelectInput } from "@/components/commons/select-input";
import { useToast } from "@/providers/toast-provider";
import { LATEST } from "./_consts/latest";

export function DocumentInfoCards(props: {
  document: ResBody<typeof DOCUMENT_DETAIL_API>["data"];
  name: string;
  defaultVersionId: string | null;
  isEditable: boolean;
  onNameChange: (name: string) => void;
  onDefaultVersionChange: (versionId: string | null) => void;
}) {
  const { document, name, defaultVersionId, isEditable, onNameChange, onDefaultVersionChange } = props;
  const showToast = useToast();
  const latest = document.latestVersion;
  const fixed = document.versions.find((version) => version.id === defaultVersionId);

  async function copyId() {
    await navigator.clipboard.writeText(document.id);
    showToast("클립보드에 복사했습니다");
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5">
      <section className="rounded-xl border border-line bg-white px-5.5 py-5">
        <h2 className="m-0 mb-4 text-[15px] font-bold">기본 정보</h2>
        <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-x-3 gap-y-3.5 text-[13.5px]">
          <span className="text-muted">자료 식별키</span>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-mono text-[12.5px] text-ink-2">{document.id}</span>
            <button type="button" aria-label="식별키 복사" onClick={copyId} className="cursor-pointer text-faint">
              <i className="ti ti-copy text-[15px]" aria-hidden />
            </button>
          </div>
          <span className="text-muted">자료명</span>
          <input
            aria-label="자료명"
            value={name}
            disabled={!isEditable}
            onChange={(event) => onNameChange(event.target.value)}
            className="h-9 min-w-0 rounded-lg border border-line-input px-3 text-[13.5px] outline-none focus:border-primary disabled:bg-disabled-bg"
          />
          <span className="text-muted">자료 등록일</span>
          <span>{formatDateTime(document.createdAt)}</span>
          <span className="text-muted">최신 버전</span>
          <div className="flex flex-wrap items-center gap-2">
            <VersionBadge>{latest.versionName}</VersionBadge>
            <span className="text-sub">{latest.fileName}</span>
            <span className="text-[12.5px] text-faint">· {formatDateTime(latest.createdAt)}</span>
          </div>
        </div>
      </section>
      <section className="flex flex-col rounded-xl border border-line bg-white px-5.5 py-5">
        <h2 className="m-0 mb-1.5 text-[15px] font-bold">기본 버전 설정</h2>
        <p className="mt-0 mb-4 text-[13px] leading-[1.55] text-muted">
          자료를 열었을 때 기본으로 보여질 버전입니다. 최신 버전을 선택하면 새 버전 등록 시 자동으로 바뀝니다.
        </p>
        <SelectInput
          aria-label="기본 버전"
          value={defaultVersionId ?? LATEST}
          disabled={!isEditable}
          onChange={(event) => onDefaultVersionChange(event.target.value === LATEST ? null : event.target.value)}
        >
          <option value={LATEST}>최신 버전 (디폴트) · 현재 {latest.versionName}</option>
          {document.versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.versionName}
            </option>
          ))}
        </SelectInput>
        <div className="mt-3.5 flex items-center gap-2 rounded-lg bg-field px-3.5 py-3 text-[13px] text-sub">
          <i className="ti ti-info-circle text-[16px] text-primary" aria-hidden />
          현재 기본 버전:{" "}
          <b className="font-mono font-semibold text-ink">
            {fixed ? `${fixed.versionName} 고정` : `최신 버전 따름 (${latest.versionName})`}
          </b>
        </div>
      </section>
    </div>
  );
}
