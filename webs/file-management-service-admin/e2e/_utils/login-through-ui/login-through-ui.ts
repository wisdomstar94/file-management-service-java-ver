import type { Page } from "@playwright/test";

export async function loginThroughUi(page: Page, credentials: { loginId: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("아이디").fill(credentials.loginId);
  await page.getByLabel("비밀번호").fill(credentials.password);
  await page.getByRole("button", { name: "로그인" }).click();
}
