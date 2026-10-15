import { expect, test, type Page } from "@playwright/test";

const username = process.env.ADMIN_TEST_USERNAME || "AST-ADMIN-01";
const password = process.env.ADMIN_TEST_PASSWORD || "StagingTestPass123!";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.locator('input[placeholder="e.g. AST-ADMIN-01"]').fill(username);
  await page.locator('input[placeholder="Enter your security password"]').fill(password);
  await page.getByRole("button", { name: /Authenticate to Command Center/i }).click();
  await expect(page.locator("aside nav")).toBeVisible({ timeout: 15_000 });
}

test.describe.serial("WhatsApp Workspace — Composer, Contacts, and Template E2E Flow", () => {
  let pageErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
  });

  test("1. Contact Ledger: E.164 Normalization, Duplicate Rejection, Edit, and Delete Dialog", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/whatsapp?tab=contacts");
    await expect(page.getByText(/Contacts & Customer Consent Ledger/i)).toBeVisible();

    // 1. Open Add Contact Modal
    await page.getByRole("button", { name: /Add Verified Contact/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Add Contact & Consent Record/i)).toBeVisible();

    // 2. Test Phone input with E.164 normalization preview
    const phoneInput = page.getByPlaceholder("e.g. +91 7233882089 or 917233882089");
    await phoneInput.fill("+91 98201 44556");
    await expect(page.getByText("+919820144556").first()).toBeVisible();
    await expect(page.getByText(/E.164 Format:/i)).toBeVisible();

    const testContactName = `Astitva Partner ${Date.now()}`;
    await page.getByPlaceholder("e.g. Vikram Malhotra").fill(testContactName);
    await page.getByPlaceholder(/Corporate client \/ architectural consultation/i).fill("Lead from architectural summit");

    // Save Contact
    await page.getByRole("button", { name: "Save Contact" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(/Contact Saved to Ledger/i).first()).toBeVisible({ timeout: 10_000 });

    // Verify contact rendered in table
    await expect(page.getByText(testContactName).first()).toBeVisible();
    await expect(page.getByText("+919820144556").first()).toBeVisible();

    // 3. Test Duplicate Rejection
    await page.getByRole("button", { name: /Add Verified Contact/i }).click();
    await page.getByPlaceholder("e.g. +91 7233882089 or 917233882089").fill("919820144556");
    await expect(page.getByText(/This phone number is already registered/i)).toBeVisible();
    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // 4. Test Edit Contact Modal
    const contactRow = page.locator("tr").filter({ has: page.getByText(testContactName) }).first();
    await contactRow.getByRole("button", { name: /Edit Contact/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Edit Contact Record/i)).toBeVisible();

    const updatedName = `${testContactName} (Updated)`;
    const editNameInput = page.getByRole("dialog").locator("input").nth(1);
    await editNameInput.fill(updatedName);
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(/Contact Updated/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(updatedName).first()).toBeVisible();

    // 5. Test Delete Contact Dialog
    const updatedRow = page.locator("tr").filter({ has: page.getByText(updatedName) }).first();
    await updatedRow.getByRole("button", { name: /Delete Contact/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Confirm Contact Deletion/i)).toBeVisible();
    await expect(page.getByText(/This will permanently remove/i)).toBeVisible();

    await page.getByRole("button", { name: "Delete Contact" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(/Contact Removed/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(updatedName)).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });

  test("2. Manual Message Composer: Window Detection, Approved Template Selection, and Confirmation Modal", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/whatsapp?tab=chats");
    await expect(page.getByText(/Conversations/i).first()).toBeVisible();

    // 1. Open Message Composer from Chats tab
    const newMsgBtn = page.getByRole("button", { name: /New Message/i });
    await expect(newMsgBtn).toBeVisible();
    await newMsgBtn.click();

    // 2. Verify Composer Dialog Header and Meta Version
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Manual WhatsApp Message Composer/i)).toBeVisible();
    await expect(page.getByText(/Meta Cloud API v20.0/i)).toBeVisible();
    await expect(page.getByText(/Astitva Innovation/i).first()).toBeVisible();

    // 3. Select Manual Entry and type destination phone
    await page.getByRole("button", { name: /Manual Entry/i }).click();
    const phoneInput = page.getByPlaceholder(/e\.g\. \+91 7233882089 or 917233882089/i);
    await phoneInput.fill("+91 72338 82089");
    await expect(page.getByText("+91 7233882089").first()).toBeVisible();
    await expect(page.getByText(/Normalized:/i)).toBeVisible();

    // 4. Verify 24-Hour Policy Notice card is displayed
    await expect(
      page.getByText(/Customer Service Window/i).first()
    ).toBeVisible();

    // 5. Select Approved Template mode
    await page.getByRole("button", { name: /Approved Template/i }).click();

    // Check Live Message Preview card updates
    await expect(page.getByText(/Live Message Preview/i)).toBeVisible();

    // 6. Proceed to Review & Confirm
    await page.getByRole("button", { name: /Review & Confirm/i }).click();

    // Confirmation Modal should appear
    const confirmDialog = page.getByRole("dialog").filter({ hasText: /Confirm WhatsApp Message Send/i });
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.getByText("Recipient:", { exact: true })).toBeVisible();
    await expect(confirmDialog.getByText("Sender:", { exact: true })).toBeVisible();
    await expect(confirmDialog.getByText(/Rendered Content:/i)).toBeVisible();

    // Checkbox must be required
    const confirmBtn = confirmDialog.getByRole("button", { name: /Dispatch via Meta API/i });
    await expect(confirmBtn).toBeDisabled();

    // Check the policy compliance checkbox
    await confirmDialog.locator("#policyConfirm").check();
    await expect(confirmBtn).toBeEnabled();

    // Cancel / Back to edit
    await confirmDialog.getByRole("button", { name: /Back to Edit/i }).click();
    await expect(confirmDialog).toHaveCount(0);
    await expect(page.getByText(/Manual WhatsApp Message Composer/i)).toBeVisible();

    // Close Composer
    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });

  test("3. Contacts to Composer Integration: Message button pre-fills contact", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/whatsapp?tab=contacts");

    // Add a quick contact to test the integration
    await page.getByRole("button", { name: /Add Verified Contact/i }).click();
    await page.getByPlaceholder("e.g. +91 7233882089 or 917233882089").fill("917233882089");
    await page.getByPlaceholder("e.g. Vikram Malhotra").fill("Architectural Client");
    await page.getByRole("button", { name: "Save Contact" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Click Message button on contact row
    const contactRow = page.locator("tr").filter({ has: page.getByText("Architectural Client") }).first();
    await contactRow.getByRole("button", { name: /Message/i }).click();

    // Verify Composer opens with this contact pre-filled
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Manual WhatsApp Message Composer/i)).toBeVisible();
    await expect(page.getByText(/Architectural Client/i).first()).toBeVisible();

    // Close
    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Clean up test contact
    await contactRow.getByRole("button", { name: /Delete Contact/i }).click();
    await page.getByRole("button", { name: "Delete Contact" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });
});
