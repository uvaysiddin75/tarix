(function () {
  "use strict";

  const RENDER_URL = "https://tarix-do6q.onrender.com";
  window.API_BASE = "";
  window.STATIC_MODE = false;

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

    // GitHub Pages — umumiy baza Render serverida (barcha foydalanuvchilar ko'rinadi)
    if (host.endsWith("github.io") || host.endsWith("github.dev")) {
      window.API_BASE = RENDER_URL;
      window.STATIC_MODE = false;
      if (window.StaticApi) window.StaticApi.enabled = false;
      return;
    }

    window.API_BASE = RENDER_URL;
    window.STATIC_MODE = false;
    if (window.StaticApi) window.StaticApi.enabled = false;
  };
})();
