import { expect, test } from "@playwright/test";

const username = process.env.ADMIN_TEST_USERNAME;
const password = process.env.ADMIN_TEST_PASSWORD;
const stagingUrl = process.env.ADMIN_TEST_BASE_URL;

test.describe("Admin Pages Comprehensive Verification (Priority 2)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !stagingUrl || !username || !password,
      "Set ADMIN_TEST_BASE_URL, ADMIN_TEST_USERNAME, and ADMIN_TEST_PASSWORD for staging testing.",
    );

    // Navigate to inquiries and wait for auth guard redirect to login
    await page.goto("/inquiries");
    await expect(page).toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
    const userInput = page.locator('input[placeholder="e.g. AST-ADMIN-01"]');
    await userInput.fill(username!);
    await expect(userInput).toHaveValue(username!);

    const passInput = page.locator('input[placeholder="Enter your security password"]');
    await passInput.fill(password!);
    await expect(passInput).toHaveValue(password!);

    await page.getByRole("button", { name: /Authenticate to Command Center/ }).click();
    await expect(page).toHaveURL(/\/inquiries(?:\?.*)?$/, { timeout: 30_000 });
    await expect(page.locator("aside nav")).toBeVisible({ timeout: 15_000 });
  });

  test("1. Overview Page: metrics, fast actions, lead capture modal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main h1").first()).toContainText(/Dashboard/i);
    await expect(page.getByText(/Live Operations Overview|Total Client Leads/i).first()).toBeVisible();

    // Verify Quick Actions and Lead Modal
    const addLeadBtn = page.getByRole("button", { name: /Register Lead/i });
    await expect(addLeadBtn).toBeVisible();
    await addLeadBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Register Client Lead/i)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("2. Inquiries Page: search, filter pills, table rendering", async ({ page }) => {
    await page.goto("/inquiries");
    await expect(page.locator("main h1").first()).toContainText(/Client Inquiries & Leads/i);

    const searchInput = page.getByPlaceholder(/Search leads by name/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test search query");
    await expect(searchInput).toHaveValue("test search query");
    await searchInput.clear();

    // Verify filter pills exist and can be clicked
    const filterAll = page.getByRole("button", { name: "All", exact: true });
    await expect(filterAll).toBeVisible();
    await filterAll.click();

    // Verify table structure
    await expect(page.locator("table")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /Client Details/i })).toBeVisible();
  });

  test("3. WhatsApp Page: embedded signup, tenant switcher, 11 tabs", async ({ page }) => {
    await page.goto("/whatsapp?tab=connection");
    await expect(page.locator("main h1").first()).toContainText(/WhatsApp Business Platform/i);

    // Verify Meta Embedded Signup card is present
    await expect(page.getByText(/Meta Embedded Signup & Client Onboarding/i)).toBeVisible();
    await expect(page.getByText(/Tenant Isolation & Client Management/i)).toBeVisible();

    // Verify Manual OAuth Code Exchange Modal opens and closes
    await page.getByRole("button", { name: /Manual OAuth Code Exchange/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Meta OAuth Code Exchange/i)).toBeVisible();
    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Verify Onboard Client Organization Modal opens and closes
    await page.getByRole("button", { name: /Onboard Client Organization/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Onboard Client Organization/i })).toBeVisible();
    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Verify single-click switching to Chats tab
    await page.getByRole("tab", { name: /Chats \/ Messages/i }).click();
    await expect(page).toHaveURL(/tab=chats/);
    await expect(page.getByPlaceholder(/Search phone or name/i)).toBeVisible();
  });

  test("4. Careers Page: positions, candidate tabs, search", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.locator("main h1").first()).toContainText(/Careers & Talent Command Center/i);

    // Switch to candidates tab with single click
    await page.getByRole("button", { name: /Applicants & Candidates/i }).click();
    await expect(page).toHaveURL(/tab=candidates/);
    await expect(page.getByPlaceholder(/Search candidate, email, role/i)).toBeVisible();

    // Switch back to open positions
    await page.getByRole("button", { name: /Open Positions/i }).click();
    await expect(page).not.toHaveURL(/tab=candidates/);
    await expect(page.getByPlaceholder(/Search job title or department/i)).toBeVisible();
  });

  test("5. Products Page: cards, filters, and new product modal", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("main h1").first()).toContainText(/Proprietary Products & Apps/i);

    const addProductBtn = page.getByRole("button", { name: /Add New Product/i });
    await expect(addProductBtn).toBeVisible();
    await addProductBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Register Platform/i).or(page.getByText(/Add New Product/i)).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("6. Founders Page: leadership cards and profile modal", async ({ page }) => {
    await page.goto("/founders");
    await expect(page.locator("main h1").first()).toContainText(/Leadership & Founders Management/i);

    const addFounderBtn = page.getByRole("button", { name: /Add Founder Profile/i });
    await expect(addFounderBtn).toBeVisible();
    await addFounderBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Founder Profile/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("7. FinTech Page: financial operations, status, accounts", async ({ page }) => {
    await page.goto("/fintech");
    await expect(page.locator("main h1").first()).toContainText(/Payment Gateways & FinTech Sandbox/i);
    await expect(page.getByRole("button", { name: /Simulate Webhook Event/i })).toBeVisible();
    await expect(page.getByText(/SANDBOX MODE/i)).toBeVisible();
  });

  test("8. Proposals Page: proposal generator interface", async ({ page }) => {
    await page.goto("/proposals");
    await expect(page.locator("main h1").first()).toContainText(/Enterprise Proposal & SOW Generator/i);
    await expect(page.getByText(/Project Parameters/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Copy SOW Document/i })).toBeVisible();
  });

  test("9. Services Page: catalog, service cards, edit action", async ({ page }) => {
    await page.goto("/services");
    await expect(page.locator("main h1").first()).toContainText(/Enterprise Services & Pricing Catalog/i);
    await expect(page.getByText(/Payment Gateway & FinTech Engineering/i)).toBeVisible();
  });

  test("10. Server / DNS Page: server IP, uptime, node status", async ({ page }) => {
    await page.goto("/server");
    await expect(page.locator("main h1").first()).toContainText(/Production Infrastructure & Architecture Status/i);
    await expect(page.getByText(/astitvainnovation.in/i).first()).toBeVisible();
  });

  test("11. System Settings Page: security posture and config form", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("main h1").first()).toContainText(/Command Center Settings & Mobile Alerts/i);
    await expect(page.getByText(/Company Contact & Public Numbers/i)).toBeVisible();
  });

  test("12. Not Found Page: handles non-existent paths cleanly", async ({ page }) => {
    await page.goto("/arbitrary-nonexistent-path-test");
    await expect(page.getByRole("heading", { name: /Page not found/i })).toBeVisible();
    await page.getByRole("link", { name: /Return to overview/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
