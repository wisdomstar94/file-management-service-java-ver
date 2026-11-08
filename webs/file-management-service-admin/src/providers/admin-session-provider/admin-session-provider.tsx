"use client";

import type { ADMIN_ME_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { ReactNode } from "react";
import { AdminSessionContext } from "./_contexts/admin-session-context";

export function AdminSessionProvider(props: { me: ResBody<typeof ADMIN_ME_API>["data"]; children: ReactNode }) {
  return <AdminSessionContext value={props.me}>{props.children}</AdminSessionContext>;
}
