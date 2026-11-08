import type { ApiSuccessBody } from "@fms/types/responses/api-response-body";
import type { ApiSchema } from "../../types/api-schema/index.js";
import { typeOf } from "../../types/api-schema/index.js";
import type { ResBody } from "../../types/api-schema-utils/index.js";
import type { PERMISSION_DETAIL_API } from "../permission-api-schemas/index.js";
import type { CreatePermissionGroupBody } from "./_types/create-permission-group-body/index.js";
import type { PermissionGroupDetail } from "./_types/permission-group-detail/index.js";
import type { PermissionGroupSummary } from "./_types/permission-group-summary/index.js";

export const PERMISSION_GROUP_LIST_API = {
  url: "/api/admin/permission-groups",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<PermissionGroupSummary[]>>(),
  tags: ["permission-groups"],
} as const satisfies ApiSchema;

export const PERMISSION_GROUP_ASSIGNABLE_PERMISSIONS_API = {
  url: "/api/admin/permission-groups/assignable-permissions",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<ResBody<typeof PERMISSION_DETAIL_API>["data"][]>>(),
  tags: ["permission-groups"],
} as const satisfies ApiSchema;

export const PERMISSION_GROUP_DETAIL_API = {
  url: "/api/admin/permission-groups/:id",
  method: "GET",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<PermissionGroupDetail>>(),
  tags: ["permission-groups"],
} as const satisfies ApiSchema;

export const CREATE_PERMISSION_GROUP_API = {
  url: "/api/admin/permission-groups",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<CreatePermissionGroupBody>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<PermissionGroupDetail>>(),
  tags: ["permission-groups"],
} as const satisfies ApiSchema;

export const UPDATE_PERMISSION_GROUP_API = {
  url: "/api/admin/permission-groups/:id",
  method: "PATCH",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<Partial<CreatePermissionGroupBody>>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<PermissionGroupDetail>>(),
  tags: ["permission-groups"],
} as const satisfies ApiSchema;

export const DELETE_PERMISSION_GROUP_API = {
  url: "/api/admin/permission-groups/:id",
  method: "DELETE",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["permission-groups"],
} as const satisfies ApiSchema;
