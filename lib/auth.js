const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const storage = require("./user-storage");

const JWT_SECRET = process.env.JWT_SECRET || "nazorat-dev-secret-change-in-production";
const JWT_EXPIRES = "7d";
const SALT_ROUNDS = 10;

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "uvaysiddin75@gmail.com").trim().toLowerCase();
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  (process.env.NODE_ENV === "production" ? "salmic1023" : "");
const ADMIN_NAME = process.env.ADMIN_NAME || "Uvaysiddin";
const REGISTRATION_ENABLED = process.env.REGISTRATION_ENABLED !== "false";

function loadUsers() {
  return storage.loadUsers();
}

async function saveUsers(data) {
  await storage.saveUsers(data);
}

async function init() {
  await storage.init();
  await ensureDefaultAdmin();
}

async function ensureDefaultAdmin() {
  const data = loadUsers();
  const password = ADMIN_PASSWORD || "admin123";
  const isProd = process.env.NODE_ENV === "production";
  const syncPassword = Boolean(ADMIN_PASSWORD) || isProd;

  if (!REGISTRATION_ENABLED) {
    data.users = data.users.filter((u) => u.email.toLowerCase() === ADMIN_EMAIL);
  }

  let admin = data.users.find((u) => u.email.toLowerCase() === ADMIN_EMAIL);

  if (admin) {
    admin.role = "admin";
    admin.name = ADMIN_NAME;
    if (syncPassword) {
      admin.passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
      admin.passwordPlain = password;
    }
  } else {
    admin = {
      id: crypto.randomUUID(),
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash: bcrypt.hashSync(password, SALT_ROUNDS),
      passwordPlain: password,
      role: "admin",
      createdAt: new Date().toISOString(),
      progress: {},
    };
    data.users.push(admin);
  }

  await saveUsers(data);
}

function findUserByEmail(email) {
  const data = loadUsers();
  return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function findUserById(id) {
  const data = loadUsers();
  return data.users.find((u) => u.id === id) || null;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    createdAt: user.createdAt,
    progress: user.progress || {},
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function register({ name, email, password }) {
  name = name?.trim();
  email = email?.trim().toLowerCase();
  password = password?.trim();
  if (!REGISTRATION_ENABLED) {
    throw new Error("Ro'yxatdan o'tish o'chirilgan. Faqat administrator kirishi mumkin.");
  }
  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error("Barcha maydonlarni to'ldiring");
  }
  if (password.length < 6) {
    throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Noto'g'ri email formati");
  }
  if (findUserByEmail(email)) {
    throw new Error("Bu email allaqachon ro'yxatdan o'tgan");
  }
  if (email === ADMIN_EMAIL) {
    throw new Error("Bu email administrator uchun. Kirish bo'limidan kiring.");
  }

  const data = loadUsers();
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    passwordPlain: password,
    role: "student",
    createdAt: new Date().toISOString(),
    progress: {},
  };
  data.users.push(user);
  await saveUsers(data);
  return sanitizeUser(user);
}

async function login({ email, password }) {
  email = email?.trim().toLowerCase();
  password = password?.trim();
  const user = findUserByEmail(email);
  if (!user) throw new Error("Email yoki parol noto'g'ri");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Email yoki parol noto'g'ri");
  if (!REGISTRATION_ENABLED && user.role !== "admin") {
    throw new Error("Faqat administrator kirishi mumkin");
  }
  return sanitizeUser(user);
}

async function saveProgress(userId, { category, score, total }) {
  const data = loadUsers();
  const idx = data.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const user = data.users[idx];
  if (!user.progress) user.progress = {};
  const prev = user.progress[category] || { bestScore: 0, attempts: 0, lastScore: 0 };
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  user.progress[category] = {
    bestScore: Math.max(prev.bestScore, score),
    bestPercent: Math.max(prev.bestPercent || 0, percent),
    lastScore: score,
    lastPercent: percent,
    total,
    attempts: prev.attempts + 1,
    lastAttempt: new Date().toISOString(),
  };

  data.users[idx] = user;
  await saveUsers(data);
  return user.progress[category];
}

