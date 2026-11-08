import type { ApiSuccessBody } from "@fms/types/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";
import type { Permission } from "./_types/permission/index.js";

export const PERMISSION_LIST_API = {
  url: "/api/admin/permissions",
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
        items: Permission[];
        /** 코드에는 있으나 DB 에 권한이 없는 코드. 이 코드로 막힌 기능은 아무도 쓸 수 없다. */
        codeOnlyPermissionCodes: string[];
      }>
    >(),
  tags: ["permissions"],
} as const satisfies ApiSchema;

export const PERMISSION_DETAIL_API = {
  url: "/api/admin/permissions/:id",
  method: "GET",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<Permission>>(),
  tags: ["permissions"],
} as const satisfies ApiSchema;

export const UPDATE_PERMISSION_API = {
  url: "/api/admin/permissions/:id",
  method: "PATCH",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ category?: string; name?: string; description?: string }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<Permission>>(),
  tags: ["permissions"],
} as const satisfies ApiSchema;
