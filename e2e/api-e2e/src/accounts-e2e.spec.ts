import { api } from "./_utils/api-client";
import { createTestAccount } from "./_utils/create-test-account";
import { loginAs } from "./_utils/login-as";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { uniqueName } from "./_utils/unique-name";

describe("관리자 계정", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await loginAsInitialAdmin();
  });

  test("같은 아이디로 다시 만들면 409, 없는 그룹을 지정하면 400", async () => {
    const account = await createTestAccount(adminToken, { permissionCodes: [] });
    const admin = api({ token: adminToken });
    const body = {
      loginId: account.loginId,
      password: "another-password",
      nickname: "dup",
      permissionGroupId: account.permissionGroupId,
      accessPolicyGroupId: account.accessPolicyGroupId,
    };

    expect((await admin.post("/api/admin/accounts").send(body)).status).toBe(409);
    expect(
      (
        await admin
          .post("/api/admin/accounts")
          .send({ ...body, loginId: uniqueName("u"), permissionGroupId: crypto.randomUUID() })
      ).status,
    ).toBe(400);
  });

  test("비밀번호를 바꾸면 새 비밀번호로만 로그인된다. 비밀번호를 안 보내면 그대로 둔다", async () => {
    const account = await createTestAccount(adminToken, { permissionCodes: [] });
    const admin = api({ token: adminToken });

    await admin.patch(`/api/admin/accounts/${account.id}`).send({ memo: "메모만 수정" }).expect(200);
    expect((await loginAs(account)).status).toBe(200);

    await admin.patch(`/api/admin/accounts/${account.id}`).send({ password: "changed-password" }).expect(200);
    expect((await loginAs(account)).status).toBe(401);
    expect((await loginAs({ ...account, password: "changed-password" })).status).toBe(200);
  });

  test("목록은 페이지 단위로 내려주고 최근 접속일을 포함한다", async () => {
    const account = await createTestAccount(adminToken, { permissionCodes: [] });
    await loginAs(account);

    const list = await api({ token: adminToken }).get("/api/admin/accounts?page=1&size=2").expect(200);
    expect(list.body.data.items).toHaveLength(2);
    expect(list.body.data.total).toBeGreaterThanOrEqual(2);

    const detail = await api({ token: adminToken }).get(`/api/admin/accounts/${account.id}`).expect(200);
    expect(detail.body.data.lastAccessedAt).not.toBeNull();
  });

  test("로그인한 계정 자신은 삭제할 수 없고, 잘못된 식별키는 404", async () => {
    const me = await api({ token: adminToken }).get("/api/admin/auth/me").expect(200);
    expect((await api({ token: adminToken }).delete(`/api/admin/accounts/${me.body.data.id}`)).status).toBe(409);
    expect((await api({ token: adminToken }).get("/api/admin/accounts/not-a-uuid")).status).toBe(404);
  });
});
