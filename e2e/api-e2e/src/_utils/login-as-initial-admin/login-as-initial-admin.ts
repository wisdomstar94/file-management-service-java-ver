import { loginAs } from "../login-as";
import { readLoginTokens } from "../read-login-tokens";

export async function loginAsInitialAdmin(): Promise<string> {
  const res = await loginAs({
    loginId: process.env.INITIAL_ADMIN_ID ?? "",
    password: process.env.INITIAL_ADMIN_PASSWORD ?? "",
  });
  if (res.status !== 200) {
    throw new Error(`최초 관리자 로그인 실패: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return readLoginTokens(res).accessToken;
}
