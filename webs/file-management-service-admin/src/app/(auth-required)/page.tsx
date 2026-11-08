import { redirect } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/components/layouts/admin-shell/_consts/admin-nav-items";
import { getAdminMe } from "@/utils/domains/admin-auth/get-admin-me";

/** 첫 화면은 권한이 있는 첫 메뉴로 보낸다. */
export default async function RootPage() {
  const me = await getAdminMe();
  const items = ADMIN_NAV_ITEMS.flatMap((item) => item.children ?? [item]);
  const first = items.find((item) => me.permissionCodes.includes(item.permission));
  redirect(first?.href ?? "/forbidden");
}
