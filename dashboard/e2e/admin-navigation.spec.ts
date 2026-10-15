import { expect, test } from "@playwright/test";

const username = process.env.ADMIN_TEST_USERNAME;
const password = process.env.ADMIN_TEST_PASSWORD;
const stagingUrl = process.env.ADMIN_TEST_BASE_URL;

const sidebarRoutes = [
  { name: "Overview", path: "/" },
  { name: "Inquiries & Leads", path: "/inquiries" },
  { name: "WhatsApp Platform", path: "/whatsapp" },
  { name: "Careers & Hiring", path: "/careers" },
  { name: "Products & Apps", path: "/products" },
  { name: "Founders & Team", path: "/founders" },
  { name: "FinTech Operations", path: "/fintech" },
  { name: "Proposal Generator", path: "/proposals" },
  { name: "Services & Pricing", path: "/services" },
  { name: "Server & DNS", path: "/server" },
  { name: "System Settings", path: "/settings" },
];

const whatsappTabs = [
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

test("admin routes and tabs open with one click and survive browser navigation", async ({ page }) => {
  test.skip(
    !stagingUrl || !username || !password,
    "Set ADMIN_TEST_BASE_URL, ADMIN_TEST_USERNAME, and ADMIN_TEST_PASSWORD for staging click-through testing.",
  );

  const pageErrors: string[] = [];
  const failedAppAssets: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    if (["script", "stylesheet"].includes(request.resourceType())) {
      failedAppAssets.push(`${request.resourceType()}: ${new URL(request.url()).pathname}`);
    }
  });

  await page.goto("/inquiries");
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await page.locator('input[placeholder="e.g. AST-ADMIN-01"]').fill(username!);
  await page.locator('input[placeholder="Enter your security password"]').fill(password!);
  await page.getByRole("button", { name: /Authenticate to Command Center/ }).click();
  await expect(page).toHaveURL(/\/inquiries(?:\?.*)?$/, { timeout: 30_000 });

  await expect(page.locator("aside nav")).toBeVisible();
  for (const route of sidebarRoutes) {
    await page.getByRole("link", { name: route.name, exact: true }).click();
    if (route.path === "/") {
      await expect(page).toHaveURL(/\/$/);
    } else {
      await expect(page).toHaveURL(new RegExp(`${route.path.replaceAll("/", "\\/")}(?:\\?.*)?$`));
    }
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "This page could not load" })).toHaveCount(0);
  }

  await page.getByRole("link", { name: "WhatsApp Platform", exact: true }).click();
  await expect(page).toHaveURL(/\/whatsapp(?:\?.*)?$/);
  const tabButtons = page.getByRole("tab");
  await expect(tabButtons).toHaveCount(whatsappTabs.length);
  for (let index = 0; index < whatsappTabs.length; index += 1) {
    await tabButtons.nth(index).click();
    await expect(page).toHaveURL(new RegExp(`[?&]tab=${whatsappTabs[index]}(?:&|$)`));
    await expect(tabButtons.nth(index)).toHaveAttribute("aria-selected", "true");
  }

  await page.goto("/whatsapp?tab=invalid-tab&source=browser-test");
  await expect(page).toHaveURL(/\/whatsapp\?tab=overview&source=browser-test$/);
  await expect(page.getByRole("tab").nth(0)).toHaveAttribute("aria-selected", "true");

  await page.getByRole("link", { name: "Careers & Hiring", exact: true }).click();
  await page.getByRole("button", { name: /Applicants & Candidates/ }).click();
  await expect(page.getByPlaceholder("Search candidate, email, role...")).toBeVisible();
  await page.getByRole("button", { name: /Open Positions/ }).click();
  await expect(page.getByPlaceholder("Search job title or department...")).toBeVisible();

  await page.getByRole("link", { name: "Services & Pricing", exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await page.reload();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/careers$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/services$/);

  await page.goto("/missing-route-browser-test");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Toggle navigation" });
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Products & Apps" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole("button", { name: "Toggle navigation" })).toHaveAttribute("aria-expanded", "false");

  expect(pageErrors).toEqual([]);
  expect(failedAppAssets).toEqual([]);
});
