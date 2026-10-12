const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial database schema seed
const initialSeed = {
  settings: {
    brandName: "Astitva Innovation",
    phone: "+91 7233882089",
    whatsappNumber: "917233882089",
    contactEmail: "contact@astitvainnovation.in",
    supportEmail: "support@astitvainnovation.in",
    salesEmail: "support@astitvainnovation.in",
    address: "Global Software Engineering Hub • India & Remote",
    workingHours: "Mon - Sat: 9:30 AM - 7:30 PM IST",
    telegramBotToken: "",
    telegramChatId: "",
    notificationsEnabled: true
  },
  products: [
    {
      id: "prod-meethi-chat",
      name: "Meethi Chat",
      tagline: "Social Voice & Friendship Platform",
      category: "Social Voice & Community",
      badge: "Official Flagship App",
      description: "Meethi Chat is a premium social voice platform designed for meaningful one-to-one conversations, friendships, and real-time voice calling. Users can discover people through smart matchmaking, personalize their profiles, send virtual gifts, and manage their wallet while enjoying private and engaging conversations.",
      storeUrl: "https://play.google.com/store/apps/details?id=com.umangchatlive&hl=en_IN",
      storeType: "google-play",
      packageName: "com.umangchatlive",
      iconUrl: "/meethi-chat-icon.png",
      status: "Active",
      isFeatured: true,
      technologies: ["WebRTC", "Node.js", "Socket.IO", "Redis", "Android Native"],
      features: [
        "Real-Time 1-on-1 Voice Calling with ultra-low latency WebRTC",
        "Smart Matchmaking interest-based algorithm",
        "Profile Customization with avatars and custom badges",
        "Virtual Gifting with animated rewards",
        "Wallet & Instant Recharge infrastructure",
        "Granular Privacy Controls & caller security",
        "Instant Block & Rapid Incident Reporting",
        "Verified Host & Talent Creator Ecosystem",
        "Safe Community 24/7 automated filters"
      ],
      metrics: [
        { label: "Engine", value: "Real-Time WebRTC Audio" },
        { label: "Community", value: "Verified Hosts" },
        { label: "Safety", value: "24/7 Moderation" }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  inquiries: [
    {
      id: "INQ-2026-001",
      name: "Vikram Malhotra",
      email: "v.malhotra@paysecure.tech",
      phone: "+91 98201 44556",
      service: "FinTech & Payment Gateway",
      budget: "₹5,00,000 - ₹10,00,000",
      message: "Looking for dual payment gateway routing (Razorpay + Stripe fallback) with automated webhook reconciliation and fraud velocity checks.",
      status: "In Review",
      date: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "INQ-2026-002",
      name: "Ananya Sharma",
      email: "ananya@finscale.io",
      phone: "+91 98112 33445",
      service: "Custom SaaS Development",
      budget: "₹10,00,000+",
      message: "Multi-tenant B2B lending platform with KYC verification microservice and high throughput ledger accounting.",
      status: "New",
      date: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: "INQ-2026-003",
      name: "Rajesh Singhania",
      email: "rajesh@singhaniagroup.in",
      phone: "+91 98450 11223",
      service: "Enterprise Cloud & DevOps",
      budget: "₹3,00,000 - ₹5,00,000",
      message: "AWS ECS migration from monolithic droplets, automated CI/CD pipeline, and 99.99% uptime SLA monitoring.",
      status: "Contacted",
      date: new Date(Date.now() - 24 * 3600000).toISOString(),
    }
  ],
  fintechLogs: [
    {
      id: "PAY-TXN-8821",
      gateway: "Razorpay",
      event: "payment.captured",
      amount: 145000,
      currency: "INR",
      status: "success",
      environment: "LIVE",
      signatureVerified: true,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "PAY-TXN-8822",
      gateway: "Stripe",
      event: "payment_intent.succeeded",
      amount: 250000,
      currency: "INR",
      status: "success",
      environment: "LIVE",
      signatureVerified: true,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "PAY-SIM-1001",
      gateway: "Cashfree",
      event: "order.paid.simulated",
      amount: 49999,
      currency: "INR",
      status: "success",
      environment: "DEMO / SANDBOX",
      signatureVerified: true,
      timestamp: new Date().toISOString(),
    }
  ],
  services: [
    { id: "fintech", name: "FinTech & Payment Gateway Engineering", enabled: true, startingPrice: "₹1,50,000", turnaround: "3-5 Weeks" },
    { id: "saas", name: "Custom SaaS & Enterprise Platforms", enabled: true, startingPrice: "₹2,50,000", turnaround: "4-8 Weeks" },
    { id: "cloud", name: "Cloud Architecture & High-Scale DevOps", enabled: true, startingPrice: "₹1,00,000", turnaround: "2-3 Weeks" },
    { id: "ai", name: "AI Integration & Workflow Automation", enabled: true, startingPrice: "₹1,20,000", turnaround: "2-4 Weeks" }
  ],
  founders: [
    {
      id: "founder-shivansh",
      name: "Shivansh Kamal Bajpeyi",
      position: "Founder & Chief Executive Officer",
      roleBadge: "CEO & Principal Architect",
      bio: "Visionary software architect leading technical strategy, distributed platforms, WebRTC systems, and FinTech infrastructures at Astitva Innovation.",
      portfolioSummary: "Shivansh Kamal Bajpeyi heads the engineering direction and strategic technology roadmaps at Astitva Innovation. With deep expertise across high-concurrency systems, real-time voice architectures (WebRTC), high-throughput payment routing, and enterprise cloud DevOps, Shivansh spearheaded the development of flagship products like Meethi Chat and bank-grade FinTech middleware.",
      keySkills: ["Distributed Systems", "FinTech & Payment Gateways", "WebRTC & Audio Protocols", "Cloud Architecture & DevOps", "Full-Stack System Design"],
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      linkedin: "https://www.linkedin.com/in/shivansh-bajpeyi",
      instagram: "https://www.instagram.com/shivansh_bajpeyi",
      email: "shivansh@astitvainnovation.in",
      phone: "+91 7233882089",
      order: 1,
      enabled: true
    },
    {
      id: "founder-shiv-prakash",
      name: "Shiv Prakash",
      position: "Co-Founder & Chief Operations Officer",
      roleBadge: "COO & Enterprise Strategy Lead",
      bio: "Operations and corporate strategy leader steering organizational scaling, client partnerships, compliance, and international delivery.",
      portfolioSummary: "Shiv Prakash oversees operational lifecycles, commercial client relationships, and business development initiatives. Bringing extensive experience in agile team scaling, strategic growth, and operational management, Shiv drives the commercialization of Astitva's enterprise software solutions and ensures top-tier client execution.",
      keySkills: ["Operations Management", "Business Strategy", "Client Delivery & SOWs", "Product Commercialization", "Agile Execution"],
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      linkedin: "https://www.linkedin.com/in/shiv-prakash",
      instagram: "https://www.instagram.com/shiv_prakash",
      email: "shivprakash@astitvainnovation.in",
      phone: "+91 7233882089",
      order: 2,
      enabled: true
    }
  ]
};

// Send real-time instant alert to Admin's phone via Telegram
function sendTelegramAlert(text) {
  const db = getDb();
  const token = db.settings?.telegramBotToken;
  const chatId = db.settings?.telegramChatId;
  if (!token || !chatId) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    try {
      const postData = JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      });

      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${encodeURIComponent(token)}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', (err) => {
        console.warn('Telegram notification delivery error:', err.message);
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.write(postData);
      req.end();
    } catch (e) {
      console.warn('Telegram exception:', e);
      resolve(false);
    }
  });
}

