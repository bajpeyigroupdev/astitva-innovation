const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateAdmin } = require('./adminAuth');
const { sanitizeAdminSettings, mergeAdminSettings } = require('./settingsSecurity');
const { clearLegacyDefaultVerifyToken, clearUnverifiedWhatsAppClaims } = require('./whatsapp/whatsappConfigSecurity');
const createMetaDataDeletionRouter = require('./metaDataDeletionRoutes');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const {
  DATA_DIR,
  DB_FILE,
  initialSeed,
  getDb,
  saveDb,
  createNamedBackup,
  restoreFromBackupFile,
} = require('./storage');

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

app.use(express.json({
  limit: "50mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 3. Rate Limiters
const isRateLimitBypassed = () => {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.NODE_ENV === 'test' || process.env.STAGING === 'true';
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isRateLimitBypassed() ? 1000 : 10,
  skip: () => isRateLimitBypassed(),
  message: { success: false, error: "Too many authentication attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isRateLimitBypassed() ? 10000 : 120,
  skip: (req) => isRateLimitBypassed() || req.path.startsWith('/whatsapp/webhook'),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

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

  if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password) {
    return res.status(400).json({ success: false, error: "Username and password are required." });
  }

  const configuredUser = process.env.ADMIN_USERNAME || "AST-ADMIN-01";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const jwtSecret = process.env.JWT_SECRET;

  if (!passwordHash || !jwtSecret) {
    console.error("Administrator authentication is not fully configured.");
    return res.status(503).json({ success: false, error: "Server authentication configuration missing." });
  }

  // Artificial timing protection
  await new Promise(r => setTimeout(r, 200));

  if (username.trim().toUpperCase() !== configuredUser.trim().toUpperCase()) {
    return res.status(401).json({ success: false, error: "Access Denied: Invalid Administrator ID or Password." });
  }

  const isPasswordValid = bcrypt.compareSync(password, passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, error: "Access Denied: Invalid Administrator ID or Password." });
  }

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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Inquiry could not be persisted." });
  }

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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Status could not be persisted." });
  }

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

  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Deletion could not be persisted." });
  }
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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Simulation could not be persisted." });
  }

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

  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Service updates could not be persisted." });
  }
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
    data: sanitizeAdminSettings(db.settings || initialSeed.settings)
  });
});

// Protected: Update Settings
app.patch('/api/settings', authenticateAdmin, (req, res) => {
  const db = getDb();
  const updates = req.body || {};
  db.settings = mergeAdminSettings(db.settings || initialSeed.settings, updates);
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Settings could not be persisted." });
  }
  res.json({ success: true, message: "Settings updated successfully", data: sanitizeAdminSettings(db.settings) });
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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Product could not be persisted." });
  }

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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Product could not be persisted." });
  }

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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Deletion could not be persisted." });
  }
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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Status could not be persisted." });
  }
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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Founder could not be persisted." });
  }

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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Founder could not be persisted." });
  }

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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Deletion could not be persisted." });
  }
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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Status could not be persisted." });
  }
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
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage unavailable. Inquiry could not be persisted." });
  }

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

// -------------------------------------------------------------
// CAREERS & HIRING APIs (Public & Admin)
// -------------------------------------------------------------

// Public: List active jobs
app.get('/api/jobs', (req, res) => {
  const db = getDb();
  const activeJobs = (db.jobs || []).filter(j => j.status === 'Active' && j.enabled !== false);
  res.json({ success: true, count: activeJobs.length, data: activeJobs });
});

// Public: Get single job details
app.get('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const job = (db.jobs || []).find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ success: false, error: "Position not found or inactive" });
  }
  res.json({ success: true, data: job });
});

