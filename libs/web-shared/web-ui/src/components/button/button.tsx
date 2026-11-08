import type { ButtonHTMLAttributes, ReactNode } from "react";
import { DISABLED_CLASS_NAMES, SIZE_CLASS_NAMES, VARIANT_CLASS_NAMES } from "./_consts/button-class-names/index.js";
import type { ButtonSize } from "./_types/button-size/index.js";
import type { ButtonVariant } from "./_types/button-variant/index.js";

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;
    children?: ReactNode;
  },
) {
  const { variant = "secondary", size = "md", icon, className = "", children, type = "button", ...rest } = props;
  const iconClassName = rest.disabled && rest.title ? "ti ti-lock" : icon;

  return (
    <button
      type={type}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap border transition-colors ${VARIANT_CLASS_NAMES[variant]} ${SIZE_CLASS_NAMES[size]} ${DISABLED_CLASS_NAMES} ${className}`}
      {...rest}
    >
      {iconClassName && <i className={`${iconClassName} text-[16px]`} aria-hidden />}
      {children}
    </button>
  );
}
