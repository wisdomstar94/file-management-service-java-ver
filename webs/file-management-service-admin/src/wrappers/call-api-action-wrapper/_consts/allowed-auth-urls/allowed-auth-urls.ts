import { ADMIN_ME_API, ADMIN_SHORT_TIME_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";

// 토큰을 주고받거나(refresh) api 가 쿠키를 심는(login · logout) 인증 api 는 서버 액션으로 대신 호출하지 않는다.
export const ALLOWED_AUTH_URLS: string[] = [ADMIN_ME_API.url, ADMIN_SHORT_TIME_TOKEN_API.url];
