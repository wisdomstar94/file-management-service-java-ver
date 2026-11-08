import type { ReactNode } from "react";
import { AdminShell } from "@/components/layouts/admin-shell";
import { AdminSessionProvider } from "@/providers/admin-session-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { getAdminMe } from "@/utils/domains/admin-auth/get-admin-me";

export default async function AuthRequiredLayout(props: { children: ReactNode }) {
  const me = await getAdminMe();
  return (
    <AdminSessionProvider me={me}>
      <ToastProvider>
        <AdminShell>{props.children}</AdminShell>
      </ToastProvider>
    </AdminSessionProvider>
  );
}
