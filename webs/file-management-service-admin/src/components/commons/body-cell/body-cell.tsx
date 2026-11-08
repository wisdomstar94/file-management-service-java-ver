import type { TdHTMLAttributes } from "react";

export function BodyCell(props: TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" }) {
  const { align = "left", className = "", ...rest } = props;
  return (
    <td
      className={`border-b border-line-row px-4 py-3 text-[13px] ${align === "right" ? "text-right whitespace-nowrap" : ""} ${className}`}
      {...rest}
    />
  );
}
