import { expect, type Page } from "@playwright/test";

export async function expectToast(page: Page, message: string) {
  await expect(page.getByRole("status").filter({ hasText: message })).toBeVisible();
}
