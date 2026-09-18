# DNS Configuration Guide for astitvainnovation.in

Ye guide follow karke aap apne Domain Registrar (GoDaddy, Hostinger, Namecheap, Cloudflare, BigRock, etc.) ke DNS Management panel me records add kar sakte hain.

---

## 1. Required DNS Records (Website Chalu Karne Ke Liye)

Apne Domain ke DNS Manager me jaakar neeche diye gaye 2 main records add karein:

| Type | Name / Host | Target / Points to / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (ya khali) | `YOUR_SERVER_IP` *(Apne VPS/Server ka Public IPv4 dalein)* | 300 / Auto | Root domain (`astitvainnovation.in`) ko server se connect karta hai |
| **CNAME** | `www` | `astitvainnovation.in.` | 300 / Auto | `www.astitvainnovation.in` ko root domain par route karta hai |

*(Note: Agar aapka DNS manager `@` accept nahi karta, toh Name me `astitvainnovation.in` likhein).*

---

## 2. Optional: Business Email Setup (Google Workspace / Zoho / aaPanel Mail)

Agar aapko email chahiye jaise `contact@astitvainnovation.in` ya `sales@astitvainnovation.in`:

### Option A: aaPanel Built-in Mail Server
| Type | Name | Value | Priority | TTL |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | `mail.astitvainnovation.in.` | 10 | Auto |
| **A** | `mail` | `YOUR_SERVER_IP` | - | Auto |
| **TXT** | `@` | `v=spf1 a mx ip4:YOUR_SERVER_IP ~all` | - | Auto |

### Option B: Zoho Mail (Free 5 Custom Mailboxes)
| Type | Name | Value | Priority | TTL |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | `mx.zoho.in.` | 10 | Auto |
| **MX** | `@` | `mx2.zoho.in.` | 20 | Auto |
| **MX** | `@` | `mx3.zoho.in.` | 50 | Auto |
| **TXT** | `@` | `v=spf1 include:zoho.in ~all` | - | Auto |

---

## 3. Server par Setup (aaPanel / Nginx)

1. **Website Directory**:
   Build hone ke baad files ko server me is path par upload/copy karein:
   ```bash
   /www/wwwroot/astitvainnovation.in
   ```
2. **Nginx Config**:
   Codebase me updated file [nginx_astitvainnovation.conf](file:///e:/Company/Astitva%20Innovation/astitva-main/nginx_astitvainnovation.conf) maujood hai. Isko apne Nginx ya aaPanel configuration me paste karein.

3. **Free SSL Certificate (HTTPS)**:
   - DNS add karne ke 5-15 minute baad aaPanel ya Certbot se SSL activate karein:
   ```bash
   certbot --nginx -d astitvainnovation.in -d www.astitvainnovation.in
   ```
   - Ya aaPanel ke **Websites** section me jaakar `astitvainnovation.in` par click karein -> **SSL** -> **Let's Encrypt** -> Apply.

---

## 4. DNS Propagation Check
DNS add karne ke baad aap is tool se check kar sakte hain ki IP connect hui ya nahi:
- https://www.whatsmydns.net/#A/astitvainnovation.in
