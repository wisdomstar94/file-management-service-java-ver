import { randomUUID } from "node:crypto";
import type { CREATE_SHARE_LINK_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import { type APIRequestContext, expect } from "@playwright/test";
import { API_BASE_URL } from "./_consts/api-base-url";
import { DEFAULT_LINK } from "./_consts/default-share-link";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";

/**
 * api 로 「v1 · v2 두 버전을 가진 자료 + 공개 링크」 를 만든다.
 * `accessPolicyCidrs` 를 주면 그 IP 만 허용하는 접근 정책을 링크에 건다.
 */
export async function createSharedDocument(
  request: APIRequestContext,
  props: { link?: Partial<ReqBody<typeof CREATE_SHARE_LINK_API>>; accessPolicyCidrs?: string[] } = {},
) {
  const headers = await loginAsInitialAdmin(request);
  const name = `공유 자료 ${randomUUID().slice(0, 8)}`;
  const created = await request.post(`${API_BASE_URL}/api/admin/documents`, {
    headers,
    multipart: {
      name,
      versionName: "v1",
      file: { name: "안내서 v1.txt", mimeType: "text/plain", buffer: Buffer.from("version-1") },
    },
  });
  expect(created.status()).toBe(201);
  const documentId = (await created.json()).data.id as string;
  const withV2 = await request.post(`${API_BASE_URL}/api/admin/documents/${documentId}/versions`, {
    headers,
    multipart: {
      versionName: "v2",
      file: { name: "안내서 v2.txt", mimeType: "text/plain", buffer: Buffer.from("version-2") },
    },
  });
  expect(withV2.status()).toBe(201);

  let accessPolicyGroupId: string | null = null;
  if (props.accessPolicyCidrs) {
    const policy = await request.post(`${API_BASE_URL}/api/admin/access-policy-groups`, {
      headers,
      data: {
        name: `링크 정책 ${randomUUID().slice(0, 8)}`,
        ruleTree: { type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: props.accessPolicyCidrs },
      },
    });
    accessPolicyGroupId = (await policy.json()).data.id;
  }

  const link = await request.post(`${API_BASE_URL}/api/admin/documents/${documentId}/share-links`, {
    headers,
    data: { ...DEFAULT_LINK, accessPolicyGroupId, ...props.link },
  });
  expect(link.status()).toBe(201);
  return { name, shareLinkKey: (await link.json()).data.shareLinkKey as string };
}