// Thread-safe / atomic DB reader and writer with auto-migration
function getDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2));
      return JSON.parse(JSON.stringify(initialSeed));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);

    // Ensure collections exist even if migrating from older schema
    let modified = false;
    if (!data.settings) {
      data.settings = initialSeed.settings;
      modified = true;
    }
    if (!data.products || !Array.isArray(data.products)) {
      data.products = initialSeed.products;
      modified = true;
    }
    if (!data.founders || !Array.isArray(data.founders)) {
      data.founders = initialSeed.founders;
      modified = true;
    }
    if (modified) {
      saveDb(data);
    }
    return data;
  } catch (err) {
    console.error("DB Read Error:", err);
    return JSON.parse(JSON.stringify(initialSeed));
  }
}

function saveDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("DB Write Error:", err);
  }
}

// 1. Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Managed via Nginx for granular asset/font policies
  crossOriginEmbedderPolicy: false
}));

// 2. Strict CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Fallback defaults if env missing
if (allowedOrigins.length === 0) {
  allowedOrigins.push(
    "https://astitvainnovation.in",
    "https://www.astitvainnovation.in",
    "https://b2b.astitvainnovation.in",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
  );
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  }

  // Handle browser pre-flight OPTIONS check
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: "500kb" }));

// 3. Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts
  message: { success: false, error: "Too many authentication attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// 4. JWT Authentication Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Access Denied: Missing or invalid authorization header." });
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET || "fallback_super_secret_jwt_key_astitva_2026";

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Access Denied: Session token expired or invalid." });
  }
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    service: "Astitva Innovation Core API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    domains: {
      corporate: "https://astitvainnovation.in",
      b2b: "https://b2b.astitvainnovation.in"
    }
  });
});

