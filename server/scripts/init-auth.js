const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Utility to generate a hash for a given password argument
const password = process.argv[2];
const username = process.argv[3] || 'AST-ADMIN-01';

if (!password) {
  console.log('Usage: node init-auth.js <password> [username]');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(12);
const hash = bcrypt.hashSync(password, salt);
const jwtSecret = crypto.randomBytes(48).toString('hex');

const envContent = `# Production Server Environment Variables (Gitignored)
PORT=5000
NODE_ENV=production
ADMIN_USERNAME=${username}
ADMIN_PASSWORD_HASH=${hash}
JWT_SECRET=${jwtSecret}
ALLOWED_ORIGINS=https://astitvainnovation.in,https://www.astitvainnovation.in,https://b2b.astitvainnovation.in,http://localhost:5173,http://localhost:5174,http://localhost:3000
`;

fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
console.log('Server environment initialized successfully with bcrypt hash.');
