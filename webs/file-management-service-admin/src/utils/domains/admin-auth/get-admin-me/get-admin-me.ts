import { ADMIN_ME_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import { cache } from "react";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

/** 한 요청 안에서 레이아웃 · 페이지가 함께 불러도 api 는 한 번만 호출한다. */
export const getAdminMe = cache(async () => (await fetchServerWrapper(ADMIN_ME_API, {})).data);