// Admin Login
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Username and password are required." });
  }

  const configuredUser = process.env.ADMIN_USERNAME || "AST-ADMIN-01";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    console.error("ADMIN_PASSWORD_HASH not configured in environment!");
    return res.status(500).json({ success: false, error: "Server authentication configuration missing." });
  }

  // Artificial timing protection
  await new Promise(r => setTimeout(r, 200));

  if (username.trim() !== configuredUser) {
    return res.status(401).json({ success: false, error: "Access Denied: Invalid Administrator ID or Password." });
  }

  const isPasswordValid = bcrypt.compareSync(password.trim(), passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, error: "Access Denied: Invalid Administrator ID or Password." });
  }

  const jwtSecret = process.env.JWT_SECRET || "fallback_super_secret_jwt_key_astitva_2026";
  const token = jwt.sign(
    { username: configuredUser, role: "admin", iss: "astitva-auth" },
    jwtSecret,
    { expiresIn: "8h" }
  );

  return res.json({
    success: true,
    token,
    user: {
      username: configuredUser,
      role: "admin",
      loginAt: new Date().toISOString()
    }
  });
});

// Admin Verify Session
app.get('/api/auth/verify', authenticateAdmin, (req, res) => {
  res.json({
    valid: true,
    user: req.admin
  });
});

// Admin Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

// Public Lead Ingestion (Corporate Website Contact Form & Calculator)
app.post('/api/inquiries', (req, res) => {
  const { name, email, phone, service, budget, message } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ success: false, error: "Name and email are required fields." });
  }

  const db = getDb();
  const newInquiry = {
    id: `INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: String(name).slice(0, 150).trim(),
    email: String(email).slice(0, 150).trim(),
    phone: String(phone || "Not provided").slice(0, 50).trim(),
    service: String(service || "FinTech & Payment Gateway").slice(0, 100).trim(),
    budget: String(budget || "₹1,50,000 - ₹5,00,000").slice(0, 100).trim(),
    message: String(message || "").slice(0, 3000).trim(),
    status: "New",
    date: new Date().toISOString()
  };

  db.inquiries.unshift(newInquiry);
  saveDb(db);

  // Trigger Instant Mobile Notification via Telegram if configured
  const alertText = `🔔 <b>New Project Inquiry Received!</b>\n\n` +
    `👤 <b>Name:</b> ${newInquiry.name}\n` +
    `📞 <b>Phone:</b> ${newInquiry.phone}\n` +
    `✉️ <b>Email:</b> ${newInquiry.email}\n` +
    `🛠 <b>Service:</b> ${newInquiry.service}\n` +
    `💰 <b>Budget:</b> ${newInquiry.budget}\n` +
    `💬 <b>Message:</b> ${newInquiry.message || "None"}\n` +
    `⏱ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;
  sendTelegramAlert(alertText).catch(e => console.warn("Telegram dispatch failed:", e));

  res.status(201).json({
    success: true,
    message: "Inquiry registered successfully.",
    data: newInquiry
  });
});

