"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { readBreadcrumbs } from "../../_utils/read-breadcrumbs";

export function AdminHeader() {
  const crumbs = readBreadcrumbs(usePathname());
  return (
    <header className="sticky top-0 z-5 flex h-16 items-center gap-4 border-b border-line bg-white px-8">
      <nav aria-label="현재 위치" className="flex items-center gap-2 text-[13.5px] text-faint">
        <span>관리자</span>
        {crumbs.map((crumb) => (
          <span key={crumb.href ?? crumb.label} className="flex items-center gap-2">
            <i className="ti ti-chevron-right text-[14px]" aria-hidden />
            {crumb.href ? (
              <Link href={crumb.href} className="text-faint">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-ink">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
