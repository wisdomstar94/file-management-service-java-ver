import { expect, test } from "@playwright/test";
import { expectToast } from "./_utils/expect-toast";
import { loginAsInitialAdmin } from "./_utils/login-as-initial-admin";
import { uniqueName } from "./_utils/unique-name";

test.describe("자료 관리", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInitialAdmin(page);
  });

  test("자료 등록 → 새 버전 등록 → 기본 버전 고정 → 외부 공개 링크 생성", async ({ page }) => {
    const name = uniqueName("e2e 자료");
    await page.getByRole("button", { name: "새 자료 등록" }).click();
    const createDialog = page.getByRole("dialog", { name: "새 자료 등록" });
    await createDialog.getByLabel("자료명").fill(name);
    await createDialog.getByLabel("버전명").fill("v1");
    await createDialog.locator('input[type="file"]').setInputFiles({
      name: "가이드 v1.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 v1"),
    });
    await createDialog.getByRole("button", { name: "등록" }).click();

    await expect(page).toHaveURL(/\/documents\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.getByRole("cell", { name: /가이드 v1\.pdf/ })).toBeVisible();

    await page.getByRole("button", { name: "새 버전 등록" }).click();
    const versionDialog = page.getByRole("dialog", { name: "새 버전 등록" });
    await versionDialog.getByLabel("버전명").fill("v2");
    await versionDialog.locator('input[type="file"]').setInputFiles({
      name: "가이드 v2.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 v2"),
    });
    await versionDialog.getByRole("button", { name: "등록" }).click();
    await expectToast(page, "등록했습니다");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText("v2");
    await expect(rows.first()).toContainText("최신");

    await page.getByLabel("기본 버전").selectOption({ label: "v1" });
    await page.getByRole("button", { name: "변경사항 저장" }).click();
    await expectToast(page, "변경사항을 저장했습니다");
    await page.reload();
    await expect(page.getByText("v1 고정")).toBeVisible();

    await page.getByRole("button", { name: "링크 생성" }).click();
    const linkDialog = page.getByRole("dialog", { name: "외부 공개 링크 생성" });
    await linkDialog.getByLabel("총 다운로드 허용 수").fill("5");
    await linkDialog.getByRole("switch", { name: "비밀번호 설정" }).click();
    await linkDialog.locator('input[name="password"]').fill("share1234");
    await linkDialog.getByRole("button", { name: "생성" }).click();
    await expectToast(page, "링크를 생성했습니다");
    await expect(page.getByText("/ 5")).toBeVisible();
    await expect(page.getByText("설정됨")).toBeVisible();
    await expect(page.getByText(/\/s\/[A-Za-z0-9_-]{22}/)).toBeVisible();
  });

  test("목록 검색 · 선택 삭제", async ({ page }) => {
    const keyword = uniqueName("검색대상");
    for (const suffix of ["A", "B"]) {
      await page.getByRole("button", { name: "새 자료 등록" }).click();
      const dialog = page.getByRole("dialog", { name: "새 자료 등록" });
      await dialog.getByLabel("자료명").fill(`${keyword} ${suffix}`);
      await dialog.getByLabel("버전명").fill("v1");
      await dialog
        .locator('input[type="file"]')
        .setInputFiles({ name: "a.txt", mimeType: "text/plain", buffer: Buffer.from(suffix) });
      await dialog.getByRole("button", { name: "등록" }).click();
      await expect(page).toHaveURL(/\/documents\/[0-9a-f-]{36}$/);
      await page.goto("/documents");
    }

    await page.getByLabel("자료명 검색").fill(keyword);
    await page.getByLabel("자료명 검색").press("Enter");
    await expect(page.locator("tbody tr")).toHaveCount(2);

    await page.getByLabel("전체 선택").check();
    await page.getByRole("button", { name: "선택 삭제" }).click();
    await page.getByRole("dialog", { name: "삭제하시겠습니까?" }).getByRole("button", { name: "삭제" }).click();
    await expectToast(page, "삭제했습니다");
    await expect(page.getByText("등록된 자료가 없습니다.")).toBeVisible();
  });
});
