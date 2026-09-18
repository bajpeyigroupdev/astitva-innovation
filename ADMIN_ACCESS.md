# Astitva Innovation — Administrator Access Guide

This guide details how to configure and access the Administrative Command Center for **Astitva Innovation**.

---

## 1. Access Endpoints

- **Live Production URL**: [https://astitvainnovation.in/admin/login](https://astitvainnovation.in/admin/login)
- **Local Development URL**: `http://localhost:8080/admin/login` (or `http://localhost:5173/login` in the standalone dashboard project)
- **Primary Administrative Route**: `/admin` (or `/dashboard` alias)

---

## 2. Administrator Identity Format

- **Standard Admin Identity Format**: `AST-ADMIN-XX`
- **Default System Admin ID**: `AST-ADMIN-01`

---

## 3. Configuring Production Credentials in `.env`

To set or rotate your administrator credentials, edit the local gitignored `.env` file located in the root of your project:

```env
# Production Admin Credentials
VITE_ADMIN_USERNAME=AST-ADMIN-01
VITE_ADMIN_PASSWORD=YOUR_STRONG_SECURE_PASSWORD
```

> [!IMPORTANT]
> - Never commit `.env` into Git version control.
> - The template file `.env.example` contains placeholders only and can be safely committed.
> - Passwords must contain a minimum of 20 characters including uppercase, lowercase, numbers, and special symbols.

---

## 4. Administrative Security Policies

1. **Expiring Sessions**:
   - Authenticated admin sessions automatically terminate after **4 hours** of inactivity.
2. **Search Engine Protection**:
   - All admin endpoints dynamically declare `<meta name="robots" content="noindex, nofollow" />`.
3. **Session Revocation**:
   - Clicking **Sign Out** immediately purges the session token from browser memory.
