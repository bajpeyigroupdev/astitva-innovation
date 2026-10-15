const jwt = require("jsonwebtoken");

function verifyAdminToken(token) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    const error = new Error("Authentication service is not configured.");
    error.status = 503;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch {
    const error = new Error("Session token expired or invalid.");
    error.status = 401;
    throw error;
  }

  if (!decoded || typeof decoded !== "object" || decoded.role !== "admin" || typeof decoded.username !== "string" || !decoded.username) {
    const error = new Error("Administrator role required.");
    error.status = 403;
    throw error;
  }
  return decoded;
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerMatch = typeof authHeader === "string" ? authHeader.match(/^Bearer\s+(\S+)$/i) : null;
  if (!bearerMatch) {
    return res.status(401).json({ success: false, error: "Access Denied: Missing or invalid authorization header." });
  }

  try {
    req.admin = verifyAdminToken(bearerMatch[1]);
    return next();
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 401;
    const message = status === 503
      ? "Authentication service is not configured."
      : status === 403
        ? "Access Denied: Administrator role required."
        : "Access Denied: Session token expired or invalid.";
    return res.status(status).json({ success: false, error: message });
  }
}

module.exports = { authenticateAdmin, verifyAdminToken };
