import { type APIRequestContext, expect } from "@playwright/test";
import { API_BASE_URL } from "../../_consts/api-base-url";

export async function loginAsInitialAdmin(request: APIRequestContext) {
  const res = await request.post(`${API_BASE_URL}/api/admin/auth/login`, {
    data: {
      loginId: process.env.INITIAL_ADMIN_ID ?? "admin",
      password: process.env.INITIAL_ADMIN_PASSWORD ?? "admin1234!",
    },
  });
  expect(res.status()).toBe(200);
  // 로그인 응답은 토큰을 본문 대신 쿠키로 내려준다.
  const accessTokenCookie = res
    .headersArray()
    .find((header) => header.name.toLowerCase() === "set-cookie" && header.value.startsWith("fms_admin_at="));
  const accessToken = decodeURIComponent(accessTokenCookie?.value.slice("fms_admin_at=".length).split(";")[0] ?? "");
  return { Authorization: `Bearer ${accessToken}` };
}
