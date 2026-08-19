(function () {
  "use strict";

  const DB_KEY    = "nazorat_users_db_v1";
  const DB_KEY_BK = "nazorat_users_db_backup_v1"; // second localStorage key
  const IDB_NAME  = "nazorat_db";
  const IDB_STORE = "users_db";
  const ADMIN_INIT_KEY = "nazorat_admin_ready_v1";
  const cfg = () => window.STATIC_CONFIG || {};
  let dbCache = null;

  // ── IndexedDB helpers ──
  function idbSave(data) {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => e.target.result.createObjectStore(IDB_STORE);
      req.onsuccess = (e) => {
        const tx = e.target.result.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(JSON.stringify(data), "main");
      };
    } catch (_) {}
  }

  function idbLoad() {
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = (e) => e.target.result.createObjectStore(IDB_STORE);
        req.onsuccess = (e) => {
          const tx = e.target.result.transaction(IDB_STORE, "readonly");
          const get = tx.objectStore(IDB_STORE).get("main");
          get.onsuccess = () => {
            try { resolve(get.result ? JSON.parse(get.result) : null); }
            catch (_) { resolve(null); }
          };
          get.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      } catch (_) { resolve(null); }
    });
  }

  function loadDb() {
    if (dbCache) return dbCache;
    // Try primary localStorage
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) { dbCache = JSON.parse(raw); return dbCache; }
    } catch (_) {}
    // Try backup localStorage
    try {
      const raw = localStorage.getItem(DB_KEY_BK);
      if (raw) { dbCache = JSON.parse(raw); return dbCache; }
    } catch (_) {}
    dbCache = { users: [] };
    return dbCache;
  }

  function saveDb(data) {
    dbCache = data;
    const json = JSON.stringify(data);
    // Save in two localStorage keys
    try { localStorage.setItem(DB_KEY, json); } catch (_) {}
    try { localStorage.setItem(DB_KEY_BK, json); } catch (_) {}
    // Save in IndexedDB (async, fire-and-forget)
    idbSave(data);
  }

  // On page load: restore from IndexedDB if localStorage is empty
  (async function restoreFromIdb() {
    try {
      const ls = localStorage.getItem(DB_KEY);
      if (!ls) {
        const idb = await idbLoad();
        if (idb?.users?.length) {
          localStorage.setItem(DB_KEY, JSON.stringify(idb));
          localStorage.setItem(DB_KEY_BK, JSON.stringify(idb));
          dbCache = idb;
        }
      }
    } catch (_) {}
  })();

  async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: enc.encode(salt),
        iterations: 5000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function sanitizeUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      cover: user.cover || null,
      createdAt: user.createdAt,
      progress: user.progress || {},
    };
  }

  function sanitizeUserForAdmin(user) {
    return {
      ...sanitizeUser(user),
      password: user.passwordPlain || null,
    };
  }

  function findUserByEmail(email) {
    const data = loadDb();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  function findUserById(id) {
    const data = loadDb();
    return data.users.find((u) => u.id === id) || null;
  }

  function isAdminEmail(email) {
    const c = cfg();
    const mainAdmin = (c.adminEmail || "").trim().toLowerCase();
    if (email === mainAdmin) return true;
    const extras = c.extraAdmins || [];
    return extras.some((a) => (a.email || "").trim().toLowerCase() === email);
  }

  async function ensureDefaultAdmin() {
    if (sessionStorage.getItem(ADMIN_INIT_KEY) === "1") return;

    const data = loadDb();
    const c = cfg();
    const adminEmail = (c.adminEmail || "").trim().toLowerCase();
    const adminPassword = c.adminPassword || "admin123";
    const adminName = c.adminName || "Administrator";
    const registrationEnabled = c.registrationEnabled !== false;

    if (!registrationEnabled) {
      data.users = data.users.filter((u) => isAdminEmail(u.email.toLowerCase()));
    }

    let admin = data.users.find((u) => u.email.toLowerCase() === adminEmail);
    let changed = false;

    if (admin) {
      if (admin.role !== "admin" || admin.name !== adminName) {
        admin.role = "admin";
        admin.name = adminName;
        changed = true;
      }
      if (admin.passwordPlain !== adminPassword) {
        const salt = admin.salt || crypto.randomUUID();
        admin.salt = salt;
        admin.passwordHash = await hashPassword(adminPassword, salt);
        admin.passwordPlain = adminPassword;
        changed = true;
      }
    } else {
      const salt = crypto.randomUUID();
      admin = {
        id: crypto.randomUUID(),
        name: adminName,
        email: adminEmail,
        salt,
        passwordHash: await hashPassword(adminPassword, salt),
        passwordPlain: adminPassword,
        role: "admin",
        createdAt: new Date().toISOString(),
        progress: {},
      };
      data.users.push(admin);
      changed = true;
    }

    // Ensure extra admins also have admin role
    const extras = c.extraAdmins || [];
    for (const extra of extras) {
      const extraEmail = (extra.email || "").trim().toLowerCase();
      if (!extraEmail) continue;
      let extraUser = data.users.find((u) => u.email.toLowerCase() === extraEmail);
      if (extraUser) {
        if (extraUser.role !== "admin") {
          extraUser.role = "admin";
          changed = true;
        }
      }
    }

    if (changed) saveDb(data);
    sessionStorage.setItem(ADMIN_INIT_KEY, "1");
  }

  async function register({ name, email, password }) {
    const c = cfg();
    if (c.registrationEnabled === false) {
      throw new Error("Ro'yxatdan o'tish o'chirilgan. Faqat administrator kirishi mumkin.");
    }

    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!name || !email || !password) {
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
    if (isAdminEmail(email)) {
      throw new Error("Bu email administrator uchun. Kirish bo'limidan kiring.");
    }

    const salt = crypto.randomUUID();
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      salt,
      passwordHash: await hashPassword(password, salt),
      passwordPlain: password,
      role: "student",
      createdAt: new Date().toISOString(),
      progress: {},
    };

    const data = loadDb();
    data.users.push(user);
    saveDb(data);
    return sanitizeUser(user);
  }

  async function login({ email, password }) {
    const c = cfg();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    const user = findUserByEmail(email);
    if (!user) throw new Error("Email yoki parol noto'g'ri");

    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) throw new Error("Email yoki parol noto'g'ri");

    if (c.registrationEnabled === false && user.role !== "admin") {
      throw new Error("Faqat administrator kirishi mumkin");
    }

    // Ensure extra admins always have admin role on login
    if (isAdminEmail(email) && user.role !== "admin") {
      const data = loadDb();
      const u = data.users.find((x) => x.email.toLowerCase() === email);
      if (u) { u.role = "admin"; saveDb(data); user.role = "admin"; }
    }

    return sanitizeUser(user);
  }

  function saveProgress(userId, { category, score, total }) {
    const data = loadDb();
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
    saveDb(data);
    return user.progress[category];
  }

  function updateProfile(userId, { name, avatar, cover }) {
    const data = loadDb();
    const idx = data.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("Foydalanuvchi topilmadi");

    const user = data.users[idx];
    if (name?.trim()) user.name = name.trim();

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

    if (cover === null) {
      delete user.cover;
    } else if (cover) {
      if (!cover.startsWith("data:image/")) {
        throw new Error("Faqat rasm fayli qabul qilinadi");
      }
      if (cover.length > 900000) {
        throw new Error("Muqova hajmi juda katta (max ~700 KB)");
      }
      user.cover = cover;
    }

    data.users[idx] = user;
    saveDb(data);
    return sanitizeUser(user);
  }

  function getAllUsersProgress() {
    return loadDb().users.map((u) => sanitizeUserForAdmin(u));
  }

  function exportDb() {
    return loadDb();
  }

  function importDb(incoming) {
    if (!incoming?.users || !Array.isArray(incoming.users)) {
      throw new Error("Noto'g'ri fayl formati");
    }

    const data = loadDb();
    const byEmail = new Map(data.users.map((u) => [u.email.toLowerCase(), u]));

    for (const raw of incoming.users) {
      if (!raw?.email) continue;
      const email = raw.email.toLowerCase();
      const existing = byEmail.get(email);

      if (existing) {
        existing.name = raw.name || existing.name;
        existing.progress = mergeProgress(existing.progress, raw.progress);
        if (raw.avatar) existing.avatar = raw.avatar;
        if (raw.cover) existing.cover = raw.cover;
        if (raw.passwordPlain) {
          existing.passwordPlain = raw.passwordPlain;
          existing.passwordHash = raw.passwordHash;
          existing.salt = raw.salt;
        }
      } else {
        const user = { ...raw, email, progress: raw.progress || {} };
        data.users.push(user);
        byEmail.set(email, user);
      }
    }

    saveDb(data);
    return data.users.length;
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

  function makeToken(userId) {
    const payload = { sub: userId, exp: Date.now() + 3650 * 24 * 60 * 60 * 1000 };
    return "static." + btoa(JSON.stringify(payload));
  }

  function parseToken(token) {
    if (!token?.startsWith("static.")) return null;
    try {
      const payload = JSON.parse(atob(token.slice(7)));
      if (!payload.sub || payload.exp < Date.now()) return null;
      return payload;
    } catch {
      return null;
    }
  }

  window.StaticStore = {
    ensureDefaultAdmin,
    register,
    login,
    saveProgress,
    updateProfile,
    getAllUsersProgress,
    findUserById,
    sanitizeUser,
    exportDb,
    importDb,
    makeToken,
    parseToken,
    getRegistrationEnabled() {
      return cfg().registrationEnabled !== false;
    },
    getAdminEmail() {
      return cfg().registrationEnabled === false ? cfg().adminEmail : null;
    },
  };
})();
