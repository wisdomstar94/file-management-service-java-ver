import type { PERMISSION_CODE_REGISTRY } from "@fms/consts/permissions/permission-code-registry";

export type AdminNavItem = {
  label: string;
  icon: string;
  href: string;
  permission: keyof typeof PERMISSION_CODE_REGISTRY;
  children?: AdminNavItem[];
};
