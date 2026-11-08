import type { ReactNode } from "react";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";

export function AdminShell(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex flex-col gap-5 px-8 pt-7 pb-30">{props.children}</main>
      </div>
    </div>
  );
}
