"use client";

import type { ReactNode } from "react";

/** 둘 이상 중 하나를 고르는 카드. 시안의 AND/OR · IP 모드 · 링크 기본 버전 선택에 쓴다. */
export function ChoiceCard(props: {
  isSelected: boolean;
  onSelect: () => void;
  withRadio?: boolean;
  children: ReactNode;
}) {
  const { isSelected, onSelect, withRadio = false, children } = props;
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={`flex cursor-pointer gap-2.5 rounded-[10px] border-[1.5px] px-3.5 py-3 text-left ${isSelected ? "border-primary bg-primary-softer" : "border-line-input bg-white"}`}
    >
      {withRadio && (
        <span
          className="mt-0.5 size-4 shrink-0 rounded-full bg-white"
          style={{ border: isSelected ? "5px solid var(--color-primary)" : "1.5px solid #c5cad3" }}
        />
      )}
      <span className="flex-1">{children}</span>
    </button>
  );
}
