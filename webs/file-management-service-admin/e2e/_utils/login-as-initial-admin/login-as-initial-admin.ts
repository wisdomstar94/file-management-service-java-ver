import { expect, type Page } from "@playwright/test";
import { INITIAL_ADMIN } from "../../_consts/initial-admin";
import { loginThroughUi } from "../login-through-ui";

export async function loginAsInitialAdmin(page: Page) {
  await loginThroughUi(page, INITIAL_ADMIN);
  await expect(page).toHaveURL(/\/documents/);
}
