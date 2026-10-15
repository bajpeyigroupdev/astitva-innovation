const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const dashboardDir = path.join(rootDir, 'dashboard');

// Create temporary isolated scratch db for tests
const scratchDir = path.join(dashboardDir, 'scratch-e2e-data');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}
const testDbFile = path.join(scratchDir, 'db.json');
// Seed with existing db.json or fallback
const existingDbPath = path.join(serverDir, 'data', 'db.json');
if (fs.existsSync(existingDbPath)) {
  fs.copyFileSync(existingDbPath, testDbFile);
}

const TEST_PORT = 5002;
const PREVIEW_PORT = 4173;
const TEST_PASSWORD = 'StagingTestPass123!';
const TEST_PASSWORD_HASH = '$2a$10$rR/UVaLBKk2p5XbLsYCkTuSXZyLZIFND44gJ8NW8.25B1GPI36j6y';
const JWT_SECRET = 'staging-e2e-harness-jwt-secret-astitva-2026';

console.log('[E2E Runner] Starting isolated backend on port ' + TEST_PORT + '...');
const backend = spawn('node', ['server.js'], {
  cwd: serverDir,
  env: {
    ...process.env,
    PORT: String(TEST_PORT),
    DB_FILE: testDbFile,
    DATA_DIR: scratchDir,
    JWT_SECRET,
    ADMIN_USERNAME: 'AST-ADMIN-01',
    ADMIN_PASSWORD_HASH: TEST_PASSWORD_HASH,
    NODE_ENV: 'test',
    STAGING: 'true',
  },
  stdio: 'inherit',
});

function waitForUrl(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timeout waiting for ${url}`));
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  });
}

async function run() {
  try {
    await waitForUrl(`http://127.0.0.1:${TEST_PORT}/api/health`);
    console.log('[E2E Runner] Backend is healthy.');

    console.log('[E2E Runner] Starting dashboard preview on port ' + PREVIEW_PORT + '...');
    const preview = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
      cwd: dashboardDir,
      env: {
        ...process.env,
        VITE_API_URL: `http://127.0.0.1:${TEST_PORT}`,
      },
      stdio: 'inherit',
      shell: true,
    });

    await waitForUrl(`http://127.0.0.1:${PREVIEW_PORT}/`);
    console.log('[E2E Runner] Dashboard preview is ready.');

    console.log('[E2E Runner] Executing Playwright E2E suite...');
    const pw = spawn('npx', ['playwright', 'test'], {
      cwd: dashboardDir,
      env: {
        ...process.env,
        ADMIN_TEST_BASE_URL: `http://127.0.0.1:${PREVIEW_PORT}`,
        ADMIN_TEST_USERNAME: 'AST-ADMIN-01',
        ADMIN_TEST_PASSWORD: TEST_PASSWORD,
      },
      stdio: 'inherit',
      shell: true,
    });

    const exitCode = await new Promise((resolve) => {
      pw.on('close', resolve);
    });

    console.log(`[E2E Runner] Playwright finished with exit code ${exitCode}.`);

    // Teardown
    preview.kill();
    backend.kill();

    // Clean up scratch dir
    try {
      fs.rmSync(scratchDir, { recursive: true, force: true });
    } catch (e) {}

    process.exit(exitCode || 0);
  } catch (err) {
    console.error('[E2E Runner] Error:', err);
    backend.kill();
    try {
      fs.rmSync(scratchDir, { recursive: true, force: true });
    } catch (e) {}
    process.exit(1);
  }
}

run();
