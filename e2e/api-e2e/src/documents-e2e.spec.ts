import { addTestVersion } from "./_utils/add-test-version";
import { api } from "./_utils/api-client";
import { createTestAccount } from "./_utils/create-test-account";
import { createTestDocument } from "./_utils/create-test-document";
import { loginAs } from "./_utils/login-as";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { readLoginTokens } from "./_utils/read-login-tokens";
import { uniqueName } from "./_utils/unique-name";

const binary = (res: { body: Buffer }) => res.body.toString();

describe("자료 · 버전", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await loginAsInitialAdmin();
  });

  test("자료를 만들면 첫 버전이 최신이자 기본이고, 한글 파일명이 그대로 저장 · 다운로드된다", async () => {
    const document = await createTestDocument(adminToken, { fileName: "브랜드 가이드 v1.txt" });
    const detail = await api({ token: adminToken }).get(`/api/admin/documents/${document.id}`).expect(200);
    expect(detail.body.data.versions).toHaveLength(1);
    expect(detail.body.data.versions[0]).toEqual(
      expect.objectContaining({ fileName: "브랜드 가이드 v1.txt", isLatest: true, isDefault: true }),
    );

    const download = await api({ token: adminToken })
      .get(`/api/admin/documents/${document.id}/versions/${detail.body.data.versions[0].id}/download`)
      .buffer(true)
      .parse((res, done) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(binary(download)).toBe("version-1");
    expect(download.headers["content-disposition"]).toContain(encodeURIComponent("브랜드 가이드 v1.txt"));
  });

  test("새 버전은 기존 버전을 덮어쓰지 않고 이력으로 쌓이며, 기본 버전은 최신을 따른다", async () => {
    const document = await createTestDocument(adminToken);
    const updated = await addTestVersion(adminToken, document.id, "v2", "version-2");
    expect(updated.versions.map((v) => v.versionName)).toEqual(["v2", "v1"]);
    expect(updated.versions[0]).toEqual(expect.objectContaining({ isLatest: true, isDefault: true }));
  });

  test("기본 버전을 고정할 수 있고, 고정한 버전을 지우면 최신 버전으로 돌아간다", async () => {
    const document = await createTestDocument(adminToken);
    const withV2 = await addTestVersion(adminToken, document.id, "v2", "version-2");
    const v1 = withV2.versions.find((v) => v.versionName === "v1");
    const admin = api({ token: adminToken });

    const fixed = await admin
      .patch(`/api/admin/documents/${document.id}`)
      .send({ defaultVersionId: v1?.id })
      .expect(200);
    expect(fixed.body.data.defaultVersionId).toBe(v1?.id);

    const afterDelete = await admin.delete(`/api/admin/documents/${document.id}/versions/${v1?.id}`).expect(200);
    expect(afterDelete.body.data.defaultVersionId).toBeNull();
    expect(afterDelete.body.data.versions[0]).toEqual(expect.objectContaining({ versionName: "v2", isDefault: true }));
  });

  test("마지막 버전은 지울 수 없고, 버전명은 수정할 수 있다", async () => {
    const document = await createTestDocument(adminToken);
    const admin = api({ token: adminToken });
    const versionId = document.versions[0].id;

    expect((await admin.delete(`/api/admin/documents/${document.id}/versions/${versionId}`)).status).toBe(409);
    const renamed = await admin
      .patch(`/api/admin/documents/${document.id}/versions/${versionId}`)
      .send({ versionName: "v1.0.1" })
      .expect(200);
    expect(renamed.body.data.versions[0].versionName).toBe("v1.0.1");
  });

  test("목록은 자료명으로 검색하고, 일괄 삭제하면 상세가 404 가 된다", async () => {
    const keyword = uniqueName("search");
    const admin = api({ token: adminToken });
    const created = await admin
      .post("/api/admin/documents")
      .field("name", `${keyword} 자료`)
      .field("versionName", "v1")
      .attach("file", Buffer.from("x"), "x.txt")
      .expect(201);

    const list = await admin.get(`/api/admin/documents?keyword=${encodeURIComponent(keyword)}`).expect(200);
    expect(list.body.data.items.map((item: { id: string }) => item.id)).toEqual([created.body.data.id]);
    expect(list.body.data.items[0]).toEqual(expect.objectContaining({ versionCount: 1, fixedDefaultVersion: null }));

    await admin
      .delete("/api/admin/documents")
      .send({ ids: [created.body.data.id] })
      .expect(200);
    expect((await admin.get(`/api/admin/documents/${created.body.data.id}`)).status).toBe(404);
  });

  test("새 자료 등록 권한이 없으면 403, 파일 없이 등록하면 400", async () => {
    const account = await createTestAccount(adminToken, { permissionCodes: ["file.list.access"] });
    const token = readLoginTokens(await loginAs(account)).accessToken;
    const denied = await api({ token })
      .post("/api/admin/documents")
      .field("name", "x")
      .field("versionName", "v1")
      .attach("file", Buffer.from("x"), "x.txt");
    expect(denied.status).toBe(403);

    const noFile = await api({ token: adminToken })
      .post("/api/admin/documents")
      .field("name", "x")
      .field("versionName", "v1");
    expect(noFile.status).toBe(400);
  });
});
