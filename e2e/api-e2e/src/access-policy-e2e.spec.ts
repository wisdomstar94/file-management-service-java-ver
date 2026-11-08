import { api } from "./_utils/api-client";
import { createTestAccount } from "./_utils/create-test-account";
import { loginAs } from "./_utils/login-as";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { readLoginTokens } from "./_utils/read-login-tokens";

describe("접근 정책", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await loginAsInitialAdmin();
  });

  test("기본 차단 · 지정 IP 허용 : 허용 목록 밖 IP 의 로그인은 차단 화면용 정보와 함께 403", async () => {
    const account = await createTestAccount(adminToken, {
      permissionCodes: [],
      ruleTree: { type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: ["10.0.0.0/8"] },
    });

    const allowed = await loginAs({ ...account, ip: "10.1.2.3" });
    expect(allowed.status).toBe(200);

    const denied = await loginAs({ ...account, ip: "203.0.113.42" });
    expect(denied.status).toBe(403);
    expect(denied.body.error.code).toBe("ACCESS_POLICY_DENIED");
    expect(denied.body.error.details).toEqual(
      expect.objectContaining({ failedReasons: ["IP 제한 · 허용 목록에 없음"], requestIp: "203.0.113.42" }),
    );
  });

  test("기본 허용 · 지정 IP 차단 : 차단 목록의 IP 만 막는다", async () => {
    const account = await createTestAccount(adminToken, {
      permissionCodes: [],
      ruleTree: { type: "IP", mode: "ALLOW_ALL_EXCEPT", cidrs: ["203.0.113.0/24"] },
    });

    expect((await loginAs({ ...account, ip: "198.51.100.7" })).status).toBe(200);
    expect((await loginAs({ ...account, ip: "203.0.113.9" })).status).toBe(403);
  });

  test("중첩 조건 : (IP 허용 && 헤더 일치) || 헤더 존재", async () => {
    const account = await createTestAccount(adminToken, {
      permissionCodes: [],
      ruleTree: {
        type: "GROUP",
        operator: "OR",
        children: [
          {
            type: "GROUP",
            operator: "AND",
            children: [
              { type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: ["10.0.0.0/8"] },
              { type: "HEADER", name: "X-Internal-Token", matchType: "EQUALS", value: "abc" },
            ],
          },
          { type: "HEADER", name: "X-Break-Glass", matchType: "EXISTS" },
        ],
      },
    });
    const login = (ip: string, headers: Record<string, string>) =>
      api({ ip, headers }).post("/api/admin/auth/login").send(account);

    expect((await login("10.0.0.5", { "X-Internal-Token": "abc" })).status).toBe(200);
    expect((await login("10.0.0.5", { "X-Internal-Token": "zzz" })).status).toBe(403);
    expect((await login("8.8.8.8", { "X-Internal-Token": "abc" })).status).toBe(403);
    expect((await login("8.8.8.8", { "X-Break-Glass": "1" })).status).toBe(200);
  });

  test("이미 로그인된 상태에서도 정책이 바뀌면 다음 요청부터 차단된다", async () => {
    const account = await createTestAccount(adminToken, { permissionCodes: [] });
    const login = await loginAs({ ...account, ip: "198.51.100.1" });
    const token = readLoginTokens(login).accessToken;
    await api({ token, ip: "198.51.100.1" }).get("/api/admin/auth/access-check").expect(200);

    await api({ token: adminToken })
      .patch(`/api/admin/access-policy-groups/${account.accessPolicyGroupId}`)
      .send({ ruleTree: { type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: ["10.0.0.0/8"] } })
      .expect(200);

    const res = await api({ token, ip: "198.51.100.1" }).get("/api/admin/auth/access-check");
    expect(res.status).toBe(403);
    expect(res.body.error.details.accountLoginId).toBe(account.loginId);
  });

  test("정책 트리 검증 : 잘못된 CIDR · 빈 그룹 · 6단계 중첩은 400", async () => {
    const admin = api({ token: adminToken });
    const create = (ruleTree: unknown) => admin.post("/api/admin/access-policy-groups").send({ name: "x", ruleTree });
    const nest = (depth: number): unknown =>
      depth === 1
        ? { type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: ["10.0.0.0/8"] }
        : { type: "GROUP", operator: "AND", children: [nest(depth - 1)] };

    expect((await create({ type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: ["10.0.0.0/33"] })).status).toBe(400);
    expect((await create({ type: "GROUP", operator: "AND", children: [] })).status).toBe(400);
    expect((await create(nest(5))).status).toBe(201);
    expect((await create(nest(6))).status).toBe(400);
  });
});
