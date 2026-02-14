const http = require("http");
const fs = require("fs");
const path = require("path");

function loadDotEnv() {
  // Allow running from `dist/` (preview) while keeping `.env` in the project root.
  const envCandidates = [
    path.join(process.cwd(), ".env"),
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", ".env"),
  ];
  const envPath = envCandidates.find((p) => fs.existsSync(p));
  if (!envPath) return;

  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 5500);
const API_BASE_URL = process.env.OTP_API_BASE_URL || "https://transmitor.signalads.com/api_v1";
const API_TOKEN = process.env.OTP_API_TOKEN || process.env.SIGNAL_AUTH_TOKEN;
const DEFAULT_PATTERN_ID = Number(process.env.OTP_PATTERN_ID || 950);
const PUBLIC_DIR = __dirname;

function finiteNumberOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Runtime calculator config (used by index.html via /runtime-config.js)
const OTP_CALC_MISSED_CALL_UNIT_PRICE = finiteNumberOr(process.env.OTP_CALC_MISSED_CALL_UNIT_PRICE, 73);
const OTP_CALC_SMS_UNIT_PRICE_MIN = finiteNumberOr(process.env.OTP_CALC_SMS_UNIT_PRICE_MIN, 140);
const OTP_CALC_SMS_UNIT_PRICE_MAX = finiteNumberOr(process.env.OTP_CALC_SMS_UNIT_PRICE_MAX, 300);
const OTP_CALC_SMS_UNIT_PRICE_DEFAULT = finiteNumberOr(process.env.OTP_CALC_SMS_UNIT_PRICE_DEFAULT, 180);
const OTP_CALC_SMS_UNIT_PRICE_STEP = finiteNumberOr(process.env.OTP_CALC_SMS_UNIT_PRICE_STEP, 10);

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function sendJs(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/javascript; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeDigits(value) {
  return String(value || "")
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

function normalizeIranianMobile(input) {
  let digits = normalizeDigits(input).replace(/\D/g, "");

  if (digits.startsWith("0098")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("98")) {
    digits = digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("09")) {
    return digits;
  }

  if (digits.length === 10 && digits.startsWith("9")) {
    return `0${digits}`;
  }

  return null;
}

async function callUpstream(endpoint, payload) {
  if (!API_TOKEN) {
    return {
      status: 500,
      body: { success: false, message: "Server auth token is not configured" },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: "Invalid upstream response", raw: text };
    }

    return { status: response.status, body: data };
  } catch {
    return {
      status: 502,
      body: { success: false, message: "Cannot reach upstream OTP API" },
    };
  }
}

async function handleApiRequest(req, res, pathname) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, message: "Method Not Allowed" });
    return;
  }

  const body = await readJsonBody(req);
  if (body === null) {
    sendJson(res, 400, { success: false, message: "Invalid JSON body" });
    return;
  }

  if (pathname === "/api/otp/send") {
    const mobile = normalizeIranianMobile(body.mobile);
    if (!mobile) {
      sendJson(res, 400, { success: false, message: "Invalid mobile number" });
      return;
    }

    const patternId = Number(body.pattern_id || DEFAULT_PATTERN_ID);
    const result = await callUpstream("/otp/send", {
      mobile,
      pattern_id: Number.isFinite(patternId) ? patternId : DEFAULT_PATTERN_ID,
    });
    sendJson(res, result.status, result.body);
    return;
  }

  if (pathname === "/api/otp/verify") {
    const otpUuid = String(body.otp_uuid || body.uuid || "").trim();
    const code = normalizeDigits(String(body.code || "")).replace(/\D/g, "");

    if (!otpUuid || !code) {
      sendJson(res, 400, { success: false, message: "otp_uuid and code are required" });
      return;
    }

    const result = await callUpstream("/otp/verify", {
      // Upstream API expects `uuid` (see project docs/examples). Keep accepting `otp_uuid` from clients.
      uuid: otpUuid,
      code,
    });
    sendJson(res, result.status, result.body);
    return;
  }

  sendJson(res, 404, { success: false, message: "API route not found" });
}

function safeJoin(base, target) {
  const targetPath = path.normalize(path.join(base, target));
  if (!targetPath.startsWith(base)) {
    return null;
  }
  return targetPath;
}

function serveStatic(req, res, pathname) {
  let requestedPath = pathname;
  if (requestedPath === "/") {
    requestedPath = "/index.html";
  } else if (requestedPath === "/test") {
    requestedPath = "/test.html";
  }

  const filePath = safeJoin(PUBLIC_DIR, decodeURIComponent(requestedPath));
  if (!filePath) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendText(res, 404, "Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (pathname === "/api/health") {
    sendJson(res, 200, { success: true, service: "otp-proxy" });
    return;
  }

  if (pathname === "/runtime-config.js") {
    const cfg = {
      missedCallUnitPrice: OTP_CALC_MISSED_CALL_UNIT_PRICE,
      smsUnitPriceMin: OTP_CALC_SMS_UNIT_PRICE_MIN,
      smsUnitPriceMax: OTP_CALC_SMS_UNIT_PRICE_MAX,
      smsUnitPriceDefault: OTP_CALC_SMS_UNIT_PRICE_DEFAULT,
      smsUnitPriceStep: OTP_CALC_SMS_UNIT_PRICE_STEP,
    };

    sendJs(res, 200, `window.__OTP_CALC_CONFIG__ = ${JSON.stringify(cfg)};\n`);
    return;
  }

  if (pathname.startsWith("/api/")) {
    await handleApiRequest(req, res, pathname);
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
