import type { ThHTMLAttributes } from "react";

export function HeadCell(props: ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" }) {
  const { align = "left", className = "", ...rest } = props;
  return (
    <th
      className={`whitespace-nowrap border-b border-line-table bg-surface-sub px-4 py-2.5 text-[12px] font-semibold text-muted ${align === "right" ? "text-right" : "text-left"} ${className}`}
      {...rest}
    />
  );
}
