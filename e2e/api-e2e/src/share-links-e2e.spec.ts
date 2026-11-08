import type { Response } from "supertest";
import { BASE_SHARE_LINK } from "./_consts/base-share-link";
import { USER_WEB_ORIGIN } from "./_consts/user-web-origin";
import { addTestVersion } from "./_utils/add-test-version";
import { api } from "./_utils/api-client";
import { createTestDocument } from "./_utils/create-test-document";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { readSetCookie } from "./_utils/read-set-cookie";

describe("외부 공개 링크", () => {
  let adminToken: string;
  let document: { id: string; versions: { id: string; versionName: string }[] };

  beforeAll(async () => {
    adminToken = await loginAsInitialAdmin();
    const created = await createTestDocument(adminToken);
    document = { id: created.id, versions: (await addTestVersion(adminToken, created.id, "v2", "version-2")).versions };
  });

  const createLink = async (body: Record<string, unknown>) => {
    const res = await api({ token: adminToken })
      .post(`/api/admin/documents/${document.id}/share-links`)
      .send({ ...BASE_SHARE_LINK, ...body });
    expect(res.status).toBe(201);
    return res.body.data as { id: string; shareLinkKey: string; availability: string };
  };
  const publicApi = (ip = "198.51.100.10", headers: Record<string, string> = {}) => api({ ip, headers });
  /** 다운로드에 실패하면 실패 사유 · 시각을 쿼리로 담아 링크 화면으로 303 리다이렉트한다. */
  const expectDownloadErrorRedirect = (res: Response, shareLinkKey: string, code: string) => {
    expect(res.status).toBe(303);
    const location = new URL(res.headers.location ?? "");
    expect(`${location.origin}${location.pathname}`).toBe(`${USER_WEB_ORIGIN}/s/${shareLinkKey}`);
    expect(location.searchParams.get("downloadError")).toBe(code);
    expect(Math.abs(Date.now() - Number(location.searchParams.get("timestamp")))).toBeLessThan(60_000);
  };
  const v1 = () => document.versions.find((v) => v.versionName === "v1")?.id ?? "";
  const v2 = () => document.versions.find((v) => v.versionName === "v2")?.id ?? "";

  test("비밀번호 없는 링크 : 기본 버전만 받을 수 있고, 다운로드 수가 올라간다", async () => {
    const link = await createLink({});
    expect((await publicApi().get(`/api/public/share-links/${link.shareLinkKey}`)).body.data.state).toBe("OPEN");

    const detail = await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/detail`).expect(200);
    expect(detail.body.data.defaultVersion.versionName).toBe("v2");
    expect(detail.body.data.otherVersions).toBeNull();

    await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/versions/${v2()}/download`).expect(200);
    expectDownloadErrorRedirect(
      await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/versions/${v1()}/download`),
      link.shareLinkKey,
      "NOT_FOUND",
    );
    const after = await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/detail`).expect(200);
    expect(after.body.data.downloadStatus).toEqual({ downloadCount: 1, maxDownloadCount: null });
  });

  test("비밀번호 링크 : 잠금 해제 전에는 자료 정보를 주지 않고, 비밀번호를 바꾸면 기존 해제 토큰이 무효", async () => {
    const link = await createLink({ password: "share1234" });
    const base = `/api/public/share-links/${link.shareLinkKey}`;
    expect((await publicApi().get(base)).body.data.state).toBe("PASSWORD_REQUIRED");
    expect((await publicApi().get(`${base}/detail`)).status).toBe(401);
    expect((await publicApi().post(`${base}/unlock`).send({ password: "wrong" })).status).toBe(401);

    const unlocked = await publicApi().post(`${base}/unlock`).send({ password: "share1234" }).expect(200);
    expect(unlocked.body.data).toEqual({ expiresAt: expect.any(String) });
    const unlockCookieName = `fms_share_unlock_${link.shareLinkKey}`;
    expect(unlocked.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringMatching(new RegExp(`^${unlockCookieName}=.+; Path=${base};.*HttpOnly`))]),
    );
    const unlockToken = readSetCookie(unlocked, unlockCookieName) ?? "";
    const withToken = publicApi("198.51.100.10", { Cookie: `${unlockCookieName}=${unlockToken}` });
    expect((await withToken.get(`${base}/detail`)).status).toBe(200);
    expect((await withToken.get(`${base}/versions/${v2()}/download`)).status).toBe(200);
    // 잠금 해제 없이 다운로드 주소로 오면 실패 사유 없이 링크 화면으로 돌려보내 비밀번호를 다시 받는다.
    const locked = await publicApi().get(`${base}/versions/${v2()}/download`).expect(303);
    expect(locked.headers.location).toBe(`${USER_WEB_ORIGIN}/s/${link.shareLinkKey}`);

    await api({ token: adminToken })
      .patch(`/api/admin/documents/${document.id}/share-links/${link.id}`)
      .send({ password: "changed99" })
      .expect(200);
    expect((await withToken.get(`${base}/detail`)).status).toBe(401);
  });

  test("다운로드 허용 수를 넘으면 CONFLICT 로 돌려보내고, 동시에 요청해도 허용 수만큼만 성공한다", async () => {
    const link = await createLink({ maxDownloadCount: 3 });
    const url = `/api/public/share-links/${link.shareLinkKey}/versions/${v2()}/download`;
    const results = await Promise.all(Array.from({ length: 8 }, () => publicApi().get(url)));
    expect(results.filter((res) => res.status === 200)).toHaveLength(3);
    const rejected = results.filter((res) => res.status !== 200);
    expect(rejected).toHaveLength(5);
    for (const res of rejected) {
      expectDownloadErrorRedirect(res, link.shareLinkKey, "CONFLICT");
    }

    const detail = await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/detail`).expect(200);
    expect(detail.body.data.availability).toBe("EXHAUSTED");
  });

  test("기간이 지난 링크는 열리지만 다운로드는 CONFLICT 로 돌려보낸다", async () => {
    const link = await createLink({
      availableFrom: "2020-01-01T00:00:00+09:00",
      availableUntil: "2020-12-31T23:59:59+09:00",
    });
    const detail = await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/detail`).expect(200);
    expect(detail.body.data.availability).toBe("EXPIRED");
    expectDownloadErrorRedirect(
      await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/versions/${v2()}/download`),
      link.shareLinkKey,
      "CONFLICT",
    );
  });

  test("링크의 접근 정책에 막히면 403 ACCESS_POLICY_DENIED", async () => {
    const policy = await api({ token: adminToken })
      .post("/api/admin/access-policy-groups")
      .send({ name: "link-policy", ruleTree: { type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: ["10.0.0.0/8"] } })
      .expect(201);
    const link = await createLink({ accessPolicyGroupId: policy.body.data.id });

    const denied = await publicApi("8.8.8.8").get(`/api/public/share-links/${link.shareLinkKey}`);
    expect(denied.status).toBe(403);
    expect(denied.body.error.code).toBe("ACCESS_POLICY_DENIED");
    expect((await publicApi("10.2.3.4").get(`/api/public/share-links/${link.shareLinkKey}`)).status).toBe(200);
  });

  test("잠금 해제 쿠키가 있어도 허용되지 않은 IP 로 바뀌면 접근 정책에 막힌다", async () => {
    const policy = await api({ token: adminToken })
      .post("/api/admin/access-policy-groups")
      .send({ name: "link-unlock-policy", ruleTree: { type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: ["10.0.0.0/8"] } })
      .expect(201);
    const link = await createLink({ accessPolicyGroupId: policy.body.data.id, password: "share1234" });
    const base = `/api/public/share-links/${link.shareLinkKey}`;

    const unlocked = await publicApi("10.2.3.4").post(`${base}/unlock`).send({ password: "share1234" }).expect(200);
    const unlockCookieName = `fms_share_unlock_${link.shareLinkKey}`;
    const cookie = { Cookie: `${unlockCookieName}=${readSetCookie(unlocked, unlockCookieName) ?? ""}` };
    expect((await publicApi("10.2.3.4", cookie).get(`${base}/detail`)).status).toBe(200);

    const denied = await publicApi("8.8.8.8", cookie).get(`${base}/detail`);
    expect(denied.status).toBe(403);
    expect(denied.body.error.code).toBe("ACCESS_POLICY_DENIED");
    expectDownloadErrorRedirect(
      await publicApi("8.8.8.8", cookie).get(`${base}/versions/${v2()}/download`),
      link.shareLinkKey,
      "ACCESS_POLICY_DENIED",
    );

    // 허용 범위 안에서 IP 가 바뀌는 것은 막지 않는다.
    expect((await publicApi("10.9.9.9", cookie).get(`${base}/detail`)).status).toBe(200);
  });

  test("링크별 기본 버전 지정 · 다른 버전 표시와 다운로드 허용", async () => {
    const link = await createLink({
      defaultVersionMode: "FIXED",
      fixedVersionId: v1(),
      isShowOtherVersions: true,
      isAllowOtherVersionDownload: true,
    });
    const detail = await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/detail`).expect(200);
    expect(detail.body.data.defaultVersion.versionName).toBe("v1");
    expect(detail.body.data.otherVersions.map((v: { versionName: string }) => v.versionName)).toEqual(["v2"]);
    await publicApi().get(`/api/public/share-links/${link.shareLinkKey}/versions/${v2()}/download`).expect(200);

    expect(
      (
        await api({ token: adminToken })
          .post(`/api/admin/documents/${document.id}/share-links`)
          .send({ ...BASE_SHARE_LINK, defaultVersionMode: "FIXED" })
      ).status,
    ).toBe(400);
  });
});
