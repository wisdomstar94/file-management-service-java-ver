import { INITIAL_ADMIN_CREDENTIALS } from "./_consts/initial-admin-credentials";
import { api } from "./_utils/api-client";
import { loginAs } from "./_utils/login-as";
import { readLoginTokens } from "./_utils/read-login-tokens";

describe("관리자 인증", () => {
  test("올바른 아이디 · 비밀번호면 토큰을 httpOnly 쿠키로만 발급하고 /me 로 권한 코드를 돌려준다", async () => {
    const login = await loginAs(INITIAL_ADMIN_CREDENTIALS);
    expect(login.status).toBe(200);
    expect(login.body.data).toEqual({ isLoggedIn: true });
    const tokens = readLoginTokens(login);
    expect(tokens).toEqual({ accessToken: expect.any(String), refreshToken: expect.any(String) });
    expect(login.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringMatching(/^fms_admin_at=.+; .*HttpOnly/)]),
    );

    const me = await api({ token: tokens.accessToken }).get("/api/admin/auth/me").expect(200);
    expect(me.body.data.loginId).toBe(INITIAL_ADMIN_CREDENTIALS.loginId);
    expect(me.body.data.permissionCodes).toEqual(expect.arrayContaining(["account.access", "perm.update"]));
  });

  test("비밀번호가 틀리면 401 INVALID_CREDENTIALS", async () => {
    const res = await loginAs({ ...INITIAL_ADMIN_CREDENTIALS, password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  test("토큰 없이 관리 API 를 호출하면 401", async () => {
    const res = await api().get("/api/admin/accounts");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("refresh 는 새 토큰을 발급하고, 유예 시간 안에는 이미 쓴 refresh token 도 다시 받아 준다", async () => {
    const { refreshToken } = readLoginTokens(await loginAs(INITIAL_ADMIN_CREDENTIALS));
    const refreshed = await api().post("/api/admin/auth/refresh").send({ refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.refreshToken).not.toBe(refreshToken);

    const reused = await api().post("/api/admin/auth/refresh").send({ refreshToken });
    expect(reused.status).toBe(200);
    expect(reused.body.data.refreshToken).not.toBe(refreshed.body.data.refreshToken);
  });

  test("유예 시간이 지난 뒤 쓴 refresh token 을 다시 쓰면 401 이고, 그 로그인의 토큰만 모두 폐기한다", async () => {
    const { refreshToken } = readLoginTokens(await loginAs(INITIAL_ADMIN_CREDENTIALS));
    const other = readLoginTokens(await loginAs(INITIAL_ADMIN_CREDENTIALS));
    const refreshed = await api().post("/api/admin/auth/refresh").send({ refreshToken }).expect(200);

    const graceSeconds = Number(process.env.ADMIN_REFRESH_TOKEN_REUSE_GRACE_SECONDS ?? 30);
    await new Promise((resolve) => setTimeout(resolve, (graceSeconds + 1) * 1000));

    await api().post("/api/admin/auth/refresh").send({ refreshToken }).expect(401);
    await api().post("/api/admin/auth/refresh").send({ refreshToken: refreshed.body.data.refreshToken }).expect(401);
    await api().post("/api/admin/auth/refresh").send({ refreshToken: other.refreshToken }).expect(200);
  });

  test("logout 은 쿠키의 refresh token 을 폐기하고 토큰 쿠키를 지운다", async () => {
    const { refreshToken } = readLoginTokens(await loginAs(INITIAL_ADMIN_CREDENTIALS));
    const logout = await api({ headers: { Cookie: `fms_admin_rt=${encodeURIComponent(refreshToken)}` } })
      .post("/api/admin/auth/logout")
      .expect(204);
    expect(logout.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringMatching(/^fms_admin_at=;/), expect.stringMatching(/^fms_admin_rt=;/)]),
    );

    const res = await api().post("/api/admin/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(401);
  });
});
