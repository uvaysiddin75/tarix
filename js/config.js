(function () {
  "use strict";

  const RENDER_URL = "https://tarix-do6q.onrender.com";
  window.API_BASE = "";
  window.STATIC_MODE = false;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function probeRender(baseUrl, attempts = 8) {
    for (let i = 0; i < attempts; i++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 60000);
        const res = await fetch(`${baseUrl}/api/health`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timer);
        if (res.ok) return true;
      } catch {
        /* Render uyg'onmoqda */
      }
      if (i < attempts - 1) await sleep(5000);
    }
    return false;
  }

  function useStaticFallback() {
    window.API_BASE = "";
    window.STATIC_MODE = true;
    if (window.StaticApi) window.StaticApi.enabled = true;
    window.dispatchEvent(new CustomEvent("api:fallback-static"));
  }

  function useRenderServer() {
    window.API_BASE = RENDER_URL;
    window.STATIC_MODE = false;
    if (window.StaticApi) window.StaticApi.enabled = false;
    window.dispatchEvent(new CustomEvent("api:connected"));
  }

  async function connectToRenderInBackground() {
    window.dispatchEvent(new CustomEvent("api:connecting"));

    const ok = await probeRender(RENDER_URL);
    if (!ok) {
      console.warn("Render javob bermadi — brauzer rejimida davom etiladi");
      return;
    }

    useRenderServer();

    if (window.StaticApi?.syncFullDbToServer) {
      window.StaticApi.syncFullDbToServer();
    }

    window.dispatchEvent(new CustomEvent("api:server-ready"));

    if (window.Auth?.reconnectToServer) {
      window.Auth.reconnectToServer();
    }
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
      window.STATIC_MODE = false;
      if (window.StaticApi) window.StaticApi.enabled = false;
      return;
    }

    if (host.endsWith("github.io") || host.endsWith("github.dev")) {
      useStaticFallback();
      connectToRenderInBackground();
      return;
    }

    window.API_BASE = RENDER_URL;
    window.STATIC_MODE = false;
    if (window.StaticApi) window.StaticApi.enabled = false;
  };
})();
