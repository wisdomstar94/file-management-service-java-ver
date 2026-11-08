import type { PERMISSION_CODE_REGISTRY } from "@fms/consts/permissions/permission-code-registry";
import { redirect } from "next/navigation";
import { getAdminMe } from "../../admin-auth/get-admin-me";

/** 페이지 접근 권한이 없으면 권한 없음 화면으로 보낸다. */
export async function requirePagePermission(code: keyof typeof PERMISSION_CODE_REGISTRY) {
  const me = await getAdminMe();
  if (!me.permissionCodes.includes(code)) {
    redirect("/forbidden");
  }
  return me;
}
