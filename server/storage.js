const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'db.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

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
  inquiries: [],
  fintechLogs: [],
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
  ],
  jobs: [
    {
      id: "job-fullstack-01",
      title: "Senior Full-Stack Architect (Node.js & React)",
      department: "Engineering",
      location: "Remote / Hybrid",
      type: "Full-Time",
      experience: "3 - 6 Years",
      salary: "₹12,00,000 - ₹24,00,000 LPA",
      description: "Architect, develop, and scale high-concurrency microservices, FinTech payment routing integrations, and responsive administrative web applications.",
      requirements: [
        "Deep expertise in TypeScript, Node.js, Express, and React",
        "Strong experience with Redis caching, PostgreSQL / MongoDB, and real-time WebSockets",
        "Hands-on background with Docker, Nginx reverse proxying, and cloud deployments",
        "Understanding of payment gateway lifecycles (Razorpay, Cashfree, Stripe) and webhook idempotency"
      ],
      benefits: [
        "High-ownership engineering culture",
        "Flexible remote work hours",
        "Performance equity incentives",
        "Direct collaboration with founding architects"
      ],
      status: "Active",
      enabled: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "job-mobile-02",
      title: "React Native / Mobile Engineer (Audio & WebRTC)",
      department: "Mobile Engineering",
      location: "Remote",
      type: "Full-Time",
      experience: "2 - 5 Years",
      salary: "₹10,00,000 - ₹20,00,000 LPA",
      description: "Develop, optimize, and ship high-performance features for flagship voice social platform Meethi Chat, managing low-latency audio streams and native device bridges.",
      requirements: [
        "Demonstrated mastery of React Native / Android Native bridging",
        "Experience with WebRTC audio streams, InCallManager, and background socket lifecycles",
        "State management proficiency (Redux / Context / Zustand)",
        "Proven track record of deploying polished apps to Google Play Console"
      ],
      benefits: [
        "Shape social voice technology impacting thousands of daily active users",
        "Modern hardware budget & remote allowance",
        "Direct product roadmap influence"
      ],
      status: "Active",
      enabled: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "job-devops-03",
      title: "DevOps & Cloud Security Specialist",
      department: "Infrastructure",
      location: "Remote",
      type: "Full-Time",
      experience: "3 - 5 Years",
      salary: "₹14,00,000 - ₹26,00,000 LPA",
      description: "Lead production cloud infrastructure, automated GitHub Actions CI/CD pipelines, SSL automation, and bank-grade application firewalls.",
      requirements: [
        "Advanced Linux server administration (Ubuntu / Debian)",
        "GitHub Actions CI/CD automation and container orchestration (Docker)",
        "Nginx virtual host security, rate limiting, and Let's Encrypt Certbot",
        "System telemetry, PM2 cluster management, and DDoS mitigation strategies"
      ],
      benefits: [
        "Ownership over high-availability infrastructure",
        "Cloud experimentation budget",
        "Autonomous engineering schedules"
      ],
      status: "Active",
      enabled: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "job-uiux-04",
      title: "Lead Product & UI/UX Designer",
      department: "Design & Product",
      location: "Remote",
      type: "Full-Time",
      experience: "2 - 4 Years",
      salary: "₹8,00,000 - ₹16,00,000 LPA",
      description: "Design futuristic, ultra-polished, and intuitive user experiences for enterprise B2B panels, corporate showcases, and mobile consumer apps.",
      requirements: [
        "Mastery of Figma, modern design tokens, auto-layout, and clickable prototypes",
        "Exceptional eye for typography, glassmorphism, dark-mode aesthetics, and micro-interactions",
        "Experience collaborating directly with frontend engineers for pixel-perfect execution"
      ],
      benefits: [
        "Design-led product decisions",
        "Portfolio freedom on major releases",
        "Flexible working arrangement"
      ],
      status: "Active",
      enabled: true,
      createdAt: new Date().toISOString()
    }
  ],
  jobApplications: [],
  whatsappConfig: {
    status: "Disconnected",
    wabaId: "",
    phoneNumberId: "",
    businessPhoneNumber: "+91 7233882089",
    displayName: "Astitva Innovation",
    qualityRating: "UNKNOWN",
    codeVerificationStatus: "NOT_VERIFIED",
    messagingLimitTier: "UNKNOWN",
    webhookVerified: false,
    webhookSubscriptionStatus: "Pending",
    verifyToken: "",
    apiVersion: "v20.0",
    lastSync: null,
    errorMessage: null,
    paymentConfigured: false,
    permissionsReviewed: false,
    privacyPolicyVerified: false,
    verificationSchemaVersion: 2
  },
  whatsappTenants: [],
  whatsappContacts: [],
  whatsappConversations: [],
  whatsappMessages: [],
  whatsappTemplates: [
    {
      id: "tmpl_welcome_lead_v1",
      name: "astitva_welcome_lead",
      category: "UTILITY",
      language: "en_US",
      status: "LOCAL_DRAFT",
      components: [
        {
          type: "BODY",
          text: "Hello {{1}}, thank you for reaching out to Astitva Innovation! Our senior engineering desk has received your request regarding {{2}}. An architect will connect with you shortly."
        },
        {
          type: "FOOTER",
          text: "Astitva Innovation • Enterprise Software Solutions"
        }
      ],
      lastSyncedAt: null
    },
    {
      id: "tmpl_proposal_ready_v1",
      name: "astitva_proposal_ready",
      category: "UTILITY",
      language: "en_US",
      status: "LOCAL_DRAFT",
      components: [
        {
          type: "BODY",
          text: "Hi {{1}}, your technical architecture proposal for {{2}} is ready for review. Access your statement of work here: {{3}}."
        },
        {
          type: "FOOTER",
          text: "Astitva Innovation Engineering Desk"
        }
      ],
      lastSyncedAt: null
    }
  ],
  whatsappWebhookLogs: [],
  whatsappApiLogs: [],
  whatsappDeliveryLogs: [],
  whatsappEvidence: [],
  whatsappChecklist: [],
  auditLogs: [],
  metaDataDeletionRequests: []
};

