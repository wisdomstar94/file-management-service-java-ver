import type { TextareaHTMLAttributes } from "react";

export function TextAreaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      className={`resize-y rounded-lg border border-line-input px-3 py-2.5 text-[14px] font-normal outline-none focus:border-primary disabled:bg-disabled-bg ${className}`}
      {...rest}
    />
  );
}