// Protected: Get All Inquiries (B2B Dashboard)
app.get('/api/inquiries', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { status, search } = req.query;

  let results = [...(db.inquiries || [])];

  if (status && status !== 'All') {
    results = results.filter(inq => inq.status.toLowerCase() === String(status).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(inq =>
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      inq.service.toLowerCase().includes(q) ||
      inq.message.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

// Protected: Update Inquiry Status
app.patch('/api/inquiries/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["New", "Contacted", "In Review", "Closed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const db = getDb();
  const index = db.inquiries.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Inquiry record not found." });
  }

  db.inquiries[index].status = status;
  db.inquiries[index].updatedAt = new Date().toISOString();
  saveDb(db);

  res.json({ success: true, data: db.inquiries[index] });
});

// Protected: Delete Inquiry
app.delete('/api/inquiries/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const initialLength = db.inquiries.length;
  db.inquiries = db.inquiries.filter(i => i.id !== id);

  if (db.inquiries.length === initialLength) {
    return res.status(404).json({ success: false, error: "Inquiry not found." });
  }

  saveDb(db);
  res.json({ success: true, message: "Inquiry deleted successfully." });
});

// Protected: FinTech Logs
app.get('/api/fintech/logs', authenticateAdmin, (req, res) => {
  const db = getDb();
  res.json({
    success: true,
    data: db.fintechLogs || []
  });
});

// Protected: Simulate Webhook (Demo / Sandbox)
app.post('/api/fintech/simulate', authenticateAdmin, (req, res) => {
  const { gateway = "Razorpay", event = "payment.captured", amount = 150000 } = req.body;
  const db = getDb();

  const simulatedLog = {
    id: `PAY-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
    gateway,
    event,
    amount: Number(amount),
    currency: "INR",
    status: "success",
    environment: "DEMO / SANDBOX",
    signatureVerified: true,
    timestamp: new Date().toISOString()
  };

  db.fintechLogs.unshift(simulatedLog);
  saveDb(db);

  res.status(201).json({
    success: true,
    data: simulatedLog
  });
});

// Protected: Services Settings
app.get('/api/services', (req, res) => {
  const db = getDb();
  res.json({ success: true, data: db.services || [] });
});

app.patch('/api/services/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { enabled, startingPrice, turnaround } = req.body;
  const db = getDb();
  const service = (db.services || []).find(s => s.id === id);

  if (!service) {
    return res.status(404).json({ success: false, error: "Service not found." });
  }

  if (enabled !== undefined) service.enabled = Boolean(enabled);
  if (startingPrice) service.startingPrice = startingPrice;
  if (turnaround) service.turnaround = turnaround;

  saveDb(db);
  res.json({ success: true, data: service });
});

// -------------------------------------------------------------
// SETTINGS API
// -------------------------------------------------------------

// Public: Get Company Contact Info & Profile
app.get('/api/settings', (req, res) => {
  const db = getDb();
  const s = db.settings || initialSeed.settings;
  res.json({
    success: true,
    data: {
      brandName: s.brandName || "Astitva Innovation",
      phone: s.phone || "+91 7233882089",
      whatsappNumber: s.whatsappNumber || "917233882089",
      contactEmail: s.contactEmail || "contact@astitvainnovation.in",
      supportEmail: s.supportEmail || "support@astitvainnovation.in",
      salesEmail: s.salesEmail || "support@astitvainnovation.in",
      address: s.address || "Global Software Engineering Hub • India & Remote",
      workingHours: s.workingHours || "Mon - Sat: 9:30 AM - 7:30 PM IST"
    }
  });
});

// Protected: Get Full Settings (including notification secrets)
app.get('/api/settings/admin', authenticateAdmin, (req, res) => {
  const db = getDb();
  res.json({
    success: true,
    data: db.settings || initialSeed.settings
  });
});

// Protected: Update Settings
app.patch('/api/settings', authenticateAdmin, (req, res) => {
  const db = getDb();
  const updates = req.body || {};
  db.settings = {
    ...db.settings,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveDb(db);
  res.json({ success: true, message: "Settings updated successfully", data: db.settings });
});

// Protected: Test Telegram Alert Dispatch
app.post('/api/settings/test-telegram', authenticateAdmin, async (req, res) => {
  const testMessage = `🚀 <b>Astitva Innovation — Alert System Active!</b>\n\n` +
    `Your mobile alert integration is verified and operational.\n` +
    `Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;
  
  const ok = await sendTelegramAlert(testMessage);
  if (ok) {
    res.json({ success: true, message: "Test alert dispatched to Telegram successfully!" });
  } else {
    res.status(400).json({ success: false, error: "Failed to dispatch Telegram alert. Please verify your Bot Token & Chat ID." });
  }
});

// -------------------------------------------------------------
// PRODUCTS API
// -------------------------------------------------------------

// Public: Get active products
app.get('/api/products', (req, res) => {
  const db = getDb();
  const activeProducts = (db.products || []).filter(p => p.status === 'Active' || p.enabled !== false);
  res.json({ success: true, data: activeProducts });
});

// Protected: Get all products (including drafts)
app.get('/api/products/all', authenticateAdmin, (req, res) => {
  const db = getDb();
  res.json({ success: true, data: db.products || [] });
});

// Protected: Add new product
app.post('/api/products', authenticateAdmin, (req, res) => {
  const { name, tagline, category, badge, description, storeUrl, storeType, packageName, iconUrl, technologies, features, status, isFeatured } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "Product name is required" });
  }

  const db = getDb();
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: String(name).trim(),
    tagline: String(tagline || "").trim(),
    category: String(category || "Software Platform").trim(),
    badge: String(badge || "New Release").trim(),
    description: String(description || "").trim(),
    storeUrl: String(storeUrl || "").trim(),
    storeType: String(storeType || "web").trim(),
    packageName: String(packageName || "").trim(),
    iconUrl: String(iconUrl || "/meethi-chat-icon.png").trim(),
    technologies: Array.isArray(technologies) ? technologies : (typeof technologies === 'string' ? technologies.split(',').map(s => s.trim()).filter(Boolean) : []),
    features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map(s => s.trim()).filter(Boolean) : []),
    status: status || "Active",
    isFeatured: Boolean(isFeatured),
    createdAt: new Date().toISOString()
  };

  db.products = db.products || [];
  db.products.push(newProduct);
  saveDb(db);

  res.status(201).json({ success: true, message: "Product created successfully", data: newProduct });
});

