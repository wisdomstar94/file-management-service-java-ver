import { Client } from "pg";
import { api } from "./_utils/api-client";
import { createTestAccount } from "./_utils/create-test-account";
import { loginAs } from "./_utils/login-as";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { readLoginTokens } from "./_utils/read-login-tokens";
import { uniqueName } from "./_utils/unique-name";

describe("권한 · 권한 그룹", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await loginAsInitialAdmin();
  });

  test("권한 그룹에 없는 권한의 API 는 403 PERMISSION_DENIED", async () => {
    const account = await createTestAccount(adminToken, { permissionCodes: ["perm.access"] });
    const token = readLoginTokens(await loginAs(account)).accessToken;

    expect((await api({ token }).get("/api/admin/permissions")).status).toBe(200);
    const denied = await api({ token }).get("/api/admin/accounts");
    expect(denied.status).toBe(403);
    expect(denied.body.error.code).toBe("PERMISSION_DENIED");
  });

  test("권한은 분류 · 권한명 · 설명만 수정할 수 있고, 생성 · 삭제 API 는 없다", async () => {
    const admin = api({ token: adminToken });
    const linked = (await admin.get("/api/admin/permissions")).body.data.items.find(
      (p: { code: string }) => p.code === "file.list.access",
    );

    const updated = await admin
      .patch(`/api/admin/permissions/${linked.id}`)
      .send({ name: "이름 변경", code: "file.list.other" })
      .expect(200);
    expect(updated.body.data).toMatchObject({ code: "file.list.access", name: "이름 변경" });
    await admin.patch(`/api/admin/permissions/${linked.id}`).send({ name: linked.name }).expect(200);

    await admin.post("/api/admin/permissions").send({ category: "a", name: "b", code: "asset.list.view" }).expect(404);
    await admin.delete(`/api/admin/permissions/${linked.id}`).expect(404);
  });

  test("권한 수정은 perm.update 권한으로 검사한다", async () => {
    const linked = (await api({ token: adminToken }).get("/api/admin/permissions")).body.data.items.find(
      (p: { code: string }) => p.code === "file.list.access",
    );
    const readOnly = await createTestAccount(adminToken, { permissionCodes: ["perm.access"] });
    const readOnlyToken = readLoginTokens(await loginAs(readOnly)).accessToken;
    const editor = await createTestAccount(adminToken, { permissionCodes: ["perm.access", "perm.update"] });
    const editorToken = readLoginTokens(await loginAs(editor)).accessToken;

    await api({ token: readOnlyToken }).patch(`/api/admin/permissions/${linked.id}`).send({ name: "x" }).expect(403);
    await api({ token: editorToken })
      .patch(`/api/admin/permissions/${linked.id}`)
      .send({ name: linked.name })
      .expect(200);
  });

  test("코드에는 있으나 DB 에 없는 권한 코드를 목록 응답에 알려준다", async () => {
    const client = new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const setCode = (from: string, to: string) =>
      client.query("UPDATE permission SET code = $2 WHERE code = $1", [from, to]);
    const admin = api({ token: adminToken });
    const readCodeOnly = async () => (await admin.get("/api/admin/permissions")).body.data.codeOnlyPermissionCodes;

    // 행을 지우면 권한 그룹 연결도 사라져 다른 테스트에 영향을 주므로, 코드만 잠시 바꿨다가 되돌린다.
    await client.connect();
    try {
      await setCode("file.list.delete", "tmp.file.list.delete");
      expect(await readCodeOnly()).toContain("file.list.delete");
    } finally {
      await setCode("tmp.file.list.delete", "file.list.delete");
      await client.end();
    }
    expect(await readCodeOnly()).not.toContain("file.list.delete");
  });

  test("계정이 할당된 권한 그룹 · 접근 정책 그룹은 삭제할 수 없다", async () => {
    const account = await createTestAccount(adminToken, { permissionCodes: [] });
    const admin = api({ token: adminToken });

    expect((await admin.delete(`/api/admin/permission-groups/${account.permissionGroupId}`)).status).toBe(409);
    expect((await admin.delete(`/api/admin/access-policy-groups/${account.accessPolicyGroupId}`)).status).toBe(409);

    const detail = await admin.get(`/api/admin/access-policy-groups/${account.accessPolicyGroupId}`).expect(200);
    expect(detail.body.data.usedAccountCount).toBe(1);

    await admin.delete(`/api/admin/accounts/${account.id}`).expect(204);
    await admin.delete(`/api/admin/permission-groups/${account.permissionGroupId}`).expect(204);
    await admin.delete(`/api/admin/access-policy-groups/${account.accessPolicyGroupId}`).expect(204);
  });

  test("권한 그룹 수정 시 권한 목록을 통째로 바꾼다", async () => {
    const admin = api({ token: adminToken });
    const permissions = (await admin.get("/api/admin/permissions")).body.data.items as { id: string }[];
    const group = await admin
      .post("/api/admin/permission-groups")
      .send({ name: uniqueName("pg"), permissionIds: permissions.slice(0, 3).map((p) => p.id) })
      .expect(201);
    expect(group.body.data.permissionCount).toBe(3);

    const updated = await admin
      .patch(`/api/admin/permission-groups/${group.body.data.id}`)
      .send({ permissionIds: [permissions[5].id] })
      .expect(200);
    expect(updated.body.data.permissions.map((p: { id: string }) => p.id)).toEqual([permissions[5].id]);
  });
});
