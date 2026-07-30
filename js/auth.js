(function () {
  "use strict";

  const TOKEN_KEY = "nazorat_token";

  let currentUser = null;
  let aiEnabled = true;
  let aiMode = "smart";
  let registrationEnabled = false;
  let adminEmail = null;

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
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

  async function apiFetch(url, options = {}) {
    if (window.StaticApi?.enabled) {
      return window.StaticApi.handle(url, {
        ...options,
        headers: { ...authHeaders(), ...options.headers },
      });
    }

    const res = await fetch(apiUrl(url), {
      ...options,
      headers: { ...authHeaders(), ...options.headers },
      credentials: window.API_BASE ? "omit" : "include",
    });

    if (res.status === 401 && !url.includes("/auth/")) {
      setToken(null);
      currentUser = null;
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    return res;
  }

  async function checkAuth() {
    const res = await apiFetch("/api/auth/status");
    const data = await res.json();
    aiEnabled = data.aiEnabled !== false;
    aiMode = data.aiMode || "smart";
    registrationEnabled = Boolean(data.registrationEnabled);
    adminEmail = data.adminEmail || null;
    if (data.authenticated && data.user) {
      currentUser = data.user;
      return data.user;
    }
    currentUser = null;
    return null;
  }

  async function login(email, password) {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Kirish muvaffaqiyatsiz");
    setToken(data.token);
    currentUser = data.user;
    return data.user;
  }

  async function register(name, email, password) {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ro'yxatdan o'tish muvaffaqiyatsiz");
    setToken(data.token);
    currentUser = data.user;
    return data.user;
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setToken(null);
    currentUser = null;
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  async function saveProgress(category, score, total) {
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
