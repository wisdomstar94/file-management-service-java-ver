"use client";

import type { PERMISSION_CODE_REGISTRY } from "@fms/consts/permissions/permission-code-registry";
import { useContext } from "react";
import { AdminSessionContext } from "../../_contexts/admin-session-context";

export function useAdminSession() {
  const me = useContext(AdminSessionContext);
  if (!me) {
    throw new Error("AdminSessionProvider 안에서만 쓸 수 있습니다.");
  }
  const hasPermission = (code: keyof typeof PERMISSION_CODE_REGISTRY) => me.permissionCodes.includes(code);
  return { me, hasPermission };
}
