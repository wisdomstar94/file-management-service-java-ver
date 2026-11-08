import type { AccessPolicyNode } from "@fms/types/access-policies/access-policy-node";
import { api } from "../api-client";
import { uniqueName } from "../unique-name";

/**
 * 최초 관리자 토큰으로 「지정한 권한만 가진 권한 그룹 + 지정한 정책의 접근 정책 그룹 + 계정」 을 만든다.
 */
export async function createTestAccount(
  adminToken: string,
  props: { permissionCodes: string[]; ruleTree?: AccessPolicyNode | null },
) {
  const admin = api({ token: adminToken });
  const permissions = (await admin.get("/api/admin/permissions")).body.data.items as { id: string; code: string }[];
  const permissionIds = permissions.filter((p) => props.permissionCodes.includes(p.code)).map((p) => p.id);

  const permissionGroup = await admin
    .post("/api/admin/permission-groups")
    .send({ name: uniqueName("pg"), permissionIds })
    .expect(201);
  const accessPolicyGroup = await admin
    .post("/api/admin/access-policy-groups")
    .send({ name: uniqueName("apg"), ruleTree: props.ruleTree ?? null })
    .expect(201);

  const loginId = uniqueName("user");
  const password = "test-password-1234";
  const account = await admin
    .post("/api/admin/accounts")
    .send({
      loginId,
      password,
      nickname: loginId,
      permissionGroupId: permissionGroup.body.data.id,
      accessPolicyGroupId: accessPolicyGroup.body.data.id,
    })
    .expect(201);

  return {
    id: account.body.data.id as string,
    loginId,
    password,
    permissionGroupId: permissionGroup.body.data.id as string,
    accessPolicyGroupId: accessPolicyGroup.body.data.id as string,
  };
}
