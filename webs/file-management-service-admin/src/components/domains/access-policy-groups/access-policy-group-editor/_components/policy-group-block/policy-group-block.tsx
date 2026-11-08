"use client";

import { ChoiceCard } from "@/components/commons/choice-card";
import type { EditorBlock } from "../../_types/editor-block";
import { HeaderRuleBlock } from "../header-rule-block";
import { IpRuleBlock } from "../ip-rule-block";
import { BLOCK_META } from "./_consts/block-meta";
import { OPERATORS } from "./_consts/operators";
import { createBlock } from "./_utils/create-block";

/** 조건 그룹 하나. 하위 그룹도 같은 컴포넌트로 들여써서 그린다. */
export function PolicyGroupBlock(props: {
  group: Extract<EditorBlock, { kind: "GROUP" }>;
  depth: number;
  maxDepth: number;
  isDisabled: boolean;
  onChange: (group: Extract<EditorBlock, { kind: "GROUP" }>) => void;
}) {
  const { group, depth, maxDepth, isDisabled, onChange } = props;
  const replaceChild = (key: string, next: EditorBlock | null) =>
    onChange({
      ...group,
      children: next
        ? group.children.map((child) => (child.key === key ? next : child))
        : group.children.filter((child) => child.key !== key),
    });
  const addKinds: EditorBlock["kind"][] = depth < maxDepth ? ["IP", "HEADERS", "GROUP"] : ["IP", "HEADERS"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-white px-5.5 py-5">
        <div>
          <div className="text-[15px] font-bold">제한 조건 결합 방식</div>
          <div className="mt-0.5 text-[12.5px] text-faint">아래 조건들을 어떻게 조합해 접근을 허용할지 정합니다.</div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
          {OPERATORS.map((item) => (
            <ChoiceCard
              key={item.operator}
              isSelected={group.operator === item.operator}
              onSelect={() => !isDisabled && onChange({ ...group, operator: item.operator })}
            >
              <span className="flex items-center gap-2 text-[14px] font-bold">
                <span className="rounded-[5px] bg-ink px-1.5 py-0.5 font-mono text-[12px] text-white">
                  {item.operator}
                </span>
                {item.title}
              </span>
              <span className="mt-1.5 block text-[12.5px] text-muted">{item.description}</span>
            </ChoiceCard>
          ))}
        </div>
      </div>

      {group.children.map((child) => {
        const meta = BLOCK_META[child.kind];
        return (
          <div key={child.key} className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="flex items-center gap-3 border-b border-line-soft px-5.5 py-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <i className={`ti ${meta.icon} text-[17px]`} aria-hidden />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold">{meta.title}</div>
                <div className="text-[12.5px] text-faint">{meta.description}</div>
              </div>
              {!isDisabled && (
                <button
                  type="button"
                  aria-label={`${meta.title} 삭제`}
                  onClick={() => replaceChild(child.key, null)}
                  className="cursor-pointer text-faint"
                >
                  <i className="ti ti-trash text-[18px]" aria-hidden />
                </button>
              )}
            </div>
            {child.kind === "IP" && (
              <IpRuleBlock block={child} isDisabled={isDisabled} onChange={(next) => replaceChild(child.key, next)} />
            )}
            {child.kind === "HEADERS" && (
              <HeaderRuleBlock
                block={child}
                isDisabled={isDisabled}
                onChange={(next) => replaceChild(child.key, next)}
              />
            )}
            {child.kind === "GROUP" && (
              <div className="border-l-[3px] border-primary-soft bg-surface-sub px-5.5 py-4.5">
                <PolicyGroupBlock
                  group={child}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  isDisabled={isDisabled}
                  onChange={(next) => replaceChild(child.key, next)}
                />
              </div>
            )}
          </div>
        );
      })}

      {!isDisabled && (
        <div className="flex flex-wrap gap-2">
          {addKinds.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onChange({ ...group, children: [...group.children, createBlock(kind)] })}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-line-dashed bg-white px-3.5 text-[13px] font-semibold text-primary"
            >
              <i className="ti ti-plus text-[15px]" aria-hidden />
              {BLOCK_META[kind].title} 추가
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
