import { expect, test } from "@playwright/test";
import { INITIAL_ADMIN } from "./_consts/initial-admin";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { loginThroughUi } from "./_utils/login-through-ui";

test.describe("로그인 · 라우트 그룹", () => {
  test("로그인하지 않으면 로그인 필수 화면에서 로그인 화면으로 보내고, 로그인 후 원래 화면으로 돌아온다", async ({
    page,
  }) => {
    await page.goto("/accounts");
    await expect(page).toHaveURL(/\/login\?next=%2Faccounts/);

    await page.getByLabel("아이디").fill(INITIAL_ADMIN.loginId);
    await page.getByLabel("비밀번호").fill(INITIAL_ADMIN.password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/accounts$/);
    await expect(page.getByRole("heading", { name: "관리자 계정 관리" })).toBeVisible();
  });

  test("비밀번호가 틀리면 오류를 보여준다", async ({ page }) => {
    await loginThroughUi(page, { ...INITIAL_ADMIN, password: "wrong-password" });
    await expect(page.getByRole("alert").filter({ hasText: "아이디 또는 비밀번호" })).toHaveText(
      "아이디 또는 비밀번호가 올바르지 않습니다.",
    );
  });

  test("로그인한 상태에서 로그인 화면에 가면 첫 화면으로 보내고, 로그아웃하면 다시 로그인 화면으로 간다", async ({
    page,
  }) => {
    await loginAsInitialAdmin(page);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/documents$/);

    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/documents");
    await expect(page).toHaveURL(/\/login/);
  });

  test("로그인 여부와 관계없는 화면은 로그인 없이 열린다", async ({ page }) => {
    await page.goto("/forbidden");
    await expect(page.getByRole("heading", { name: "이 화면을 볼 권한이 없습니다" })).toBeVisible();
  });
});