const LEGACY_DEFAULT_VERIFY_TOKEN_SHA256 = '366c8b4cf848a609dd6fec20a3b6dd7d292418e5944111ff8fb339b16ea058e5';

function clearLegacyDefaultVerifyToken(data) {
  if (!data?.whatsappConfig?.verifyToken) return false;
  const hash = crypto.createHash('sha256').update(data.whatsappConfig.verifyToken).digest('hex');
  if (hash === LEGACY_DEFAULT_VERIFY_TOKEN_SHA256) {
    data.whatsappConfig.verifyToken = '';
    return true;
  }
  return false;
}

function clearUnverifiedWhatsAppClaims(data) {
  if (!data?.whatsappConfig) return false;
  let modified = false;
  if (!data.whatsappConfig.verificationSchemaVersion || data.whatsappConfig.verificationSchemaVersion < 2) {
    data.whatsappConfig.verificationSchemaVersion = 2;
    data.whatsappConfig.qualityRating = 'UNKNOWN';
    data.whatsappConfig.codeVerificationStatus = 'NOT_VERIFIED';
    data.whatsappConfig.messagingLimitTier = 'UNKNOWN';
    data.whatsappConfig.webhookVerified = false;
    data.whatsappConfig.webhookSubscriptionStatus = 'Pending';
    if (!data.whatsappConfig.token) {
      data.whatsappConfig.status = 'Disconnected';
    }
    modified = true;
  }
  return modified;
}