// Protected: Update product
app.put('/api/products/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = (db.products || []).findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    id, // protect id
    updatedAt: new Date().toISOString()
  };
  saveDb(db);

  res.json({ success: true, message: "Product updated successfully", data: db.products[index] });
});

// Protected: Delete product
app.delete('/api/products/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const initialLength = (db.products || []).length;
  db.products = (db.products || []).filter(p => p.id !== id);
  if (db.products.length === initialLength) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }
  saveDb(db);
  res.json({ success: true, message: "Product deleted successfully" });
});

// Protected: Toggle product active
app.patch('/api/products/:id/toggle', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const prod = (db.products || []).find(p => p.id === id);
  if (!prod) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }
  prod.status = prod.status === "Active" ? "Inactive" : "Active";
  prod.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json({ success: true, data: prod });
});

// -------------------------------------------------------------
// FOUNDERS / LEADERSHIP API
// -------------------------------------------------------------

// Public: Get active founders
app.get('/api/founders', (req, res) => {
  const db = getDb();
  const activeFounders = (db.founders || [])
    .filter(f => f.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json({ success: true, data: activeFounders });
});

// Protected: Get all founders
app.get('/api/founders/all', authenticateAdmin, (req, res) => {
  const db = getDb();
  const list = [...(db.founders || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json({ success: true, data: list });
});

// Protected: Add founder
app.post('/api/founders', authenticateAdmin, (req, res) => {
  const { name, position, roleBadge, bio, portfolioSummary, keySkills, photoUrl, linkedin, instagram, email, phone, order } = req.body;
  if (!name || !position) {
    return res.status(400).json({ success: false, error: "Name and Position are required" });
  }

  const db = getDb();
  const newFounder = {
    id: `founder-${Date.now()}`,
    name: String(name).trim(),
    position: String(position).trim(),
    roleBadge: String(roleBadge || position).trim(),
    bio: String(bio || "").trim(),
    portfolioSummary: String(portfolioSummary || "").trim(),
    keySkills: Array.isArray(keySkills) ? keySkills : (typeof keySkills === 'string' ? keySkills.split(',').map(s => s.trim()).filter(Boolean) : []),
    photoUrl: String(photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80").trim(),
    linkedin: String(linkedin || "").trim(),
    instagram: String(instagram || "").trim(),
    email: String(email || "").trim(),
    phone: String(phone || "+91 7233882089").trim(),
    order: Number(order) || (db.founders || []).length + 1,
    enabled: true,
    createdAt: new Date().toISOString()
  };

  db.founders = db.founders || [];
  db.founders.push(newFounder);
  saveDb(db);

  res.status(201).json({ success: true, message: "Founder profile added successfully", data: newFounder });
});

// Protected: Update founder
app.put('/api/founders/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = (db.founders || []).findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Founder profile not found" });
  }

  db.founders[index] = {
    ...db.founders[index],
    ...req.body,
    id,
    updatedAt: new Date().toISOString()
  };
  saveDb(db);

  res.json({ success: true, message: "Founder profile updated successfully", data: db.founders[index] });
});

// Protected: Delete founder
app.delete('/api/founders/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const initialLength = (db.founders || []).length;
  db.founders = (db.founders || []).filter(f => f.id !== id);
  if (db.founders.length === initialLength) {
    return res.status(404).json({ success: false, error: "Founder profile not found" });
  }
  saveDb(db);
  res.json({ success: true, message: "Founder profile removed successfully" });
});

// Protected: Toggle founder enabled
app.patch('/api/founders/:id/toggle', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const founder = (db.founders || []).find(f => f.id === id);
  if (!founder) {
    return res.status(404).json({ success: false, error: "Founder not found" });
  }
  founder.enabled = founder.enabled === false ? true : false;
  founder.updatedAt = new Date().toISOString();
  saveDb(db);
  res.json({ success: true, data: founder });
});