async function updateProfile(userId, { name, avatar }) {
  const data = loadUsers();
  const idx = data.users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("Foydalanuvchi topilmadi");

  const user = data.users[idx];

  if (name?.trim()) {
    user.name = name.trim();
  }

  if (avatar === null) {
    delete user.avatar;
  } else if (avatar) {
    if (!avatar.startsWith("data:image/")) {
      throw new Error("Faqat rasm fayli qabul qilinadi");
    }
    if (avatar.length > 700000) {
      throw new Error("Rasm hajmi juda katta (max ~500 KB)");
    }
    user.avatar = avatar;
  }

  data.users[idx] = user;
  await saveUsers(data);
  return sanitizeUser(user);
}

function sanitizeUserForAdmin(user) {
  return {
    ...sanitizeUser(user),
    password: user.passwordPlain || null,
  };
}

async function getAllUsersProgress() {
  if (storage.usesGitHub()) {
    await storage.reloadFromSource();
  }
  const data = loadUsers();
  return data.users.map((u) => sanitizeUserForAdmin(u));
}

function mergeProgress(a = {}, b = {}) {
  const out = { ...a };
  for (const [key, prog] of Object.entries(b)) {
    const prev = out[key] || { bestScore: 0, bestPercent: 0, attempts: 0 };
    out[key] = {
      bestScore: Math.max(prev.bestScore || 0, prog.bestScore || 0),
      bestPercent: Math.max(prev.bestPercent || 0, prog.bestPercent || 0),
      lastScore: prog.lastScore ?? prev.lastScore,
      lastPercent: prog.lastPercent ?? prev.lastPercent,
      total: prog.total || prev.total,
      attempts: (prev.attempts || 0) + (prog.attempts || 0),
      lastAttempt: prog.lastAttempt || prev.lastAttempt,
    };
  }
  return out;
}

async function mergeUsersImport(incoming) {
  if (!incoming?.users || !Array.isArray(incoming.users)) {
    throw new Error("Noto'g'ri fayl formati");
  }

  const data = loadUsers();
  const byEmail = new Map(data.users.map((u) => [u.email.toLowerCase(), u]));

  for (const raw of incoming.users) {
    if (!raw?.email) continue;
    const email = raw.email.toLowerCase();
    const existing = byEmail.get(email);

    if (existing) {
      existing.name = raw.name || existing.name;
      existing.role = raw.role === "admin" ? "admin" : existing.role;
      existing.progress = mergeProgress(existing.progress, raw.progress);
      if (raw.avatar && raw.avatar.length <= 700000) existing.avatar = raw.avatar;
      if (raw.passwordPlain) {
        existing.passwordPlain = raw.passwordPlain;
        existing.passwordHash = await bcrypt.hash(raw.passwordPlain, SALT_ROUNDS);
      }
    } else {
      const password = raw.passwordPlain || "changeme123";
      const user = {
        id: raw.id || crypto.randomUUID(),
        name: raw.name || email.split("@")[0],
        email,
        passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
        passwordPlain: raw.passwordPlain || null,
        role: raw.role === "admin" ? "admin" : "student",
        createdAt: raw.createdAt || new Date().toISOString(),
        progress: raw.progress || {},
      };
      if (raw.avatar && raw.avatar.length <= 700000) user.avatar = raw.avatar;
      data.users.push(user);
      byEmail.set(email, user);
    }
  }

  await saveUsers(data);
  return { total: data.users.length, merged: incoming.users.length };
}

function authMiddleware(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: "Kirish talab qilinadi" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Sessiya muddati tugagan" });
  }

  const user = findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: "Foydalanuvchi topilmadi" });
  }

  req.user = sanitizeUser(user);
  next();
}

function optionalAuth(req, _res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = findUserById(payload.sub);
      if (user) req.user = sanitizeUser(user);
    }
  }
  next();
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Faqat administrator uchun" });
  }
  next();
}

module.exports = {
  init,
  ensureDefaultAdmin,
  register,
  login,
  signToken,
  verifyToken,
  sanitizeUser,
  findUserById,
  saveProgress,
  updateProfile,
  getAllUsersProgress,
  mergeUsersImport,
  authMiddleware,
  optionalAuth,
  adminMiddleware,
  REGISTRATION_ENABLED,
  ADMIN_EMAIL,
  JWT_COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
