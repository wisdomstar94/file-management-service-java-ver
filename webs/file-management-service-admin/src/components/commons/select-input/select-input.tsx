import type { SelectHTMLAttributes } from "react";

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      className={`h-10 rounded-lg border border-line-input bg-white px-2.5 text-[14px] font-normal text-ink-2 outline-none focus:border-primary disabled:bg-disabled-bg ${className}`}
      {...rest}
    />
  );
}
