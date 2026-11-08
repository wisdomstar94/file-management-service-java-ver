import { api } from "../api-client";

export async function addTestVersion(adminToken: string, documentId: string, versionName: string, content: string) {
  const res = await api({ token: adminToken })
    .post(`/api/admin/documents/${documentId}/versions`)
    .field("versionName", versionName)
    .attach("file", Buffer.from(content), `${versionName}.txt`)
    .expect(201);
  return res.body.data as { versions: { id: string; versionName: string; isLatest: boolean; isDefault: boolean }[] };
}