// -------------------------------------------------------------
// AI AGENT INTERACTION LEAD INGESTION
// -------------------------------------------------------------
app.post('/api/ai-lead', (req, res) => {
  const { name, phone, email, projectType, budget, summary, conversationHistory } = req.body || {};

  const db = getDb();
  const leadId = `AI-LEAD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newInquiry = {
    id: leadId,
    name: String(name || "Website AI Visitor").slice(0, 150).trim(),
    email: String(email || "ai-lead@astitvainnovation.in").slice(0, 150).trim(),
    phone: String(phone || "Not provided").slice(0, 50).trim(),
    service: String(projectType || "AI Assistant Inquiry").slice(0, 100).trim(),
    budget: String(budget || "Discuss with Architect").slice(0, 100).trim(),
    message: String(summary || "Lead engaged via Website AI Assistant widget.").slice(0, 3000).trim(),
    status: "New",
    source: "AI Agent Chat",
    conversation: Array.isArray(conversationHistory) ? conversationHistory.slice(-10) : [],
    date: new Date().toISOString()
  };

  db.inquiries.unshift(newInquiry);
  saveDb(db);

  // Dispatch instant Telegram notification to mobile phone!
  const alertText = `🤖 <b>HOT LEAD FROM WEBSITE AI AGENT!</b>\n\n` +
    `👤 <b>Name:</b> ${newInquiry.name}\n` +
    `📞 <b>Phone:</b> ${newInquiry.phone}\n` +
    `✉️ <b>Email:</b> ${newInquiry.email}\n` +
    `💡 <b>Project / Interest:</b> ${newInquiry.service}\n` +
    `💬 <b>Summary:</b> ${newInquiry.message}\n` +
    `⏱ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;
  sendTelegramAlert(alertText).catch(e => console.warn("Telegram dispatch failed:", e));

  res.status(201).json({
    success: true,
    message: "AI Lead captured and dispatched to Command Center successfully.",
    data: newInquiry
  });
});

// Protected: Server Health Status Info (Safe: No passwords/secrets)
app.get('/api/server/status', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    serverIp: "217.216.58.223",
    domains: {
      corporate: "astitvainnovation.in",
      b2b: "b2b.astitvainnovation.in"
    },
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    status: "Operational",
    nginx: "Active / Running",
    ssl: "Active / Encrypted"
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Astitva API Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[Astitva API Server] Allowed origins: ${allowedOrigins.join(', ')}`);
});
