"use client";

import { Button } from "@fms/web-ui/components/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SubmitEvent } from "react";
import { PERIODS } from "./_consts/periods";

export function DocumentsToolbar(props: { selectedCount: number; canDelete: boolean; onBulkDelete: () => void }) {
  const { selectedCount, canDelete, onBulkDelete } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pushQuery(patch: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    pushQuery({ keyword: String(new FormData(event.currentTarget).get("keyword") ?? "").trim() });
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line-soft px-4 py-3.5">
      <form
        onSubmit={handleSearch}
        className="flex h-9 w-65 items-center gap-2 rounded-lg border border-line-input px-3 text-faint"
      >
        <i className="ti ti-search text-[15px]" aria-hidden />
        <input
          name="keyword"
          aria-label="자료명 검색"
          defaultValue={searchParams.get("keyword") ?? ""}
          placeholder="자료명 검색"
          className="min-w-0 flex-1 border-none text-[13.5px] text-ink outline-none"
        />
      </form>
      <select
        aria-label="등록일 기간"
        value={searchParams.get("days") ?? ""}
        onChange={(event) => pushQuery({ days: event.target.value })}
        className="h-9 rounded-lg border border-line-input bg-white px-2.5 text-[13.5px] text-ink-2"
      >
        {PERIODS.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
      {selectedCount > 0 && (
        <div className="ml-1.5 flex items-center gap-2 border-l border-line pl-3">
          <span className="text-[13px] font-semibold text-primary">{selectedCount}개 선택됨</span>
          <Button
            size="sm"
            variant="danger"
            disabled={!canDelete}
            title={canDelete ? undefined : "삭제 권한이 없습니다"}
            onClick={onBulkDelete}
          >
            선택 삭제
          </Button>
        </div>
      )}
    </div>
  );
}
