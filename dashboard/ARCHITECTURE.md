# Astitva Innovation — System Architecture & Decoupling Documentation

This document defines the production architecture of **Astitva Innovation**, featuring complete decoupling between the Corporate Public Website, the authoritative B2B Dashboard, and the Node.js API Service.

---

## 1. Domain & Infrastructure Architecture

| Application | Domain | Repository Folder | Production Document Root |
| :--- | :--- | :--- | :--- |
| **Corporate Website** | `https://astitvainnovation.in` | `astitva-main/` | `/www/wwwroot/astitvainnovation.in` |
| **B2B Dashboard** | `https://b2b.astitvainnovation.in` | `dashboard/` | `/www/wwwroot/b2b.astitvainnovation.in` |
| **Backend API Service** | `https://astitvainnovation.in/api` | `server/` | `/www/wwwroot/astitva-api` (Port 5000) |

- **Authoritative Server IP**: `217.216.58.223` (Ubuntu Linux)
- **Web Engine**: Nginx 1.24.0 (Independent VHosts with SPA fallback `try_files $uri $uri/ /index.html;`)

---

## 2. Decoupled Application Structure

```
E:\Company\Astitva Innovation\
│
├── astitva-main/              # Standalone Corporate Website (astitvainnovation.in)
│   ├── src/
│   │   ├── website/          # Landing page sections, hero, fintech, calculator, contact
│   │   ├── shared/           # Design system tokens & types
│   │   ├── App.tsx           # Website SPA router (no admin panel code)
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── dashboard/                 # Authoritative B2B Admin Command Center (b2b.astitvainnovation.in)
│   ├── src/
│   │   ├── auth/             # Server API auth service, AdminAuthGuard (JWT Bearer)
│   │   ├── layouts/          # PanelLayout, sidebar, header, system metrics
│   │   ├── pages/            # Login, Overview, Inquiries, FinTech, Proposals, Services, Server, Settings
│   │   ├── services/         # API data services (inquiryService, fintechService)
│   │   ├── App.tsx           # B2B SPA router
│   │   └── main.tsx
│   ├── public/               # robots.txt (Disallow: /)
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # Node.js / Express API & Persistence Layer
│   ├── server.js             # Bcrypt auth, rate limiting, inquiries CRUD, fintech simulation
│   ├── data/                 # JSON file store with atomic file locking
│   ├── ecosystem.config.js   # PM2 configuration for Ubuntu VPS
│   └── package.json
│
└── nginx/                     # Separate VHost Configurations
    ├── nginx_astitvainnovation.conf  # Corporate Website config
    └── nginx_b2b_dashboard.conf      # B2B Dashboard config
```

---

## 3. Security & Authentication Architecture

1. **Zero Secrets in Frontend**:
   - `VITE_ADMIN_PASSWORD` is completely eliminated from frontend bundles.
   - Vite embeds `VITE_*` variables into public JavaScript; therefore, production credentials are strictly verified server-side.
2. **Server-Side Password Verification**:
   - Identity: `AST-ADMIN-01`
   - Algorithm: Bcrypt with high salt rounds (12 rounds).
   - Session Tokens: Cryptographically signed JWTs with 8-hour expiration.
   - Brute-Force Rate Limiting: Max 10 attempts per 15 minutes on `/api/auth/login`.
3. **Data Flow & Persistence**:
   - Public submissions from `astitvainnovation.in` post to `/api/inquiries`.
   - The B2B dashboard at `b2b.astitvainnovation.in` fetches inquiries from `/api/inquiries` using authenticated Bearer tokens.
   - Browser `localStorage` is maintained solely as an offline development fallback.
4. **Search Engine Protection**:
   - `b2b.astitvainnovation.in` is strictly hidden from search engines via `robots.txt`, `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`, and HTML meta tags.
