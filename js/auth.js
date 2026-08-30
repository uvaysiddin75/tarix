(function () {
  "use strict";

  const TOKEN_KEY = "nazorat_token";
  const REMEMBER_KEY = "nazorat_remember";
  const RENDER_URL = "https://tarix-do6q.onrender.com";
  const SERVER_TIMEOUT = 8000;

  let currentUser = null;
  let aiEnabled = true;
  let aiMode = "smart";
  let registrationEnabled = true;
  let adminEmail = null;
  let serverOnline = false;

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  function saveRemember(email, password, always = false) {
    const remember = document.getElementById("rememberMe");
    if (!always && remember && !remember.checked) {
      localStorage.removeItem(REMEMBER_KEY);
      return;
    }
    localStorage.setItem(
      REMEMBER_KEY,
      JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() })
    );
  }

  function getRemember() {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return null;
  }

  function authHeaders() {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  function apiUrl(path) {
    return (window.API_BASE || "") + path;
  }

  function isGithubPages() {
    return location.hostname.endsWith("github.io") || location.hostname.endsWith("github.dev");
  }

  function useServerMode() {
    if (window.ApiMode) window.ApiMode.useServer();
    else {
      window.API_BASE = RENDER_URL;
      window.STATIC_MODE = false;
      if (window.StaticApi) window.StaticApi.enabled = false;
    }
    serverOnline = true;
  }

  function useStaticModeLocal() {
    if (window.ApiMode) window.ApiMode.useStatic();
    else {
      window.API_BASE = "";
      window.STATIC_MODE = true;
      if (window.StaticApi) window.StaticApi.enabled = true;
    }
  }

  async function fetchServer(path, options = {}, timeout = SERVER_TIMEOUT) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(`${RENDER_URL}${path}`, {
        ...options,
        signal: controller.signal,
        headers: { "Content-Type": "application/json", ...options.headers },
      });
      clearTimeout(timer);
      return res;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }

  async function tryStaticLogin(email, password) {
    useStaticModeLocal();
    const res = await window.StaticApi.handle("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Kirish muvaffaqiyatsiz" };
    setToken(data.token);
    currentUser = data.user;
    return { ok: true, user: data.user };
  }

  async function tryServerLogin(email, password, timeout = SERVER_TIMEOUT) {
    const res = await fetchServer(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      timeout
    );
    if (!res?.ok) return null;
    const data = await res.json();
    if (!data?.token) return null;
    useServerMode();
    setToken(data.token);
    currentUser = data.user;
    return data;
  }

  async function apiFetch(url, options = {}) {
    if (window.StaticApi?.enabled || window.STATIC_MODE) {
      useStaticModeLocal();
      return window.StaticApi.handle(url, {
        ...options,
        headers: { ...authHeaders(), ...options.headers },
      });
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), SERVER_TIMEOUT);
      const res = await fetch(apiUrl(url), {
        ...options,
        signal: controller.signal,
        headers: { ...authHeaders(), ...options.headers },
        credentials: "omit",
      });
      clearTimeout(timer);
      return res;
    } catch {
      useStaticModeLocal();
      if (window.StaticApi) {
        return window.StaticApi.handle(url, {
          ...options,
          headers: { ...authHeaders(), ...options.headers },
        });
      }
      throw new Error("Server bilan bog'lanib bo'lmadi");
    }
  }

  async function checkAuth() {
    if (window.initApiBase) {
      try {
        await window.initApiBase();
      } catch {
        /* ignore */
      }
    }

    const token = getToken();

    // Server token — check Render session
    if (token && !token.startsWith("static.") && !window.STATIC_MODE) {
      useServerMode();
      try {
        const res = await apiFetch("/api/auth/status");
        const data = await res.json();
        applyAuthMeta(data);
        if (data.authenticated && data.user) {
          currentUser = data.user;
          return data.user;
        }
      } catch {
        /* fall through to static */
      }
    }

    // Static token or server unavailable
    useStaticModeLocal();
    try {
      const res = await apiFetch("/api/auth/status");
      const data = await res.json();
      applyAuthMeta(data);
      if (data.authenticated && data.user) {
        currentUser = data.user;
        return data.user;
      }
    } catch {
      /* ignore */
    }

    currentUser = null;
    return null;
  }

  function applyAuthMeta(data) {
    aiEnabled = data.aiEnabled !== false;
    aiMode = data.aiMode || "smart";
    registrationEnabled = data.registrationEnabled !== false;
    adminEmail = data.adminEmail || window.STATIC_CONFIG?.adminEmail || null;
  }

  async function login(email, password) {
    email = email.trim();
    password = password.trim();

    // 1) Try Render server (shared progress between devices)
    const server = await tryServerLogin(email, password, 6000);
    if (server?.user) {
      saveRemember(email, password);
      return server.user;
    }

    // 2) Fallback: local login (works even when Render sleeps)
    const local = await tryStaticLogin(email, password);
    if (local.ok) {
      saveRemember(email, password);
      return local.user;
    }

    throw new Error(
      local.error && local.error !== "Email yoki parol noto'g'ri"
        ? local.error
        : "Email yoki parol noto'g'ri. Yangi qurilmada — «Ro'yxatdan o'tish»."
    );
  }

  async function register(name, email, password) {
    name = name.trim();
    email = email.trim();
    password = password.trim();

    // Try server first
    const res = await fetchServer("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (res?.ok) {
      const data = await res.json();
      useServerMode();
      setToken(data.token);
      currentUser = data.user;
      saveRemember(email, password, true);
      return data.user;
    }

    // Fallback local
    useStaticModeLocal();
    const localRes = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await localRes.json();
    if (!localRes.ok) throw new Error(data.error || "Ro'yxatdan o'tish muvaffaqiyatsiz");
    setToken(data.token);
    currentUser = data.user;
    saveRemember(email, password, true);
    return data.user;
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setToken(null);
    localStorage.removeItem(REMEMBER_KEY);
    currentUser = null;
    useStaticModeLocal();
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  async function saveProgress(category, score, total) {
    if (!window.STATIC_MODE && serverOnline) {
      try {
        await apiFetch("/api/progress", {
          method: "POST",
          body: JSON.stringify({ category, score, total }),
        });
        return;
      } catch {
        /* static backup */
      }
    }
    useStaticModeLocal();
    await apiFetch("/api/progress", {
      method: "POST",
      body: JSON.stringify({ category, score, total }),
    });
  }

  async function updateProfile(data) {
    const res = await apiFetch("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Saqlash muvaffaqiyatsiz");
    currentUser = json.user;
    return json.user;
  }

  async function fetchAllUsersProgress() {
    const res = await apiFetch("/api/users/progress");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Ma'lumot yuklanmadi");
    return json.users;
  }

  function getUser() {
    return currentUser;
  }

  function isAdmin() {
    return currentUser?.role === "admin";
  }

  function isStaticMode() {
    return Boolean(window.STATIC_MODE);
  }

  function isAiEnabled() {
    return aiEnabled && !isStaticMode();
  }

  function getAiMode() {
    return aiMode;
  }

  function isRegistrationEnabled() {
    return registrationEnabled;
  }

  function getAdminEmail() {
    return adminEmail || window.STATIC_CONFIG?.adminEmail || null;
  }

  function exportUsersDb() {
    if (!window.StaticStore) throw new Error("Statik rejim faqat GitHub Pages da");
    return StaticStore.exportDb();
  }

  function importUsersDb(data) {
    if (!window.StaticStore) throw new Error("Statik rejim faqat GitHub Pages da");
    return StaticStore.importDb(data);
  }

  window.Auth = {
    apiFetch,
    checkAuth,
    login,
    register,
    logout,
    saveProgress,
    updateProfile,
    fetchAllUsersProgress,
    getUser,
    isAdmin,
    isAiEnabled,
    isStaticMode,
    getAiMode,
    isRegistrationEnabled,
    getAdminEmail,
    exportUsersDb,
    importUsersDb,
  };
})();
