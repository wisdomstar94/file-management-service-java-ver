"use client";

import { formatFileSize } from "@fms/web-utils/formats/format-file-size";
import { type DragEvent, useState } from "react";

export function FileDropZone(props: { file: File | null; onChange: (file: File | null) => void }) {
  const { file, onChange } = props;
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    onChange(event.dataTransfer.files[0] ?? null);
  }

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed px-4 py-7 ${isDragging ? "border-primary bg-primary-softer" : "border-line-dashed bg-surface-sub"}`}
    >
      <input
        type="file"
        name="file"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <i className="ti ti-cloud-upload text-[28px] text-primary" aria-hidden />
      {file ? (
        <div className="text-[13.5px] font-semibold">
          {file.name} <span className="font-normal text-faint">· {formatFileSize(file.size)}</span>
        </div>
      ) : (
        <div className="text-[13.5px]">
          <span className="font-semibold text-primary">파일 선택</span> 또는 여기로 끌어다 놓기
        </div>
      )}
      <div className="text-[12px] text-faint">버전 하나에 파일 하나 · 파일명 제약 없음</div>
    </label>
  );
}
