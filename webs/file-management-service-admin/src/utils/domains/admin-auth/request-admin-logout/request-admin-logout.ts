import { ADMIN_LOGOUT_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import { fetchClientWrapper } from "@/wrappers/fetch-client-wrapper";

/** 브라우저에서 api 를 직접 호출해 refresh token 을 폐기하고 토큰 쿠키를 지운다. 실패해도 호출한 쪽은 로그인 화면으로 보낸다. */
export async function requestAdminLogout(apiPublicUrl: string): Promise<void> {
  await fetchClientWrapper(ADMIN_LOGOUT_API, {}, { baseUrl: apiPublicUrl, credentials: "include" }).catch(
    () => undefined,
  );
}
