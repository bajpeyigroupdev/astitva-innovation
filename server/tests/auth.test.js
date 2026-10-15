const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { authenticateAdmin } = require("../adminAuth");

function invokeMiddleware(authorization) {
  const response = { statusCode: 200, body: null };
  let nextCalled = false;
  const res = {
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(body) {
      response.body = body;
      return this;
    },
  };
  const req = { headers: authorization ? { authorization } : {} };

  authenticateAdmin(req, res, () => {
    nextCalled = true;
  });

  return { response, nextCalled, admin: req.admin };
}

const previousSecret = process.env.JWT_SECRET;
const testSecret = "unit-test-only-jwt-secret";

try {
  delete process.env.JWT_SECRET;
  const missingSecret = invokeMiddleware("Bearer arbitrary-token");
  assert.equal(missingSecret.response.statusCode, 503);
  assert.equal(missingSecret.nextCalled, false);

  process.env.JWT_SECRET = testSecret;
  const noToken = invokeMiddleware();
  assert.equal(noToken.response.statusCode, 401);
  assert.equal(noToken.nextCalled, false);

  const invalidToken = invokeMiddleware("Bearer invalid-token");
  assert.equal(invalidToken.response.statusCode, 401);
  assert.equal(invalidToken.nextCalled, false);

  const nonAdminToken = jwt.sign({ username: "test-user", role: "analyst" }, testSecret);
  const nonAdmin = invokeMiddleware(`Bearer ${nonAdminToken}`);
  assert.equal(nonAdmin.response.statusCode, 403);
  assert.equal(nonAdmin.nextCalled, false);

  const adminToken = jwt.sign({ username: "test-admin", role: "admin" }, testSecret);
  const validAdmin = invokeMiddleware(`Bearer ${adminToken}`);
  assert.equal(validAdmin.response.statusCode, 200);
  assert.equal(validAdmin.nextCalled, true);
  assert.equal(validAdmin.admin.username, "test-admin");

  console.log("PASS: administrator auth middleware rejects missing secrets, missing/invalid tokens, and non-admin roles");
} finally {
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
}