// Public: Submit job application
app.post('/api/jobs/apply', (req, res) => {
  const { jobId, name, email, phone, experience, currentCompany, resumeUrl, portfolioUrl, coverNote } = req.body || {};

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, error: "Name, email, and phone number are required." });
  }

  const db = getDb();
  const targetJob = (db.jobs || []).find(j => j.id === jobId);
  const jobTitle = targetJob ? targetJob.title : "General Engineering Application";

  const appId = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newApplication = {
    id: appId,
    jobId: jobId || "general",
    jobTitle: jobTitle,
    name: String(name).trim().slice(0, 150),
    email: String(email).trim().slice(0, 150),
    phone: String(phone).trim().slice(0, 50),
    experience: String(experience || "Not specified").trim().slice(0, 100),
    currentCompany: String(currentCompany || "").trim().slice(0, 150),
    resumeUrl: String(resumeUrl || "").trim().slice(0, 500),
    portfolioUrl: String(portfolioUrl || "").trim().slice(0, 500),
    coverNote: String(coverNote || "").trim().slice(0, 3000),
    status: "Applied",
    adminNotes: "",
    appliedAt: new Date().toISOString()
  };

  db.jobApplications = db.jobApplications || [];
  db.jobApplications.unshift(newApplication);
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage failure while saving job application." });
  }

  // Instant notification to Admin mobile phone via Telegram
  const alertText = `💼 <b>NEW JOB APPLICATION RECEIVED!</b>\n\n` +
    `🎯 <b>Role:</b> ${newApplication.jobTitle}\n` +
    `👤 <b>Candidate:</b> ${newApplication.name}\n` +
    `📞 <b>Phone:</b> ${newApplication.phone}\n` +
    `✉️ <b>Email:</b> ${newApplication.email}\n` +
    `⏳ <b>Experience:</b> ${newApplication.experience}\n` +
    `📄 <b>Resume:</b> ${newApplication.resumeUrl || "Not attached"}\n` +
    `⏱ <b>Applied:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;
  sendTelegramAlert(alertText).catch(e => console.warn("Telegram dispatch failed:", e));

  res.status(201).json({
    success: true,
    message: "Application submitted successfully! Our talent acquisition team will review your profile.",
    data: newApplication
  });
});

// Protected: Get all jobs (with applicant counts)
app.get('/api/admin/jobs', authenticateAdmin, (req, res) => {
  const db = getDb();
  const jobs = (db.jobs || []).map(job => {
    const applicantCount = (db.jobApplications || []).filter(app => app.jobId === job.id).length;
    return { ...job, applicantCount };
  });
  res.json({ success: true, count: jobs.length, data: jobs });
});

// Protected: Create new job posting
app.post('/api/admin/jobs', authenticateAdmin, (req, res) => {
  const { title, department, location, type, experience, salary, description, requirements, benefits } = req.body || {};

  if (!title || !department) {
    return res.status(400).json({ success: false, error: "Title and Department are required." });
  }

  const db = getDb();
  const newJob = {
    id: `job-${Date.now()}`,
    title: String(title).trim(),
    department: String(department).trim(),
    location: String(location || "Remote").trim(),
    type: String(type || "Full-Time").trim(),
    experience: String(experience || "2+ Years").trim(),
    salary: String(salary || "Competitive").trim(),
    description: String(description || "").trim(),
    requirements: Array.isArray(requirements) ? requirements : (typeof requirements === 'string' ? requirements.split('\n').filter(Boolean) : []),
    benefits: Array.isArray(benefits) ? benefits : (typeof benefits === 'string' ? benefits.split('\n').filter(Boolean) : []),
    status: "Active",
    enabled: true,
    createdAt: new Date().toISOString()
  };

  db.jobs = db.jobs || [];
  db.jobs.unshift(newJob);
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage failure while saving job." });
  }

  res.status(201).json({ success: true, message: "Job position posted successfully", data: newJob });
});

// Protected: Update existing job
app.put('/api/admin/jobs/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = (db.jobs || []).findIndex(j => j.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Job not found" });
  }

  db.jobs[index] = {
    ...db.jobs[index],
    ...req.body,
    id,
    updatedAt: new Date().toISOString()
  };
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage failure while updating job." });
  }

  res.json({ success: true, message: "Job position updated successfully", data: db.jobs[index] });
});

// Protected: Toggle job status (Active / Closed)
app.patch('/api/admin/jobs/:id/toggle', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const job = (db.jobs || []).find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ success: false, error: "Job not found" });
  }

  job.status = job.status === "Active" ? "Closed" : "Active";
  job.enabled = job.status === "Active";
  job.updatedAt = new Date().toISOString();
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage failure while updating job status." });
  }

  res.json({ success: true, data: job });
});

// Protected: Delete job
app.delete('/api/admin/jobs/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const initialLength = (db.jobs || []).length;
  db.jobs = (db.jobs || []).filter(j => j.id !== id);
  if (db.jobs.length === initialLength) {
    return res.status(404).json({ success: false, error: "Job not found" });
  }
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage failure while deleting job." });
  }
  res.json({ success: true, message: "Job removed successfully" });
});

// Protected: Get all job applications
app.get('/api/admin/job-applications', authenticateAdmin, (req, res) => {
  const { jobId, status } = req.query;
  const db = getDb();
  let applications = db.jobApplications || [];

  if (jobId) {
    applications = applications.filter(a => a.jobId === jobId);
  }
  if (status && status !== 'All') {
    applications = applications.filter(a => a.status === status);
  }

  res.json({ success: true, count: applications.length, data: applications });
});

// Protected: Update application status and admin notes (e.g. Hire, Shortlist, Reject)
app.patch('/api/admin/job-applications/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const db = getDb();
  const appItem = (db.jobApplications || []).find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ success: false, error: "Application not found" });
  }

  if (status) appItem.status = status;
  if (adminNotes !== undefined) appItem.adminNotes = adminNotes;
  appItem.updatedAt = new Date().toISOString();
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage failure while updating candidate application." });
  }

  res.json({ success: true, message: "Candidate application updated successfully", data: appItem });
});

// Protected: Delete application
app.delete('/api/admin/job-applications/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const initialLength = (db.jobApplications || []).length;
  db.jobApplications = (db.jobApplications || []).filter(a => a.id !== id);
  if (db.jobApplications.length === initialLength) {
    return res.status(404).json({ success: false, error: "Application not found" });
  }
  if (!saveDb(db)) {
    return res.status(503).json({ success: false, error: "Database storage failure while deleting candidate application." });
  }
  res.json({ success: true, message: "Application deleted successfully" });
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

// Meta / Facebook User Data Deletion Callback Endpoint
app.use('/api', createMetaDataDeletionRouter({ getDb, saveDb }));

// WhatsApp Business Platform API Management Subsystem
const createWhatsAppRouter = require('./whatsapp/whatsappRoutes');
app.use('/api/whatsapp', createWhatsAppRouter({ getDb, saveDb, authenticateAdmin }));

// Start Server if executed directly
let serverInstance = null;
if (require.main === module) {
  serverInstance = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Astitva API Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Astitva API Server] Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}

module.exports = { app, getDb, saveDb, initialSeed, serverInstance };