function ensureDirectories() {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

function pruneOldBackups(maxBackups = 20) {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) return;
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter((file) => file.startsWith('db-backup-') && file.endsWith('.json'))
      .map((file) => ({
        file,
        fullPath: path.join(BACKUPS_DIR, file),
        time: fs.statSync(path.join(BACKUPS_DIR, file)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > maxBackups) {
      for (let i = maxBackups; i < files.length; i++) {
        try {
          fs.unlinkSync(files[i].fullPath);
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn('[Storage] Pruning old backups warning:', err.message);
  }
}

function getLatestValidBackup() {
  try {
    const bakFile = `${DB_FILE}.bak`;
    if (fs.existsSync(bakFile)) {
      try {
        const raw = fs.readFileSync(bakFile, 'utf8');
        return { data: JSON.parse(raw), source: bakFile };
      } catch (_) {}
    }

    if (fs.existsSync(BACKUPS_DIR)) {
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter((file) => file.endsWith('.json'))
        .map((file) => ({
          file,
          fullPath: path.join(BACKUPS_DIR, file),
          time: fs.statSync(path.join(BACKUPS_DIR, file)).mtimeMs,
        }))
        .sort((a, b) => b.time - a.time);

      for (const item of files) {
        try {
          const raw = fs.readFileSync(item.fullPath, 'utf8');
          return { data: JSON.parse(raw), source: item.fullPath };
        } catch (_) {}
      }
    }
  } catch (_) {}
  return null;
}

function getDb() {
  ensureDirectories();
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2));
      return JSON.parse(JSON.stringify(initialSeed));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);

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
    if (!data.jobs || !Array.isArray(data.jobs)) {
      data.jobs = initialSeed.jobs;
      modified = true;
    }
    if (clearLegacyDefaultVerifyToken(data)) modified = true;
    if (!data.jobApplications || !Array.isArray(data.jobApplications)) {
      data.jobApplications = initialSeed.jobApplications;
      modified = true;
    }
    if (!data.whatsappConfig || typeof data.whatsappConfig !== 'object' || Array.isArray(data.whatsappConfig)) {
      data.whatsappConfig = initialSeed.whatsappConfig;
      modified = true;
    }
    if (clearUnverifiedWhatsAppClaims(data)) modified = true;
    if (!data.whatsappTenants || !Array.isArray(data.whatsappTenants)) {
      data.whatsappTenants = [];
      modified = true;
    }
    if (!data.whatsappConversations || !Array.isArray(data.whatsappConversations)) {
      data.whatsappConversations = initialSeed.whatsappConversations;
      modified = true;
    }
    if (!data.whatsappMessages || !Array.isArray(data.whatsappMessages)) {
      data.whatsappMessages = initialSeed.whatsappMessages;
      modified = true;
    }
    if (!data.whatsappTemplates || !Array.isArray(data.whatsappTemplates)) {
      data.whatsappTemplates = initialSeed.whatsappTemplates;
      modified = true;
    }
    if (!data.whatsappWebhookLogs || !Array.isArray(data.whatsappWebhookLogs)) {
      data.whatsappWebhookLogs = initialSeed.whatsappWebhookLogs;
      modified = true;
    }
    if (!data.whatsappApiLogs || !Array.isArray(data.whatsappApiLogs)) {
      data.whatsappApiLogs = initialSeed.whatsappApiLogs;
      modified = true;
    }
    if (!data.whatsappContacts || !Array.isArray(data.whatsappContacts)) {
      data.whatsappContacts = initialSeed.whatsappContacts;
      modified = true;
    }
    if (!data.whatsappDeliveryLogs || !Array.isArray(data.whatsappDeliveryLogs)) {
      data.whatsappDeliveryLogs = initialSeed.whatsappDeliveryLogs;
      modified = true;
    }
    if (!data.whatsappEvidence || !Array.isArray(data.whatsappEvidence)) {
      data.whatsappEvidence = initialSeed.whatsappEvidence;
      modified = true;
    }
    if (!data.whatsappChecklist || !Array.isArray(data.whatsappChecklist)) {
      data.whatsappChecklist = initialSeed.whatsappChecklist;
      modified = true;
    }
    if (!data.auditLogs || !Array.isArray(data.auditLogs)) {
      data.auditLogs = initialSeed.auditLogs;
      modified = true;
    }
    if (!data.metaDataDeletionRequests || !Array.isArray(data.metaDataDeletionRequests)) {
      data.metaDataDeletionRequests = initialSeed.metaDataDeletionRequests;
      modified = true;
    }
    if (modified) {
      saveDb(data);
    }
    return data;
  } catch (err) {
    console.error("[Storage] DB Read Error:", err.message);
    // If the file exists but could not be parsed, preserve it and attempt recovery from backup
    if (fs.existsSync(DB_FILE)) {
      const corruptPath = `${DB_FILE}.corrupt.${Date.now()}`;
      try {
        fs.copyFileSync(DB_FILE, corruptPath);
        console.warn(`[Storage] Preserved corrupted database to ${corruptPath}`);
      } catch (_) {}

      const backup = getLatestValidBackup();
      if (backup?.data) {
        console.warn(`[Storage] Successfully restored database from backup: ${backup.source}`);
        saveDb(backup.data);
        return backup.data;
      }
      throw new Error(`CRITICAL: Database file ${DB_FILE} is corrupt and no valid backup exists. Halting to prevent data loss.`);
    }
    return JSON.parse(JSON.stringify(initialSeed));
  }
}

function saveDb(data) {
  if (!data || typeof data !== 'object') {
    console.error('[Storage] Refusing to persist invalid database object:', typeof data);
    return false;
  }

  ensureDirectories();
  const serialized = JSON.stringify(data, null, 2);
  const tempFile = `${DB_FILE}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;

  try {
    // 1. Write to temp file with synchronous flush
    const fd = fs.openSync(tempFile, 'w');
    fs.writeSync(fd, serialized);
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    // 2. Rotate backup if existing file is valid
    if (fs.existsSync(DB_FILE)) {
      const bakFile = `${DB_FILE}.bak`;
      try {
        fs.copyFileSync(DB_FILE, bakFile);
      } catch (_) {}

      // Snapshot to backups directory periodically (every ~30s or on significant changes)
      const snapshotFile = path.join(BACKUPS_DIR, `db-backup-${Date.now()}.json`);
      try {
        fs.copyFileSync(DB_FILE, snapshotFile);
        pruneOldBackups(20);
      } catch (_) {}
    }

    // 3. Atomic rename with Windows retry loop
    let renamed = false;
    let attempts = 0;
    while (!renamed && attempts < 4) {
      try {
        fs.renameSync(tempFile, DB_FILE);
        renamed = true;
      } catch (renameErr) {
        attempts++;
        if (attempts >= 4) {
          // Fallback: Copy and unlink if rename is blocked by another process
          fs.copyFileSync(tempFile, DB_FILE);
          try { fs.unlinkSync(tempFile); } catch (_) {}
          renamed = true;
        } else {
          // Brief synchronous pause for Windows file handles
          const end = Date.now() + 15 * attempts;
          while (Date.now() < end) {}
        }
      }
    }

    return true;
  } catch (err) {
    console.error('[Storage] DB Write Error:', err);
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch (_) {}
    return false;
  }
}

function createNamedBackup(tag = 'manual') {
  ensureDirectories();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `db-backup-${tag}-${timestamp}.json`;
  const backupPath = path.join(BACKUPS_DIR, backupFileName);

  if (fs.existsSync(DB_FILE)) {
    fs.copyFileSync(DB_FILE, backupPath);
    return { success: true, path: backupPath, filename: backupFileName };
  } else {
    const data = getDb();
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    return { success: true, path: backupPath, filename: backupFileName };
  }
}

function restoreFromBackupFile(targetBackupPath) {
  if (!fs.existsSync(targetBackupPath)) {
    return { success: false, error: `Backup file does not exist: ${targetBackupPath}` };
  }
  try {
    const raw = fs.readFileSync(targetBackupPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { success: false, error: 'Backup file does not contain a valid database object.' };
    }
    const requiredKeys = ['settings', 'products', 'services'];
    const hasCore = requiredKeys.some((k) => k in parsed);
    if (!hasCore) {
      return { success: false, error: 'Backup file does not match expected database schema (missing core collections).' };
    }
    createNamedBackup('pre-rollback');
    const ok = saveDb(parsed);
    return { success: ok, error: ok ? null : 'Failed to write restored data to primary store.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  DATA_DIR,
  DB_FILE,
  BACKUPS_DIR,
  initialSeed,
  getDb,
  saveDb,
  createNamedBackup,
  restoreFromBackupFile,
  getLatestValidBackup,
  clearLegacyDefaultVerifyToken,
  clearUnverifiedWhatsAppClaims,
};
