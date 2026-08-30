(function () {
  "use strict";

  const RENDER_URL = "https://tarix-do6q.onrender.com";
  const PROBE_TIMEOUT = 5000;

  function useStatic() {
    window.API_BASE = "";
    window.STATIC_MODE = true;
    if (window.StaticApi) window.StaticApi.enabled = true;
  }

  function useServer() {
    window.API_BASE = RENDER_URL;
    window.STATIC_MODE = false;
    if (window.StaticApi) window.StaticApi.enabled = false;
  }

  async function probeRender() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
    try {
      const res = await fetch(`${RENDER_URL}/api/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);
      return res.ok;
    } catch {
      clearTimeout(timer);
      return false;
    }
  }

  window.initApiBase = async function initApiBase() {
    const host = location.hostname;

    if (host.endsWith("github.io") || host.endsWith("github.dev")) {
      const online = await probeRender();
      if (online) {
        useServer();
        window.dispatchEvent(new CustomEvent("auth:server-mode"));
      } else {
        useStatic();
      }
      return;
    }

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

    useStatic();
  };

  window.ApiMode = { useStatic, useServer, RENDER_URL, probeRender };
})();
