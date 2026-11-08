"use client";

import { BrandMark } from "@fms/web-ui/components/brand-mark";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession } from "@/providers/admin-session-provider";
import { usePublicEnv } from "@/providers/public-env-provider";
import { requestAdminLogout } from "@/utils/domains/admin-auth/request-admin-logout";
import { ADMIN_NAV_ITEMS } from "../../_consts/admin-nav-items";
import { NavLink } from "./_components/nav-link";
import { isActivePath } from "./_utils/is-active-path";

export function AdminSidebar() {
  const { me, hasPermission } = useAdminSession();
  const pathname = usePathname();
  const router = useRouter();
  const { apiPublicUrl } = usePublicEnv();

  async function logout() {
    await requestAdminLogout(apiPublicUrl);
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-61 shrink-0 flex-col border-r border-line bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-line-soft px-5">
        <BrandMark />
        <div className="flex flex-col leading-[1.2]">
          <span className="text-[15px] font-bold">파일 관리</span>
          <span className="text-[11.5px] text-faint">Admin Console</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        <div className="px-2.5 pt-1.5 pb-2 text-[11.5px] font-semibold text-faint-2">메뉴</div>
        {ADMIN_NAV_ITEMS.map((item) => {
          if (!item.children) {
            return hasPermission(item.permission) ? <NavLink key={item.href} item={item} /> : null;
          }
          const children = item.children.filter((child) => hasPermission(child.permission));
          if (children.length === 0) {
            return null;
          }
          return (
            <div key={item.href} className="flex flex-col gap-0.5">
              <NavLink
                item={{ ...item, href: children[0].href }}
                hasCaret
                isParentActive={isActivePath(pathname, item.href)}
              />
              {children.map((child) => (
                <NavLink key={child.href} item={child} isChild />
              ))}
            </div>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-line-soft p-4">
        <div className="flex size-8.5 items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary">
          {me.nickname.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1 leading-[1.3]">
          <div className="truncate text-[13.5px] font-semibold">{me.nickname}</div>
          <div className="truncate text-[12px] text-faint">{me.permissionGroupName}</div>
        </div>
        <button
          type="button"
          title="로그아웃"
          aria-label="로그아웃"
          onClick={logout}
          className="cursor-pointer text-faint"
        >
          <i className="ti ti-logout text-[18px]" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
