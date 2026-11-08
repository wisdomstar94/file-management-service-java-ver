import type { InputHTMLAttributes } from "react";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement> & { isInvalid?: boolean }) {
  const { className = "", isInvalid = false, ...rest } = props;
  return (
    <input
      className={`h-10 w-full rounded-lg border bg-white px-3 text-[14px] text-ink outline-none placeholder:text-faint focus:border-primary disabled:bg-disabled-bg disabled:text-muted ${isInvalid ? "border-danger" : "border-line-input"} ${className}`}
      {...rest}
    />
  );
}
