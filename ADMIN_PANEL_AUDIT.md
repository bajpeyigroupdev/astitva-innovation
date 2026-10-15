# Astitva Innovation Admin Panel Audit

**Audit baseline:** production commit `68151d5`
**Scope:** corporate website, B2B dashboard, Express API, WhatsApp module, auth, JSON persistence, and deployment workflow.
**Method:** repository/source audit, baseline test/build/lint commands, and post-change static/type/build checks. Authenticated browser verification is pending a staging URL and account; no production credential or WhatsApp action was used.
**Deployment state:** these working-tree fixes are not deployed; production remains at `68151d5`.

## Findings by severity

### P0 — corrected in the current working changes

- The WhatsApp page referenced `ShieldCheck` without importing it. The page could throw when React rendered that part of the UI. The icon import is now explicit and `tsc` catches this class of error.
- Admin JWT verification and WhatsApp evidence downloads previously accepted a source-controlled fallback signing key; the evidence-file route also failed to check the admin role. Both now use one verifier that fails closed when `JWT_SECRET` is absent and requires an admin claim.
- New installs seeded a known WhatsApp webhook verification token, and the webhook handler accepted an empty token when no secret was configured. New installs now start empty, verification fails closed, and startup migration clears only that exact built-in placeholder from existing JSON data.
- The production workflow previously copied the tracked `server/data/db.json` into the API directory and swallowed API install/reload and Nginx errors. CI now preserves the runtime data and dependencies, runs server tests plus both frontend lint/type/build checks before deployment, and fails unless the API reloads healthy.
- The tracked database contains four inquiry records with email and phone fields. It is now ignored and removed from the Git index while the local file remains untouched; one existing Git commit still contains the file, and history has not been rewritten.
- The authenticated settings endpoint returned the stored Telegram bot token. Settings reads and writes now return only `hasTelegramBotToken`; an empty token preserves the server-side value, and a new value rotates it. Regression tests cover redaction and token preservation.

### P1 — navigation/stability fixes in the current working changes

- Dashboard routes were eager imports in a single large JavaScript bundle. They are now lazy-loaded with a route skeleton and a recoverable error boundary. The production entry JavaScript measured **628.54 kB before gzip at baseline** and **364.14 kB in the final build**; route modules are emitted as separate chunks.
- Unknown dashboard paths previously redirected to Overview. They now render a 404 page.
- An unrecognized WhatsApp `tab` query value could leave every tab panel inactive. It now normalizes to Overview, keeps unrelated query parameters, and canonicalizes supported aliases.
- Login now returns users to the page they originally requested. The client session duration is aligned with the API’s eight-hour JWT lifetime, and the protected layout verifies the token with the API before rendering.
- Mobile navigation closes after route/query navigation and exposes its expanded state to assistive technology.

### P1 — remaining architecture/reliability gaps

- The primary data store is a single `server/data/db.json` file. Reads and full-file writes are synchronous. A malformed file logs an error and returns seed data; write failures are logged but callers can still report success. There is no transaction, durable queue, or multi-process locking. Do not claim production-grade database reliability until storage and failure semantics are addressed.
- API validation and error handling are inconsistent across legacy endpoints. Several UI services convert failed requests into empty/default data, which can look like a valid empty result.
- Authentication is a single administrator account. There are no distinct admin/client roles, tenant memberships, or per-tenant permissions. WhatsApp account identifiers do not provide complete organization-level tenant isolation.
- Logout removes the browser copy of the JWT, but the API has no token revocation list; a copied token remains valid until its expiry.
- The Meta callback now validates the signed request, stores only hashed identifiers, deduplicates retries, and reports the persisted request status instead of claiming that arbitrary codes are completed. Actual deletion remains incomplete: there is no reliable mapping from Meta user IDs to local messages/evidence and no operational review/deletion workflow, so full deletion compliance must not be claimed.

### P2 — incomplete or demo functionality

- The FinTech module and its webhook action are explicitly simulated; there is no production payment gateway integration in this codebase.
- The proposal generator is client-side and has no persistence API.
- The WhatsApp backend has an OAuth code-exchange endpoint, but the dashboard has no complete Meta Embedded Signup launch/callback UI. Multi-client onboarding and client-specific settings are absent.
- The JSON model has no formal versioned database migrations; `getDb()` only adds missing collections.

## Route and feature inventory

