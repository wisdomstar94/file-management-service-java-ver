import type { ReactNode } from "react";

export function FormField(props: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  const { label, error, hint, className = "", children } = props;
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: 입력 요소는 children 으로 받는다.
    <label className={`flex flex-col gap-1.5 text-[13px] font-semibold text-ink-2 ${className}`}>
      {label}
      {children}
      {hint && !error && <span className="text-[12px] font-normal text-faint">{hint}</span>}
      {error && <span className="text-[12px] font-normal text-danger">{error}</span>}
    </label>
  );
}
