const fs = require("fs");
const path = require("path");

const USERS_PATH = path.join(__dirname, "..", "data", "users.json");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "uvaysiddin75/tarix";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_USERS_PATH = process.env.GITHUB_USERS_PATH || "data/users.json";

let memory = { users: [] };
let sha = null;

function githubHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  };
}

async function loadFromGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_USERS_PATH}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: githubHeaders() });
  if (res.status === 404) return { data: { users: [] }, sha: null };
  if (!res.ok) {
    throw new Error(`GitHub o'qish xatosi: ${res.status}`);
  }
  const json = await res.json();
  const data = JSON.parse(Buffer.from(json.content, "base64").toString("utf8"));
  return { data, sha: json.sha };
}

async function saveToGitHub(data) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_USERS_PATH}`;
  const body = {
    message: "Foydalanuvchilar bazasini yangilash",
    content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: githubHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub yozish xatosi: ${res.status} ${errText}`);
  }

  const json = await res.json();
  sha = json.content?.sha || sha;
}

function loadFromDisk() {
  if (fs.existsSync(USERS_PATH)) {
    return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
  }
  return { users: [] };
}

async function init() {
  if (GITHUB_TOKEN) {
    try {
      const result = await loadFromGitHub();
      memory = result.data;
      sha = result.sha;
      console.log(`Foydalanuvchilar GitHub dan yuklandi (${memory.users.length} ta)`);
      return;
    } catch (err) {
      console.warn("GitHub dan yuklab bo'lmadi, diskdan olinmoqda:", err.message);
    }
  }

  memory = loadFromDisk();
  console.log(`Foydalanuvchilar diskdan yuklandi (${memory.users.length} ta)`);
}

function loadUsers() {
  return memory;
}

async function saveUsers(data) {
  memory = data;

  if (GITHUB_TOKEN) {
    try {
      const fresh = await loadFromGitHub();
      sha = fresh.sha;
      await saveToGitHub(data);
      return;
    } catch (err) {
      console.warn("GitHub ga saqlab bo'lmadi, diskka yozilmoqda:", err.message);
    }
  }

  fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
  fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function reloadFromSource() {
  if (GITHUB_TOKEN) {
    const result = await loadFromGitHub();
    memory = result.data;
    sha = result.sha;
    return memory;
  }
  memory = loadFromDisk();
  return memory;
}

module.exports = {
  init,
  loadUsers,
  saveUsers,
  reloadFromSource,
  usesGitHub: () => Boolean(GITHUB_TOKEN),
};
