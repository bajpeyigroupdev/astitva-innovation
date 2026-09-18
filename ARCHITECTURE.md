# Astitva Innovation — Technical Architecture & Decoupling Guide

This document outlines the decoupled enterprise software engineering architecture implemented for **Astitva Innovation** (`astitvainnovation.in`), completely separating the Public Corporate Website and the Administrative Dashboard Panel.

---

## 1. Directory & System Architecture

```
E:\Company\Astitva Innovation\
├── astitva-main/                  # Public Corporate Web Platform
│   ├── src/
│   │   ├── website/               # 100% Isolated Public Website Layer
│   │   │   ├── components/        # Hero, FinTech, Services, Calculator, TechStack, Process, etc.
│   │   │   ├── pages/             # HomePage.tsx, NotFoundPage.tsx
│   │   │   ├── services/          # inquiryService.ts (Lead dispatch to storage/API adapter)
│   │   │   ├── types/             # website.ts
│   │   │   └── WebsiteApp.tsx     # Public routing orchestrator (/, /services, /fintech, /contact)
│   │   │
│   │   ├── panel/                 # Integrated Admin Panel Module
│   │   │   ├── auth/              # AdminAuthGuard.tsx, authService.ts
│   │   │   ├── components/        # AdminLogin, DashboardOverview, Inquiries, FinTech, etc.
│   │   │   ├── services/          # inquiryService.ts
│   │   │   └── AdminPanel.tsx     # Master panel orchestrator
│   │   │
│   │   ├── shared/                # Genuinely Shared Primitives & Contracts
│   │   │   ├── components/ui/     # Radix & Tailwind generic primitives
│   │   │   ├── types/             # inquiry.ts (Canonical Inquiry & PaymentLog interfaces)
│   │   │   ├── constants/         # config.ts (Brand, domain, storage keys)
│   │   │   └── utils/             # cn.ts, storage.ts (Decoupled storage adapter)
│   │   │
│   │   ├── App.tsx                # High-level router delegating / to WebsiteApp and /admin to Panel
│   │   └── main.tsx
│   ├── .env.example               # Safe environment template
│   └── .env                       # Gitignored production environment credentials
│
└── dashboard/                     # Standalone Dedicated Dashboard Application
    ├── src/
    │   ├── auth/                  # AdminAuthGuard.tsx, authService.ts (Sliding 4hr expiration)
    │   ├── layouts/               # PanelLayout.tsx (Responsive sidebar, breadcrumbs, server health)
    │   ├── pages/                 # LoginPage, OverviewPage, InquiriesPage, FinTechPage, ProposalsPage,
    │   │                          # ServicesPage, ServerPage, SettingsPage
    │   ├── services/              # inquiryService.ts
    │   ├── components/            # AddLeadModal.tsx, UI primitives
    │   ├── constants/             # config.ts
    │   ├── types/                 # index.ts
    │   ├── App.tsx                # Standalone router (/login, /, /inquiries, /fintech, etc.)
    │   └── main.tsx
    ├── .env.example
    └── .env                       # Gitignored production credentials
```

---

## 2. Decoupled Data Flow: Website → Admin Panel

```
[Public Website User]
       │
       ▼ Submits Contact Form or Project Calculator Estimate
[src/website/services/inquiryService.ts]
       │
       ▼ submitLead()
[src/shared/utils/storage.ts] (Decoupled Storage / API Adapter)
       │
       ▼ LocalStorage / Database Persistence (`astitva_inquiries`)
[src/panel/services/inquiryService.ts]
       │
       ▼ getInquiries() / updateStatus()
[Administrator Command Center (/admin)]
```

> **Zero Cross-Component Coupling**: Public website components never import panel components, and panel components never import website sections.

---

## 3. Administrative Authentication & Security Hardening

1. **Purged Insecure Patterns**:
   - `admin123` and hardcoded fallback passwords have been completely purged from source code, markup, and comments.
2. **Environment Variable Authentication**:
   - The authentication service checks credentials dynamically against:
     - `VITE_ADMIN_USERNAME`
     - `VITE_ADMIN_PASSWORD`
   - Real passwords never exist in source code or Git history.
3. **Session Lifecycle**:
   - Authenticated sessions generate a randomized token with an absolute timestamp stored in `sessionStorage`.
   - Sessions automatically expire after 4 hours (`APP_CONFIG.sessionDurationHours`).
4. **Search Engine Protection (`noindex`)**:
   - `AdminAuthGuard` and `index.html` inject `<meta name="robots" content="noindex, nofollow, noarchive" />` to strictly prevent Google or search engine bots from discovering or indexing administrative endpoints.

---

## 4. Production Server & Routing Specifications

- **Production Domain**: `https://astitvainnovation.in`
- **Server VPS IP**: `217.216.58.223` (Ubuntu Linux)
- **Web Server**: Nginx 1.24.0 with HTTP/2 and Let's Encrypt TLS v1.3
- **Document Root**: `/www/wwwroot/astitvainnovation.in`
- **Deployment Archive**: `astitva-dist.zip`
