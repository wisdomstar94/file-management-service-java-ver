import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { createSharedDocument } from "./_utils/create-shared-document";

test.describe("외부 공개 링크 페이지", () => {
  test("기본 버전을 내려받으면 원래 파일명 · 내용 그대로 받고, 다운로드 현황이 올라간다", async ({ page, request }) => {
    const { name, shareLinkKey } = await createSharedDocument(request);
    await page.goto(`/s/${shareLinkKey}`);
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.getByText("안내서 v2.txt")).toBeVisible();
    await expect(page.getByRole("heading", { name: "버전 목록" })).toHaveCount(0);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "v2 다운로드" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("안내서 v2.txt");
    expect(await readFile(await download.path(), "utf-8")).toBe("version-2");

    await expect(page.locator("b").filter({ hasText: /^1$/ })).toBeVisible();
  });

  test("다른 버전 표시 · 다운로드를 허용하면 버전 목록에서 이전 버전도 받을 수 있다", async ({ page, request }) => {
    const { shareLinkKey } = await createSharedDocument(request, {
      link: { isShowOtherVersions: true, isAllowOtherVersionDownload: true, isShowDownloadStatus: false },
    });
    await page.goto(`/s/${shareLinkKey}`);
    await expect(page.getByRole("heading", { name: "버전 목록" })).toBeVisible();
    await expect(page.getByText("다운로드 현황")).toHaveCount(0);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "다운로드", exact: true }).click();
    expect((await downloadPromise).suggestedFilename()).toBe("안내서 v1.txt");
  });

  test("비밀번호 링크는 비밀번호를 맞히기 전까지 자료 정보를 보여주지 않는다", async ({ page, request }) => {
    const { name, shareLinkKey } = await createSharedDocument(request, { link: { password: "share1234" } });
    await page.goto(`/s/${shareLinkKey}`);
    await expect(page.getByRole("heading", { name: "비밀번호가 필요합니다" })).toBeVisible();
    await expect(page.getByText(name)).toHaveCount(0);

    await page.getByLabel("비밀번호").fill("wrong");
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "비밀번호" })).toHaveText("비밀번호가 올바르지 않습니다.");

    await page.getByLabel("비밀번호").fill("share1234");
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();
  });

  test("잠금 해제가 만료된 뒤 다운로드하면 비밀번호를 다시 받고, 다시 맞히면 실패 문구 없이 자료를 보여준다", async ({
    page,
    request,
  }) => {
    const { name, shareLinkKey } = await createSharedDocument(request, { link: { password: "share1234" } });
    await page.goto(`/s/${shareLinkKey}`);
    await page.getByLabel("비밀번호").fill("share1234");
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();

    await page.context().clearCookies({ name: `fms_share_unlock_${shareLinkKey}` });
    await page.getByRole("link", { name: "v2 다운로드" }).click();
    await expect(page.getByRole("heading", { name: "비밀번호가 필요합니다" })).toBeVisible();

    await page.getByLabel("비밀번호").fill("share1234");
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "다운로드" })).toHaveCount(0);
  });

  test("다운로드 실패 문구는 실패 직후 5초 동안만 보이고, 그 뒤 새로고침하면 사라진다", async ({ page, request }) => {
    const { shareLinkKey } = await createSharedDocument(request, { link: { maxDownloadCount: 1 } });
    await page.goto(`/s/${shareLinkKey}`);
    const downloadLink = page.getByRole("link", { name: "v2 다운로드" });
    const downloadHref = await downloadLink.getAttribute("href");
    const downloadPromise = page.waitForEvent("download");
    await downloadLink.click();
    await downloadPromise;

    // api 다운로드 주소로 다시 가면 api 가 실패 사유 · 시각을 쿼리에 담아 링크 화면으로 돌려보낸다.
    await page.goto(`${downloadHref}`);
    await expect(page).toHaveURL(new RegExp(`/s/${shareLinkKey}\\?downloadError=CONFLICT&timestamp=\\d+$`));
    await expect(page.getByRole("alert").filter({ hasText: "다운로드" })).toHaveText(
      "다운로드 가능 기간이 아니거나 허용 횟수를 모두 사용했습니다.",
    );

    const expiredUrl = new URL(page.url());
    expiredUrl.searchParams.set("timestamp", String(Date.now() - 6000));
    await page.goto(expiredUrl.toString());
    await expect(page.getByRole("alert").filter({ hasText: "다운로드" })).toHaveText(
      "다운로드 허용 횟수를 모두 사용했습니다.",
    );
  });

  test("접근 정책에 막히면 차단 화면과 요청 IP 를 보여준다", async ({ browser, request }) => {
    const { name, shareLinkKey } = await createSharedDocument(request, { accessPolicyCidrs: ["10.0.0.0/8"] });

    const outside = await (
      await browser.newContext({ extraHTTPHeaders: { "X-Forwarded-For": "203.0.113.42" } })
    ).newPage();
    await outside.goto(`/s/${shareLinkKey}`);
    await expect(outside.getByRole("heading", { name: "접근이 차단된 링크입니다" })).toBeVisible();
    await expect(outside.getByText(/요청 IP 203\.0\.113\.42/)).toBeVisible();
    await expect(outside.getByText(name)).toHaveCount(0);

    const inside = await (await browser.newContext({ extraHTTPHeaders: { "X-Forwarded-For": "10.9.8.7" } })).newPage();
    await inside.goto(`/s/${shareLinkKey}`);
    await expect(inside.getByRole("heading", { name })).toBeVisible();
  });

  test("다운로드 허용 수를 다 쓰면 다운로드 버튼이 막히고 안내가 보인다", async ({ page, request }) => {
    const { shareLinkKey } = await createSharedDocument(request, { link: { maxDownloadCount: 1 } });
    await page.goto(`/s/${shareLinkKey}`);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "v2 다운로드" }).click();
    await downloadPromise;

    await page.reload();
    await expect(page.getByRole("alert").filter({ hasText: "허용 횟수" })).toHaveText(
      "다운로드 허용 횟수를 모두 사용했습니다.",
    );
    await expect(page.getByRole("link", { name: "v2 다운로드" })).toHaveCount(0);
  });

  test("없는 링크는 안내 화면을 보여준다", async ({ page }) => {
    await page.goto("/s/not-exists-token");
    await expect(page.getByRole("heading", { name: "찾을 수 없는 링크입니다" })).toBeVisible();
  });
});
