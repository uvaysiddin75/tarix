/**
 * Render serverdan foydalanuvchilarni yuklab, data/users.json ga yozadi.
 * GitHub Actions ichida ishlatiladi (GITHUB_TOKEN avtomatik beriladi).
 */
const fs = require("fs");
const path = require("path");

const RENDER_URL = process.env.RENDER_URL || "https://tarix-do6q.onrender.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "uvaysiddin75@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "salmic1023";
const OUT_PATH = path.join(__dirname, "..", "data", "users.json");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForRender(maxAttempts = 12) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${RENDER_URL}/api/health`, { signal: AbortSignal.timeout(90000) });
      if (res.ok) return true;
    } catch {
      /* uyg'onmoqda */
    }
    console.log(`Render kutilyapti... (${i + 1}/${maxAttempts})`);
    await sleep(10000);
  }
  return false;
}

async function adminLogin() {
  const res = await fetch(`${RENDER_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Login xatosi: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.token;
}

async function fetchUsersProgress(token) {
  const res = await fetch(`${RENDER_URL}/api/users/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Export xatosi: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.users || [];
}

function toDatabase(users) {
  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      passwordPlain: u.password || null,
      avatar: u.avatar || null,
      cover: u.cover || null,
      createdAt: u.createdAt,
      progress: u.progress || {},
    })),
  };
}

async function main() {
  console.log("Render server tekshirilmoqda...");
  const up = await waitForRender();
  if (!up) {
    console.warn("Render javob bermadi — mavjud fayl saqlanadi");
    process.exit(0);
  }

  console.log("Admin kirish...");
  const token = await adminLogin();

  console.log("Baza yuklanmoqda...");
  const users = await fetchUsersProgress(token);
  if (!users.length) {
    console.warn("Foydalanuvchilar topilmadi");
    process.exit(0);
  }

  const db = toDatabase(users);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(db, null, 2), "utf8");
  console.log(`Saqlanadi: ${db.users.length} ta foydalanuvchi → data/users.json`);
}

main().catch((err) => {
  console.error("Backup xatosi:", err.message);
  process.exit(1);
});
