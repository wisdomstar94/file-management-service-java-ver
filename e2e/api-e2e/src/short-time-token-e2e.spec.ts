import { api } from "./_utils/api-client";
import { createTestAccount } from "./_utils/create-test-account";
import { createTestDocument } from "./_utils/create-test-document";
import { loginAs } from "./_utils/login-as";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { readLoginTokens } from "./_utils/read-login-tokens";
import { uniqueName } from "./_utils/unique-name";

async function issueShortTimeToken(adminToken: string, target: Record<string, string>) {
  const res = await api({ token: adminToken }).post("/api/admin/auth/short-time-token").send(target).expect(200);
  return res.body.data.shortTimeToken as string;
}

describe("업로드 · 다운로드용 short-time token", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await loginAsInitialAdmin();
  });

  test("UPLOAD_DOCUMENT 토큰으로 자료를 올릴 수 있다", async () => {
    const shortTimeToken = await issueShortTimeToken(adminToken, { purpose: "UPLOAD_DOCUMENT" });
    await api({ token: shortTimeToken })
      .post("/api/admin/documents")
      .field("name", uniqueName("doc"))
      .field("versionName", "v1")
      .attach("file", Buffer.from("short-time"), "short-time.txt")
      .expect(201);
  });

  test("DOWNLOAD_DOCUMENT_VERSION 토큰은 쿼리로 넘겨 지정한 버전만 받을 수 있다", async () => {
    const document = await createTestDocument(adminToken);
    const other = await createTestDocument(adminToken);
    const versionId = document.versions[0].id;
    const shortTimeToken = await issueShortTimeToken(adminToken, {
      purpose: "DOWNLOAD_DOCUMENT_VERSION",
      documentId: document.id,
      versionId,
    });

    await api()
      .get(`/api/admin/documents/${document.id}/versions/${versionId}/download?shortTimeToken=${shortTimeToken}`)
      .expect(200);
    await api()
      .get(
        `/api/admin/documents/${other.id}/versions/${other.versions[0].id}/download?shortTimeToken=${shortTimeToken}`,
      )
      .expect(401);
  });

  test("short-time token 으로는 지정한 동작 외의 api 를 호출할 수 없다", async () => {
    const shortTimeToken = await issueShortTimeToken(adminToken, { purpose: "UPLOAD_DOCUMENT" });
    await api({ token: shortTimeToken }).get("/api/admin/documents").expect(401);
    await api({ token: shortTimeToken }).get("/api/admin/auth/me").expect(401);
  });

  test("해당 동작 권한이 없으면 토큰을 발급하지 않는다", async () => {
    const account = await createTestAccount(adminToken, { permissionCodes: ["file.list.access"] });
    const token = readLoginTokens(await loginAs(account)).accessToken;
    const res = await api({ token }).post("/api/admin/auth/short-time-token").send({ purpose: "UPLOAD_DOCUMENT" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("PERMISSION_DENIED");
  });

  test("용도 · 대상 형식이 올바르지 않으면 400", async () => {
    await api({ token: adminToken })
      .post("/api/admin/auth/short-time-token")
      .send({ purpose: "DOWNLOAD_DOCUMENT_VERSION", documentId: "not-uuid" })
      .expect(400);
  });
});
