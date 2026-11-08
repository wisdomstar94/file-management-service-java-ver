"use client";

import { ChoiceCard } from "@/components/commons/choice-card";
import { RULE_INPUT_CLASS_NAME } from "../../_consts/rule-input-class-name";
import type { EditorBlock } from "../../_types/editor-block";
import { MODES } from "./_consts/ip-modes";

export function IpRuleBlock(props: {
  block: Extract<EditorBlock, { kind: "IP" }>;
  isDisabled: boolean;
  onChange: (block: Extract<EditorBlock, { kind: "IP" }>) => void;
}) {
  const { block, isDisabled, onChange } = props;
  const setCidr = (index: number, value: string) =>
    onChange({ ...block, cidrs: block.cidrs.map((cidr, i) => (i === index ? value : cidr)) });

  return (
    <div className="flex flex-col gap-4 px-5.5 py-4.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
        {MODES.map((item) => (
          <ChoiceCard
            key={item.mode}
            withRadio
            isSelected={block.mode === item.mode}
            onSelect={() => !isDisabled && onChange({ ...block, mode: item.mode })}
          >
            <span className="block text-[13.5px] font-semibold">{item.title}</span>
            <span className="mt-0.75 block text-[12.5px] text-muted">{item.description}</span>
          </ChoiceCard>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-[13px] font-semibold">
          {block.mode === "DENY_ALL_EXCEPT" ? "허용할 IP" : "차단할 IP"}{" "}
          <span className="font-medium text-faint">{block.cidrs.length}</span>
        </div>
        {block.cidrs.map((cidr, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 입력 순서가 곧 식별자인 단순 문자열 목록
          <div key={index} className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-2">
            <input
              aria-label={`IP ${index + 1}`}
              value={cidr}
              disabled={isDisabled}
              onChange={(event) => setCidr(index, event.target.value)}
              placeholder="IP 또는 CIDR (예: 10.0.0.0/8)"
              className={RULE_INPUT_CLASS_NAME}
            />
            <button
              type="button"
              aria-label="IP 삭제"
              disabled={isDisabled}
              onClick={() => onChange({ ...block, cidrs: block.cidrs.filter((_, i) => i !== index) })}
              className="cursor-pointer text-faint"
            >
              <i className="ti ti-trash text-[17px]" aria-hidden />
            </button>
          </div>
        ))}
        {!isDisabled && (
          <button
            type="button"
            onClick={() => onChange({ ...block, cidrs: [...block.cidrs, ""] })}
            className="mt-1 inline-flex cursor-pointer items-center gap-1.25 self-start text-[13px] font-semibold text-primary"
          >
            <i className="ti ti-plus text-[15px]" aria-hidden />
            IP 추가
          </button>
        )}
      </div>
    </div>
  );
}
