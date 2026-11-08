import type { ApiSuccessBody } from "@fms/types/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";
import type { AdminAccount } from "./_types/admin-account/index.js";
import type { CreateAdminAccountBody } from "./_types/create-admin-account-body/index.js";

export const ADMIN_ACCOUNT_LIST_API = {
  url: "/api/admin/accounts",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<{ page?: number; size?: number }>(),
  },
  response: typeOf<ApiSuccessBody<{ items: AdminAccount[]; total: number; page: number; size: number }>>(),
  tags: ["admin-accounts"],
} as const satisfies ApiSchema;

export const ADMIN_ACCOUNT_ASSIGNABLE_GROUPS_API = {
  url: "/api/admin/accounts/assignable-groups",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response:
    typeOf<
      ApiSuccessBody<{
        permissionGroups: { id: string; name: string }[];
        accessPolicyGroups: { id: string; name: string }[];
      }>
    >(),
  tags: ["admin-accounts"],
} as const satisfies ApiSchema;

export const ADMIN_ACCOUNT_DETAIL_API = {
  url: "/api/admin/accounts/:id",
  method: "GET",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AdminAccount>>(),
  tags: ["admin-accounts"],
} as const satisfies ApiSchema;

export const CREATE_ADMIN_ACCOUNT_API = {
  url: "/api/admin/accounts",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<CreateAdminAccountBody>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AdminAccount>>(),
  tags: ["admin-accounts"],
} as const satisfies ApiSchema;

/** 비밀번호는 바꿀 때만 보낸다. */
export const UPDATE_ADMIN_ACCOUNT_API = {
  url: "/api/admin/accounts/:id",
  method: "PATCH",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<Partial<Omit<CreateAdminAccountBody, "loginId">>>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AdminAccount>>(),
  tags: ["admin-accounts"],
} as const satisfies ApiSchema;

export const DELETE_ADMIN_ACCOUNT_API = {
  url: "/api/admin/accounts/:id",
  method: "DELETE",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["admin-accounts"],
} as const satisfies ApiSchema;
