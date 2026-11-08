"use client";

import type { ADMIN_ME_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { createContext } from "react";

export const AdminSessionContext = createContext<ResBody<typeof ADMIN_ME_API>["data"] | null>(null);
