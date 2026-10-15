# Meta App Review Demonstration & Screencast Walkthrough Guide
**Application:** Astitva Innovation Admin Panel & Business Messaging Platform  
**Live URL:** [https://b2b.astitvainnovation.in](https://b2b.astitvainnovation.in)  
**API Endpoint:** [https://astitvainnovation.in/api/whatsapp](https://astitvainnovation.in/api/whatsapp)  
**Meta Graph API Version:** `v20.0` (Official Meta WhatsApp Cloud API)  
**Configured Sender Number:** `+91 7233882089` (Display Name: *Astitva Innovation*)  

---

## 1. Designated Review Account & Authentication

To demonstrate the application without exposing internal team credentials or live customer data:

1. Navigate to the Admin Panel login page at `https://b2b.astitvainnovation.in/login`.
2. Authenticate using the designated demonstration credentials provided in the Meta App Review submission notes:
   - **Username:** `AST-ADMIN-REVIEW` (or designated reviewer credentials).
   - **Role:** Administrator (`admin`).
3. Session tokens are transmitted as standard JSON Web Tokens (JWT) stored in HTTP-only/secure application memory and attached to every API request via `Authorization: Bearer <token>`.
4. All secrets (`WHATSAPP_API_TOKEN`, `WHATSAPP_APP_SECRET`, `verifyToken`) are write-only on the server and are strictly excluded from frontend state and network payloads.

---

## 2. Opening the WhatsApp Workspace

1. After logging in, select **WhatsApp** from the primary administrative sidebar or navigate to:
   `https://b2b.astitvainnovation.in/whatsapp?tab=overview`.
2. The WhatsApp workspace contains modular tabs representing the complete management lifecycle:
   - **Overview:** Meta API connection status, quality rating, and 6-stage technical health check.
   - **Connection:** WABA credentials, phone number configuration, and Embedded Signup.
   - **Chats:** Real-time conversation threads, customer care window status, and message composer.
   - **Templates:** Approved Meta templates, category details, and template submission.
   - **Contacts & Opt-In:** Documented customer consent ledger and suppression management.
   - **Webhooks:** Ingress webhook event stream and HMAC-SHA256 signature verification.
   - **Delivery Logs:** Granular delivery timeline (sent, delivered, read, failed).
   - **Evidence:** Reviewer artifact uploads, screencast recordings, and audit logs.
   - **Checklist:** Technical prerequisite verification engine.
   - **Diagnostics & Security:** Meta error guides and encryption posture.

---

## 3. Screen Recording Sequence 1: `whatsapp_business_messaging`

**Target Permission:** `whatsapp_business_messaging`  
**Purpose:** Demonstrates sending and receiving customer-service messages, respecting the 24-hour messaging window, dispatching approved templates, and tracking delivery receipts.

### Recording Steps:

1. **Demonstrate Configured Sender Asset (10 seconds):**
   - Navigate to the **Connection** tab.
   - Show the configured Phone Number ID and Phone Number (`+91 7233882089`).
   - Highlight the write-only masked token placeholder (`••••••••`), proving that access tokens are never exposed in cleartext.

2. **Add an Authorized Test Recipient Contact (20 seconds):**
   - Switch to the **Contacts & Opt-in** tab (`tab=contacts`).
   - Click **Add Verified Contact**.
   - Enter an authorized Meta Developer / Tester phone number (e.g. `+91 7233882089`).
   - Note the live E.164 normalization preview.
   - Set consent status to `OPTED_IN` and Opt-in Source to `WEBSITE_CONSULTATION_FORM`.
   - Click **Save Contact**. The contact appears in the ledger with an active verification badge.

3. **Demonstrate 24-Hour Messaging Window Enforcement (25 seconds):**
   - Click the **New Message** button or select **Message** next to the contact.
   - The **Manual WhatsApp Message Composer** dialog opens.
   - Notice the **Customer Service Window Status**:
     - If the recipient has sent an inbound message within the last 24 hours, the green badge displays: `Customer Service Window Active (X minutes remaining)`. Free-form text sending is enabled.
     - If outside the 24-hour window, the amber badge displays: `Customer Service Window Closed • Approved Template Required`. Free-form text is disabled in accordance with Meta WhatsApp Business Messaging Policy.

4. **Send an Approved WhatsApp Message Template (25 seconds):**
   - Select **Approved Template** as the message type.
   - Choose an approved template from the dropdown (e.g. `astitva_inquiry_acknowledgment` or `astitva_welcome`).
   - Enter the variable parameters in the dynamically generated inputs (e.g. `{{1}}` = Customer Name, `{{2}}` = Service Name).
   - Review the live message preview card showing real-time variable substitutions.
   - Click **Review & Confirm**.
   - In the confirmation dialog, check the policy verification checkbox and click **Dispatch via Meta API**.
   - Observe the success toast displaying the official Meta Message ID (`wamid.HBg...`).

5. **Track Delivery Receipts in Conversation Timeline (20 seconds):**
   - Navigate to the **Chats** tab (`tab=chats`).
   - Select the conversation thread for the recipient.
   - Show the outbound message in the timeline.
   - Point out the status indicators:
     - One checkmark (`✓`): Sent to Meta Graph API.
     - Two checkmarks (`✓✓` gray): Delivered to recipient device.
     - Two checkmarks (`✓✓` blue): Read by recipient.
     - Red triangle (`⚠️`): Failed, with official Meta error code and message.
   - Show the **Delivery Logs** tab (`tab=delivery-logs`) to display the immutable delivery event audit trail.

6. **Demonstrate Opt-Out Suppression (STOP Keyword) (20 seconds):**
   - Show that if the recipient responds with `STOP`, the webhook handler automatically marks the contact as `OPTED_OUT`.
   - Attempting to send a message to an `OPTED_OUT` contact is strictly suppressed by the composer with a clear notice: `Recipient Suppressed: Customer has opted out from WhatsApp notifications.`

---

## 4. Screen Recording Sequence 2: `whatsapp_business_management`

**Target Permission:** `whatsapp_business_management`  
**Purpose:** Demonstrates managing WhatsApp Business Account assets, viewing phone numbers, synchronizing and creating message templates, and onboarding client accounts via Embedded Signup.

### Recording Steps:

1. **Inspect WABA Account Information & Health (20 seconds):**
   - Open the **Overview** tab (`tab=overview`).
   - Click **Test API Health & Connectivity**.
   - Show the 6-stage health breakdown:
     - Stage 1: API Credentials Configured.
     - Stage 2: Meta Graph API Authentication (`v20.0`).
     - Stage 3: Phone Number Asset Accessibility.
     - Stage 4: Webhook Signature Verification (`HMAC-SHA256`).
     - Stage 5: Messaging Pipeline Tested.
     - Stage 6: Meta App Review & Permission Status.

2. **Template Management & Meta Graph API Synchronization (30 seconds):**
   - Navigate to the **Templates** tab (`tab=templates`).
   - Click **Sync from Meta**.
   - Show the live API call querying `GET /{WABA_ID}/message_templates` via Meta Graph API v20.0.
   - Show the synchronized template cards displaying:
     - Template Name (e.g. `astitva_consultation_update`).
     - Category (`UTILITY` or `MARKETING`).
     - Language (`en_US`).
     - Official Meta Approval Status (`APPROVED`, `PENDING`, or `REJECTED`).
     - Parameter components (`BODY`, `FOOTER`).

3. **Template Submission for Meta Approval (25 seconds):**
   - Click **Create Template**.
   - Enter template name (e.g. `astitva_quote_notification`), select category `UTILITY`, and enter body text with variable placeholders: `Hello {{1}}, your quotation for {{2}} is ready.`
   - Click **Submit to Meta**.
   - The template is submitted to Meta's review pipeline via `POST /{WABA_ID}/message_templates` and enters `PENDING` state until approved by Meta.

4. **Multi-Tenant Account Management & Embedded Signup (30 seconds):**
   - Open the **Connection** tab (`tab=connection`).
   - Point out the **Multi-Tenant / Sub-Account Switcher**.
   - Click **Launch Meta Embedded Signup**.
   - Show the Meta Embedded Signup modal explaining how business clients connect their own WABA to Astitva Innovation via Meta's official Facebook Login for Business dialog.
   - Show that client data and conversations are strictly isolated by `tenantId` in the database.

---

## 5. Permission Scope & Technical Boundaries

| Feature | `whatsapp_business_messaging` | `whatsapp_business_management` | Current Status |
|---------|:-----------------------------:|:------------------------------:|:--------------:|
| Inbound webhook processing | Required | Optional | Fully operational |
| Send text replies in 24h window | Required | Optional | Fully operational |
| Send approved template messages | Required | Optional | Fully operational |
| Delivery receipt tracking (sent/delivered/read) | Required | Optional | Fully operational |
| Read phone number status & quality | Optional | Required | Fully operational |
| Sync message templates from Meta | Optional | Required | Fully operational |
| Submit new templates for review | Optional | Required | Fully operational |
| Embedded Signup OAuth exchange | Optional | Required | Fully operational |
| Commercial production volume | Pending Review | Pending Review | Development / Test assets active |

---

## 6. Security, Privacy & Secret Redaction Guarantee

- **Zero Cleartext Credentials:** Access tokens, app secrets, and webhook verify tokens are never returned by the backend API or rendered in the DOM.
- **HMAC-SHA256 Verification:** Incoming webhooks are cryptographically authenticated using the Meta `X-Hub-Signature-256` header.
- **Opt-In Suppression:** Recipient opt-out keywords (`STOP`, `UNSUBSCRIBE`, `QUIT`) automatically suppress all future outbound messages.
- **User Data Deletion Callback:** Implemented at `POST /api/user-data-deletion` complying with Meta Platform Terms.
