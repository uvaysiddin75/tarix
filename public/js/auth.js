(function () {
  "use strict";

  const TOKEN_KEY = "nazorat_token";
  const REMEMBER_KEY = "nazorat_remember";
  const RENDER_URL = "https://tarix-do6q.onrender.com";
  const SERVER_TIMEOUT = 8000;
  const SERVER_LOGIN_TIMEOUT = 25000;

  let currentUser = null;
  let aiEnabled = true;
  let aiMode = "smart";
  let registrationEnabled = true;
  let adminEmail = null;

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

  function useServerMode() {
    if (window.ApiMode) window.ApiMode.useServer();
    else {
      window.API_BASE = RENDER_URL;
      window.STATIC_MODE = false;
      if (window.StaticApi) window.StaticApi.enabled = false;
    }
  }

  function useStaticModeLocal() {
    if (window.ApiMode) window.ApiMode.useStatic();
    else {
      window.API_BASE = "";
      window.STATIC_MODE = true;
      if (window.StaticApi) window.StaticApi.enabled = true;
    }
  }

  function isGithubPages() {
    return location.hostname.endsWith("github.io") || location.hostname.endsWith("github.dev");
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

  async function tryServerLogin(email, password, timeout = SERVER_LOGIN_TIMEOUT) {
    const res = await fetchServer(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      timeout
    );
    if (!res?.ok) return null;
    return res.json();
  }

  async function tryStaticLogin(email, password) {
    useStaticModeLocal();
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || "Kirish muvaffaqiyatsiz" };
    }
    setToken(data.token);
    currentUser = data.user;
    return { ok: true, user: data.user };
  }

  function upgradeToServerInBackground(email, password) {
    tryServerLogin(email, password, 30000)
      .then((server) => {
        if (!server?.token) return;
        useServerMode();
        setToken(server.token);
        currentUser = server.user;
        window.dispatchEvent(new CustomEvent("auth:server-mode"));
      })
      .catch(() => {});
  }

  async function tryServerRegister(name, email, password) {
    const res = await fetchServer("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (!res?.ok) return null;
    return res.json();
  }

  async function apiFetch(url, options = {}) {
    if (window.StaticApi?.enabled) {
      return window.StaticApi.handle(url, {
        ...options,
        headers: { ...authHeaders(), ...options.headers },
      });
    }

    try {
      return await fetch(apiUrl(url), {
        ...options,
        headers: { ...authHeaders(), ...options.headers },
        credentials: "omit",
      });
    } catch (err) {
      throw err || new Error("Server bilan bog'lanib bo'lmadi");
    }
  }

  async function checkAuth() {
    const token = getToken();

    if (token && !token.startsWith("static.")) {
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
        useStaticModeLocal();
      }
    }

    if (window.StaticApi?.enabled || window.STATIC_MODE) {
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
    }

    currentUser = null;
    return null;
  }

  function applyAuthMeta(data) {
    aiEnabled = data.aiEnabled !== false;
    aiMode = data.aiMode || "smart";
    registrationEnabled = Boolean(data.registrationEnabled);
    adminEmail = data.adminEmail || null;
  }

  async function login(email, password) {
    email = email.trim();
    password = password.trim();
    saveRemember(email, password);

    // Always try local first — instant login
    const local = await tryStaticLogin(email, password);
    if (local.ok) {
      upgradeToServerInBackground(email, password);
      return local.user;
    }

    // If local failed, try server (in case user registered on server only)
    const server = await tryServerLogin(email, password);
    if (server?.token) {
      useServerMode();
      setToken(server.token);
      currentUser = server.user;
      window.dispatchEvent(new CustomEvent("auth:server-mode"));
      return server.user;
    }

    throw new Error(local.error || "Email yoki parol noto'g'ri");
  }

  async function register(name, email, password) {
    name = name.trim();
    email = email.trim();
    password = password.trim();
    saveRemember(email, password, true);

    // Always register locally first — guaranteed to work
    useStaticModeLocal();
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ro'yxatdan o'tish muvaffaqiyatsiz");
    setToken(data.token);
    currentUser = data.user;

    // Also register on server in background
    tryServerRegister(name, email, password)
      .then((server) => {
        if (server?.token) {
          useServerMode();
          setToken(server.token);
          currentUser = server.user;
          window.dispatchEvent(new CustomEvent("auth:server-mode"));
        }
      })
      .catch(() => {});

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
    if (!window.STATIC_MODE) {
      try {
        await apiFetch("/api/progress", {
          method: "POST",
          body: JSON.stringify({ category, score, total }),
        });
        return;
      } catch {
        /* static zaxira */
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
    if (isAdmin() && getRemember()) {
      const creds = getRemember();
      const loginRes = await fetchServer("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: creds.email, password: creds.password }),
      });
      if (loginRes?.ok) {
        const { token } = await loginRes.json();
        const res = await fetchServer("/api/users/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.ok) {
          const json = await res.json();
          if (json.users?.length) return json.users;
        }
      }
    }

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
    return adminEmail;
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
