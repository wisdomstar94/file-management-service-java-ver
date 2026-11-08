import type { ButtonSize } from "../../_types/button-size/index.js";
import type { ButtonVariant } from "../../_types/button-variant/index.js";

export const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-primary text-white hover:bg-primary-hover",
  secondary: "border-line-input bg-white text-ink-2 hover:bg-surface-sub",
  danger: "border-danger-line bg-white text-danger hover:bg-danger-soft",
  ghost: "border-transparent bg-transparent text-sub hover:bg-chip",
};

export const SIZE_CLASS_NAMES: Record<ButtonSize, string> = {
  md: "h-9.5 px-4 text-[13.5px] font-semibold rounded-lg gap-1.5",
  sm: "h-7.5 px-3 text-[12.5px] font-medium rounded-md gap-1",
};

export const DISABLED_CLASS_NAMES =
  "disabled:border-line-table disabled:bg-disabled-bg disabled:text-disabled disabled:cursor-not-allowed";
