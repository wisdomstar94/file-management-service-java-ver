import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavItem } from "../../../../_types/admin-nav-item";
import { isActivePath } from "../../_utils/is-active-path";

export function NavLink(props: {
  item: AdminNavItem;
  isChild?: boolean;
  isParentActive?: boolean;
  hasCaret?: boolean;
}) {
  const { item, isChild = false, isParentActive = false, hasCaret = false } = props;
  const pathname = usePathname();
  const isActive = !hasCaret && isActivePath(pathname, item.href);
  const colorClassName = isActive
    ? "bg-primary-soft text-primary font-semibold"
    : isParentActive
      ? "text-ink font-semibold"
      : "text-[#4a505c] font-medium";
  return (
    <Link
      href={item.href}
      className={`flex h-10 items-center gap-2.5 rounded-lg pr-3 text-[14px] ${isChild ? "pl-5.5" : "pl-3"} ${colorClassName}`}
    >
      <i className={`ti ${isChild ? "ti-point" : item.icon} w-4.5 text-[18px]`} aria-hidden />
      <span className="flex-1">{item.label}</span>
      {hasCaret && <i className="ti ti-chevron-down text-[15px] text-faint-2" aria-hidden />}
    </Link>
  );
}
