(function () {
  "use strict";

  window.API_BASE = "";

  async function probeApi(base) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(base + "/api/auth/status", { signal: controller.signal });
      clearTimeout(timer);
      return res.ok;
    } catch {
      return false;
    }
  }

  async function tryApiBase(base) {
    if (!base) return false;
    if (await probeApi(base)) {
      window.API_BASE = base;
      return true;
    }
    return false;
  }

  window.initApiBase = async function initApiBase() {
    const host = location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const isSameHost =
      isLocal ||
      host.endsWith(".trycloudflare.com") ||
      host.endsWith(".onrender.com");

    if (isSameHost) {
      window.API_BASE = "";
      return;
    }

    if (await tryApiBase("https://tarix.onrender.com")) return;

    try {
      const res = await fetch("live-url.json?t=" + Date.now());
      const data = await res.json();
      if (data.url && data.status === "online" && (await tryApiBase(data.url))) return;
      if (data.permanentUrl) await tryApiBase(data.permanentUrl);
    } catch {
      window.API_BASE = "";
    }
  };
})();
