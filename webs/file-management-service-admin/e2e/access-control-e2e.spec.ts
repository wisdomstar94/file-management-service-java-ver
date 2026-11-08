import { type Browser, expect, test } from "@playwright/test";
import { expectToast } from "./_utils/expect-toast";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { loginThroughUi } from "./_utils/login-through-ui";
import { uniqueName } from "./_utils/unique-name";

/** 다른 IP 에서 접속하는 사용자를 흉내낸다. 관리자 웹과 브라우저가 직접 호출하는 api 모두 X-Forwarded-For 로 요청 IP 를 판정한다. */
async function openPageFrom(browser: Browser, ip: string) {
  const context = await browser.newContext({ extraHTTPHeaders: { "X-Forwarded-For": ip } });
  return context.newPage();
}

test.describe("권한 · 접근 정책", () => {
  test("권한은 화면에서 생성할 수 없고, 제한된 권한 그룹 · 접근 정책 그룹의 계정은 그 범위에서만 쓸 수 있다", async ({
    page,
    browser,
  }) => {
    await loginAsInitialAdmin(page);

    await page.goto("/permissions/items");
    await expect(page.getByRole("row", { name: /file\.list\.access/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "새 권한 생성" })).toHaveCount(0);

    const groupName = uniqueName("열람 전용");
    await page.goto("/permissions/groups/new");
    await page.getByPlaceholder("예: 자료 운영자").fill(groupName);
    await page.getByRole("checkbox", { name: /file\.list\.access/ }).check();
    await page.getByRole("button", { name: "저장" }).click();
    await expect(page).toHaveURL(/\/permissions\/groups$/);
    await expect(page.getByRole("row", { name: new RegExp(groupName) })).toContainText("1개");

    const policyName = uniqueName("사내망");
    await page.goto("/access-policy-groups/new");
    await page.getByPlaceholder("예: 사내망 전용").fill(policyName);
    await page.getByRole("button", { name: "IP 제한 추가" }).click();
    await page.getByLabel("IP 1").fill("10.0.0.0/8");
    await expect(page.getByText("IP 제한", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "저장" }).click();
    await expect(page).toHaveURL(/\/access-policy-groups$/);

    const loginId = uniqueName("viewer");
    await page.goto("/accounts");
    await page.getByRole("button", { name: "새 관리자 계정 생성" }).click();
    const accountDialog = page.getByRole("dialog", { name: "새 관리자 계정 생성" });
    await accountDialog.getByLabel("아이디").fill(loginId);
    await accountDialog.getByLabel("닉네임").fill("열람자");
    await accountDialog.getByLabel("비밀번호").fill("viewer-password");
    await accountDialog.getByLabel("권한 그룹").selectOption({ label: groupName });
    await accountDialog.getByLabel("접근 정책 그룹").selectOption({ label: policyName });
    await accountDialog.getByRole("button", { name: "생성" }).click();
    await expectToast(page, "관리자 계정을 생성했습니다");
    await expect(page.getByRole("row", { name: new RegExp(loginId) })).toBeVisible();

    const outside = await openPageFrom(browser, "203.0.113.42");
    await loginThroughUi(outside, { loginId, password: "viewer-password" });
    await expect(outside.getByRole("alert").filter({ hasText: "접근 정책" })).toContainText(
      "접근 정책에 의해 차단되었습니다",
    );

    const inside = await openPageFrom(browser, "10.1.2.3");
    await loginThroughUi(inside, { loginId, password: "viewer-password" });
    await expect(inside).toHaveURL(/\/documents$/);
    const navigation = inside.getByRole("navigation").first();
    await expect(navigation.getByRole("link", { name: "자료 관리" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "관리자 계정 관리" })).toHaveCount(0);
    await expect(inside.getByRole("button", { name: "새 자료 등록" })).toBeDisabled();
    await inside.goto("/accounts");
    await expect(inside.getByRole("heading", { name: "이 화면을 볼 권한이 없습니다" })).toBeVisible();

    await page.goto("/access-policy-groups");
    await page
      .getByRole("row", { name: new RegExp(policyName) })
      .getByRole("link", { name: "상세" })
      .click();
    await page.getByLabel("IP 1").fill("192.168.0.0/16");
    await page.getByRole("button", { name: "저장" }).click();
    await expect(page).toHaveURL(/\/access-policy-groups$/);

    await inside.goto("/documents");
    await expect(inside.getByRole("heading", { name: "접근 정책에 의해 차단되었습니다" })).toBeVisible();
    await expect(inside.getByText("IP 제한 · 허용 목록에 없음")).toBeVisible();
    await expect(inside.getByText("10.1.2.3")).toBeVisible();
  });
});
