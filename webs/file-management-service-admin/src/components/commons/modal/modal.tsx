"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

export function Modal(props: {
  title: string;
  width?: number;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const { title, width = 520, onClose, footer, children } = props;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: 배경 클릭으로 닫기. 키보드는 Escape 로 닫는다.
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(17,20,28,.45)] px-5 py-16"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-w-full flex-col rounded-[14px] bg-white shadow-[0_20px_50px_rgba(17,20,28,.2)]"
        style={{ width }}
      >
        <div className="flex items-center border-b border-line-soft px-5.5 py-4.5">
          <div className="flex-1 text-[16px] font-bold">{title}</div>
          <button type="button" aria-label="닫기" onClick={onClose} className="cursor-pointer text-faint">
            <i className="ti ti-x text-[19px]" aria-hidden />
          </button>
        </div>
        {children}
        {footer && <div className="flex justify-end gap-2 border-t border-line-soft px-5.5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}
