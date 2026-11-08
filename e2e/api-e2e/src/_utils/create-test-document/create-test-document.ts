import { api } from "../api-client";
import { uniqueName } from "../unique-name";

/** 최초 관리자 토큰으로 첫 버전 파일과 함께 자료를 만든다. */
export async function createTestDocument(adminToken: string, props: { fileName?: string; content?: string } = {}) {
  const res = await api({ token: adminToken })
    .post("/api/admin/documents")
    .field("name", uniqueName("doc"))
    .field("versionName", "v1")
    .attach("file", Buffer.from(props.content ?? "version-1"), props.fileName ?? "first.txt")
    .expect(201);
  return res.body.data as { id: string; versions: { id: string; versionName: string }[] };
}
