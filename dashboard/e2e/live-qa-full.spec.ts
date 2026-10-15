import { expect, test, type Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const username = process.env.ADMIN_TEST_USERNAME || "AST-ADMIN-01";
const password = process.env.ADMIN_TEST_PASSWORD || "StagingTestPass123!";
const stagingUrl = process.env.ADMIN_TEST_BASE_URL || "http://127.0.0.1:4173";

const screenshotsDir = path.resolve(process.cwd(), "e2e-screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.locator('input[placeholder="e.g. AST-ADMIN-01"]').fill(username);
  await page.locator('input[placeholder="Enter your security password"]').fill(password);
  await page.getByRole("button", { name: /Authenticate to Command Center/i }).click();
  await expect(page.locator("aside nav")).toBeVisible({ timeout: 15_000 });
}

test.describe.serial("Astitva Innovation Admin Panel — Comprehensive Live QA Suite", () => {
  let pageErrors: string[] = [];
  let failedRequests: string[] = [];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    failedRequests = [];

    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("requestfailed", (req) => {
      if (["script", "stylesheet", "xhr", "fetch"].includes(req.resourceType())) {
        failedRequests.push(`${req.resourceType()}: ${req.url()}`);
      }
    });
  });

  test("1. Authentication: Guards, Validation, Rejections, and Successful Session Redirect", async ({ page }) => {
    // 1. Unauthenticated direct access to protected route must redirect to login with from param
    await page.goto("/inquiries");
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
    await expect(page.getByRole("heading", { name: /Security Login|Command Center/i })).toBeVisible();

    // 2. Missing inputs should be caught by HTML5 / React form validation
    const submitBtn = page.getByRole("button", { name: /Authenticate to Command Center/i });
    await submitBtn.click();
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);

    // 3. Invalid credentials must be rejected by backend API with clear error toast/message
    const userInput = page.locator('input[placeholder="e.g. AST-ADMIN-01"]');
    const passInput = page.locator('input[placeholder="Enter your security password"]');
    await userInput.fill(username);
    await passInput.fill("WrongPassword999!");
    await submitBtn.click();
    await expect(page.getByText(/Access Denied|Invalid Administrator/i)).toBeVisible({ timeout: 10_000 });

    // 4. Valid credentials successfully authenticate and redirect back to originally requested route
    await passInput.fill(password);
    await submitBtn.click();
    await expect(page).toHaveURL(/\/inquiries(?:\?.*)?$/, { timeout: 15_000 });
    await expect(page.locator("aside nav")).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, "00-auth-success.png") });

    expect(pageErrors).toEqual([]);
  });

  test("2. Full Page Visual Rendering and DOM Validation across all 12 Admin Routes", async ({ page }) => {
    await loginAsAdmin(page);

    const routes = [
      { name: "Overview", path: "/", screenshot: "01-overview.png", checkText: /Live Operations Overview|Total Client Leads/i },
      { name: "Inquiries & Leads", path: "/inquiries", screenshot: "02-inquiries.png", checkText: /Client Inquiries & Leads/i },
      { name: "WhatsApp Platform", path: "/whatsapp", screenshot: "03-whatsapp.png", checkText: /WhatsApp Business Platform/i },
      { name: "Careers & Hiring", path: "/careers", screenshot: "04-careers.png", checkText: /Careers & Talent Command Center/i },
      { name: "Products & Apps", path: "/products", screenshot: "05-products.png", checkText: /Proprietary Products & Apps/i },
      { name: "Founders & Team", path: "/founders", screenshot: "06-founders.png", checkText: /Leadership & Founders Management/i },
      { name: "FinTech Operations", path: "/fintech", screenshot: "07-fintech.png", checkText: /Payment Gateways & FinTech Sandbox/i },
      { name: "Proposal Generator", path: "/proposals", screenshot: "08-proposals.png", checkText: /Enterprise Proposal & SOW Generator/i },
      { name: "Services & Pricing", path: "/services", screenshot: "09-services.png", checkText: /Enterprise Services & Pricing Catalog/i },
      { name: "Server & DNS", path: "/server", screenshot: "10-server.png", checkText: /Production Infrastructure & Architecture Status/i },
      { name: "System Settings", path: "/settings", screenshot: "11-settings.png", checkText: /Command Center Settings & Mobile Alerts/i },
      { name: "Not Found", path: "/nonexistent-route-qa-test", screenshot: "12-notfound.png", checkText: /Page not found/i },
    ];

    for (const r of routes) {
      await page.goto(r.path);
      await expect(page.getByText(r.checkText).first()).toBeVisible({ timeout: 10_000 });
      // Assert no horizontal body overflow
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      expect(hasHorizontalScroll).toBe(false);
      await page.screenshot({ path: path.join(screenshotsDir, r.screenshot), fullPage: false });
    }

    expect(pageErrors).toEqual([]);
  });

  test("3. Inquiries & Leads CRUD Flow: Create, Search, Filter, Persist across Refresh, and Delete", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/inquiries");

    // 1. Open Register Lead Modal
    const addLeadBtn = page.getByRole("button", { name: /Register Lead/i }).first();
    await addLeadBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // 2. Fill in lead details
    const testLeadName = `QA Auto Lead ${Date.now()}`;
    await page.getByPlaceholder("e.g. Ramesh Verma").fill(testLeadName);
    await page.getByPlaceholder("client@company.com").fill("qa-client@astitvainnovation.in");
    await page.getByPlaceholder("+91 98765 43210").fill("+91 99887 76655");
    await page.getByPlaceholder("Technical specifications, timelines, or notes...").fill("Verified automated end-to-end live testing inquiry.");

    // 3. Submit
    await page.getByRole("button", { name: "Register Lead in Database" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(/Lead Registered/i).first()).toBeVisible();

    // 4. Verify record appears in table
    await expect(page.getByText(testLeadName).first()).toBeVisible({ timeout: 10_000 });

    // 5. Search for the created lead
    const searchInput = page.getByPlaceholder(/Search leads by name/i);
    await searchInput.fill(testLeadName);
    await expect(page.getByText(testLeadName).first()).toBeVisible();
    await searchInput.clear();

    // 6. Test Status filter pills
    const filterNew = page.getByRole("button", { name: "New", exact: true });
    await filterNew.click();
    await expect(page.getByText(testLeadName).first()).toBeVisible();
    const filterAll = page.getByRole("button", { name: "All", exact: true });
    await filterAll.click();

    // 7. Refresh page and verify backend persistence
    await page.reload();
    await expect(page.getByText(testLeadName).first()).toBeVisible({ timeout: 10_000 });

    // 8. Delete test lead
    const row = page.locator("tr", { hasText: testLeadName });
    await row.locator("button[title='Delete Lead']").or(row.locator("button.text-destructive")).first().click();
    await expect(page.getByText(/Lead Removed/i).first()).toBeVisible();
    await expect(page.getByText(testLeadName)).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });

  test("4. Products & Flagship Apps CRUD Flow: Create, Toggle, Persist, and Delete", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/products");

    // 1. Open Add Product modal
    await page.getByRole("button", { name: /Add New Product/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const testProductName = `QA Platform ${Date.now()}`;
    await page.locator('input[placeholder*="Meethi Chat"]').fill(testProductName);
    await page.locator('input[placeholder*="Social Voice"]').fill("Automated Live QA Platform");
    await page.locator('textarea[placeholder*="Detailed overview"]').fill("Enterprise automation testing platform verification.");

    // 2. Submit form
    await page.getByRole("button", { name: "Save & Publish" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(testProductName).first()).toBeVisible({ timeout: 10_000 });

    // 3. Refresh and verify persistence
    await page.reload();
    await expect(page.getByText(testProductName).first()).toBeVisible({ timeout: 10_000 });

    // 4. Delete the test product
    const card = page.locator("div").filter({ has: page.getByRole("heading", { name: testProductName }) }).first();
    const deleteBtn = card.locator("button.text-destructive").or(card.locator("button").filter({ has: page.locator("svg.lucide-trash-2") })).first();
    page.once("dialog", (dialog) => dialog.accept());
    await deleteBtn.click();
    await expect(page.getByText(testProductName)).toHaveCount(0, { timeout: 10_000 });

    expect(pageErrors).toEqual([]);
  });

  test("5. Careers & Hiring CRUD Flow: Post Job, Tab Switching, and Job Deletion", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/careers");

    // 1. Switch to Candidates tab and verify candidate table
    await page.getByRole("button", { name: /Applicants & Candidates/i }).click();
    await expect(page).toHaveURL(/tab=candidates/);
    await expect(page.getByPlaceholder(/Search candidate, email, role/i)).toBeVisible();

    // 2. Switch back to Open Positions tab
    await page.getByRole("button", { name: /Open Positions/i }).click();
    await expect(page).not.toHaveURL(/tab=candidates/);

    // 3. Post New Job
    await page.getByRole("button", { name: /Post New Position/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const testJobTitle = `QA Engineer Lead ${Date.now()}`;
    await page.locator('input[placeholder*="Senior Full-Stack"]').fill(testJobTitle);
    await page.locator('textarea[placeholder*="Overview of the position"]').fill("Lead automated testing and CI/CD quality gates.");
    await page.getByRole("button", { name: "Publish Job" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(testJobTitle).first()).toBeVisible({ timeout: 10_000 });

    // 4. Delete the test job
    const jobCard = page.locator("div.p-5").filter({ has: page.getByRole("heading", { name: testJobTitle }) }).first();
    const deleteBtn = jobCard.getByRole("button", { name: /Delete Job/i });
    page.once("dialog", (dialog) => dialog.accept());
    await deleteBtn.click();
    await expect(page.getByText(testJobTitle)).toHaveCount(0, { timeout: 10_000 });

    expect(pageErrors).toEqual([]);
  });

  test("6. Founders Management CRUD Flow: Add Founder Profile and Delete", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/founders");

    // 1. Open Add Founder modal
    await page.getByRole("button", { name: /Add Founder Profile/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const testFounderName = `Dr. QA Founder ${Date.now()}`;
    await page.locator('input[placeholder*="Shivansh Kamal"]').fill(testFounderName);
    await page.locator('input[placeholder*="Chief Executive"]').fill("VP of Quality Assurance");
    await page.locator('input[placeholder*="Principal Architect"]').fill("VP QA & Automation");
    await page.locator('textarea[placeholder*="Brief high-level summary"]').fill("Executive test engineering leadership.");
    await page.locator('textarea[placeholder*="Comprehensive overview"]').fill("Built high-reliability automated QA systems.");

    // 2. Submit
    await page.getByRole("button", { name: "Save Founder Profile" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(testFounderName).first()).toBeVisible({ timeout: 10_000 });

    // 3. Delete test founder
    const founderCard = page.locator("div.p-6").filter({ has: page.getByRole("heading", { name: testFounderName }) }).first();
    const deleteBtn = founderCard.getByRole("button", { name: /Delete Founder/i }).or(founderCard.locator("button.text-destructive")).first();
    page.once("dialog", (dialog) => dialog.accept());
    await deleteBtn.click();
    await expect(page.getByText(testFounderName)).toHaveCount(0, { timeout: 10_000 });

    expect(pageErrors).toEqual([]);
  });

  test("7. Interactive Pages: FinTech Simulation, Proposal Generator, Services Switch, and System Settings", async ({ page, context }) => {
    try {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    } catch {
      // Ignored if browser context does not support explicit clipboard permission grants
    }
    await loginAsAdmin(page);

    // FinTech: Webhook Simulation
    await page.goto("/fintech");
    const simBtn = page.getByRole("button", { name: /Simulate Webhook Event/i });
    await expect(simBtn).toBeVisible();
    await simBtn.click();
    await expect(page.getByText(/Test Webhook Dispatched/i).first()).toBeVisible({ timeout: 10_000 });

    // Proposals: Text Copy Action
    await page.goto("/proposals");
    const copySowBtn = page.getByRole("button", { name: /Copy SOW Document/i });
    await expect(copySowBtn).toBeVisible();
    await copySowBtn.click();
    await expect(page.getByText(/Proposal Copied/i).first()).toBeVisible();

    // Services: Catalog Switch
    await page.goto("/services");
    const switchToggle = page.locator('button[role="switch"]').first();
    await expect(switchToggle).toBeVisible();
    await switchToggle.click();
    await expect(page.getByText(/Service Status Updated/i).first()).toBeVisible();
    await switchToggle.click(); // toggle back

    // Settings: Redacted Secret Verification & Form Save
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText(/Command Center Settings/i);
    // Verify Telegram bot token is write-only / redacted
    const botTokenInput = page.locator('input[type="password"]').first();
    await expect(botTokenInput).toHaveValue("");
    await expect(page.getByRole("status")).toContainText(/token is stored securely|No token is currently configured/);
    // Save Settings
    const saveSettingsBtn = page.getByRole("button", { name: "Save Company Profile" });
    await saveSettingsBtn.click();
    await expect(page.getByText(/Settings Saved Successfully/i).first()).toBeVisible({ timeout: 10_000 });

    expect(pageErrors).toEqual([]);
  });

  test("8. WhatsApp Platform: All 11 Tabs, Meta Embedded Signup Dialogs, and Tenant Lifecycle", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/whatsapp?tab=overview");

    const tabs = [
      "overview",
      "connection",
      "chats",
      "templates",
      "contacts",
      "webhooks",
      "delivery-logs",
      "evidence",
      "checklist",
      "diagnostics",
      "security",
    ];

    // Single-click navigation through every one of the 11 tabs
    for (const tabKey of tabs) {
      const tabTrigger = page.locator(`button[data-state][role="tab"]`).filter({ hasText: new RegExp(tabKey.replace("-", " "), "i") }).first();
      await tabTrigger.click();
      await expect(page).toHaveURL(new RegExp(`[?&]tab=${tabKey}(?:&|$)`));
      await expect(tabTrigger).toHaveAttribute("aria-selected", "true");
    }

    // On Connection tab: verify Meta Embedded Signup and Tenant Operations
    await page.goto("/whatsapp?tab=connection");
    await expect(page.getByText(/Meta Embedded Signup & Client Onboarding/i)).toBeVisible();
    await expect(page.getByText(/Pending Meta Review/i).first()).toBeVisible();

    // 1. Manual OAuth Code Exchange Modal
    await page.getByRole("button", { name: /Manual OAuth Code Exchange/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Meta OAuth Code Exchange/i)).toBeVisible();
    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // 2. Onboard Client Organization Modal
    await page.getByRole("button", { name: /Onboard Client Organization/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const testTenantName = `Live QA Client ${Date.now()}`;
    await page.getByPlaceholder("e.g. Acme Health Corp").fill(testTenantName);
    await page.getByPlaceholder("e.g. contact@acme.com").fill("qa-client@example.com");
    await page.getByPlaceholder("e.g. 1029384756", { exact: true }).fill("109876543210987");
    await page.getByPlaceholder("e.g. 1092837465", { exact: true }).fill("209876543210987");
    await page.getByRole("button", { name: "Register Client Organization" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(/Client Onboarded/i).first()).toBeVisible({ timeout: 10_000 });

    // 3. Switch Tenant context
    await expect(page.getByText(testTenantName).first()).toBeVisible();
    const clientCard = page.locator("div.p-4").filter({ has: page.getByText(testTenantName) }).first();
    await clientCard.getByRole("button", { name: /Switch to Tenant/i }).click();
    await expect(page.getByText(/Active Tenant Switched/i).first()).toBeVisible({ timeout: 10_000 });

    // 4. Switch back to Primary Tenant
    const primaryCard = page.locator("div.p-4").filter({ has: page.getByText(/Astitva Innovation/i) }).first();
    await primaryCard.getByRole("button", { name: /Switch to Tenant/i }).click();
    await expect(page.getByText(/Active Tenant Switched/i).first()).toBeVisible({ timeout: 10_000 });

    // 5. Delete test client organization
    page.once("dialog", (dialog) => dialog.accept());
    const deleteTenantBtn = clientCard.getByRole("button", { name: /Remove Tenant/i }).or(clientCard.locator("button.text-destructive")).first();
    await deleteTenantBtn.click();
    await expect(page.getByText(/Tenant Removed/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(testTenantName)).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });

  test("9. Responsive Viewports & Mobile Drawer Navigation", async ({ page }) => {
    await loginAsAdmin(page);

    const viewports = [
      { name: "desktop", width: 1440, height: 900 },
      { name: "laptop", width: 1366, height: 768 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "mobile", width: 390, height: 844 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await expect(page.getByText(/Live Operations Overview|Total Client Leads/i).first()).toBeVisible();
      await page.screenshot({ path: path.join(screenshotsDir, `responsive-${vp.name}-${vp.width}.png`) });

      if (vp.name === "mobile") {
        const menuBtn = page.getByRole("button", { name: "Toggle navigation" });
        await expect(menuBtn).toBeVisible();
        await menuBtn.click();
        await expect(menuBtn).toHaveAttribute("aria-expanded", "true");
        // Click mobile navigation link
        await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Products & Apps" }).click();
        await expect(page).toHaveURL(/\/products$/);
        await expect(menuBtn).toHaveAttribute("aria-expanded", "false");
      }
    }

    expect(pageErrors).toEqual([]);
  });

  test("10. Logout and Session Invalidation", async ({ page }) => {
    await loginAsAdmin(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/inquiries");

    // Click Logout button in sidebar
    const logoutBtn = page.getByRole("button", { name: /Sign Out|Logout|Exit/i }).or(page.locator("aside button").filter({ has: page.locator("svg.lucide-log-out") }));
    await logoutBtn.click();
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);

    // Attempting to visit /inquiries again must redirect to /login
    await page.goto("/inquiries");
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);

    expect(pageErrors).toEqual([]);
  });
});