| Module | Route | UI status | Backend status | Data store | Authorization | Automated coverage | Remaining work |
|---|---|---|---|---|---|---|---|
| Login | `/login`, `/admin/login` | Credential form; requested-path redirect fixed | Login, verify, logout routes | Environment + JWT | Public login; admin JWT for protected APIs | Auth middleware tests added | Staging browser login and session-expiry journey |
| Overview | `/` | Summary cards, charts, recent inquiries, lead modal | Inquiry list/create APIs | JSON file | Admin | No page-level browser test yet | Verify empty/error states and real data in staging |
| Inquiries & Leads | `/inquiries` | Search, status filter, CSV export, detail/status/delete, add lead | CRUD/list APIs | JSON file | Admin management; public lead intake | Existing backend route only, no page test | Validate forms, pagination, failure feedback |
| WhatsApp | `/whatsapp?tab=…` | 11 modules: overview, connection, chats, templates, contacts, webhooks, delivery logs, evidence, checklist, diagnostics, security | Graph API operations, webhook handlers, OAuth exchange, diagnostics | JSON file + evidence files | Admin management; public webhook challenge/events | 24 WhatsApp test cases; UI browser run pending | Embedded Signup UI, multi-client tenant model, resilient error states |
| Careers & Hiring | `/careers` | Jobs and candidates tabs, search/filter, edit/status/delete | Public jobs/apply; protected admin job/application CRUD | JSON file | Admin management | No page-level browser test | Validate modal workflows, empty/error states |
| Products & Apps | `/products` | Search, create/edit/delete/toggle | Public listing; protected CRUD | JSON file | Admin management | No page-level browser test | Validate form and failure behavior |
| Founders & Team | `/founders` | Search, create/edit/delete/toggle | Public listing; protected CRUD | JSON file | Admin management | No page-level browser test | Validate form and failure behavior |
| FinTech Operations | `/fintech` | Simulated activity and webhook action | Protected simulation/log API | JSON file | Admin | No page-level browser test | Real gateway integration is not present |
| Proposal Generator | `/proposals` | Proposal inputs, copy, print | No persistence API | Browser state only | Admin route | No page-level browser test | Save/export persistence if required |
| Services & Pricing | `/services` | Service listing/editing | Public read; protected update | JSON file | Admin update | No page-level browser test | API validation and edit-form browser test |
| Server & DNS | `/server` | Status display; copies shell commands | Protected status endpoint | Runtime status | Admin | No page-level browser test | Actions are instructional copy controls, not remote execution |
| System Settings | `/settings` | Company settings, notifications, Telegram; secret now write-only | Public profile read; protected admin read/update/test | JSON file + environment | Admin | Settings secret tests added | Full form and failure-state browser test |
| Not Found | `*` | Dedicated 404 page added | None | None | Public shell | Browser test pending | Verify staging SPA fallback for deep links |

Compatibility redirects are defined for `/admin/*` entries and `/dashboard/*`. The public corporate website has its own Vite/React router and separate deployment output.

## Test and tool baseline

| Check | Before changes | Current working changes |
|---|---|---|
| Server tests | 20/20 passed | 27 cases pass: auth middleware, settings-secret handling, data-deletion request handling, and 24 WhatsApp cases |
| Dashboard production build | Passed; one 628.54 kB entry chunk | Passed; 364.14 kB entry chunk (116.48 kB gzip) plus lazy route chunks |
| Dashboard lint | No dashboard ESLint config existed | Passes with 0 errors and 7 existing UI fast-refresh warnings |
| Dashboard TypeScript | Not run at baseline | `npx tsc -b --pretty false` passes |
| Corporate build | Passed | Passed; Vite reports a 579.53 kB entry chunk above its 500 kB advisory threshold |
| Corporate lint | Failed on six existing errors | Passes with 0 errors and 7 existing UI fast-refresh warnings |
| Corporate TypeScript | Not run at baseline | `npx tsc -b --pretty false` passes |
| Browser tests | No browser test dependency/config existed | Playwright runner/config pass; authenticated click-through is skipped until a staging URL and account are supplied |
| Dependency audit | Not run | API: 0 vulnerabilities. Corporate and dashboard: 13 each overall (6 high, 7 moderate), including 9 runtime dependency advisories each (5 high, 4 moderate). Compatible corporate updates reduced its count from 34 to 13; remaining frontend advisories require major upgrades and compatibility validation. |

The WhatsApp test output includes expected negative-case webhook rejection logs; the suite exits successfully.

## Read-only production smoke checks

The deployed baseline at `68151d5` was checked without signing in or changing data. The corporate site root and `/careers`, the B2B root, `/whatsapp`, `/whatsapp?tab=connection`, `/whatsapp?tab=invalid-live-check`, `/api/health`, and the dashboard JavaScript/CSS assets returned HTTP 200. Unauthenticated requests to `/api/auth/verify`, `/api/whatsapp/config`, and `/api/settings/admin` returned HTTP 401, as expected. These checks establish HTTP routing, asset availability, health, and access guards; they do not verify browser-side rendering or authenticated workflows.

## Deployment and rollback

The current production baseline remains `68151d5` until a reviewed CI deployment runs. The workflow now gates deployment on API tests, lint, type checks, and both frontend builds; the authenticated Playwright suite remains a staging-only pre-deployment check. Before production deployment, complete that flow and verify required server environment configuration without printing secrets.

After a follow-up deployment, roll back application code through the hardened workflow while retaining the data-exclusion safeguards; do not restore the old `server/data/db.json` copy behavior. There is no schema migration in this change set; startup only clears the hash-recognized legacy webhook-token placeholder.
