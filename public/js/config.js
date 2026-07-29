(function () {
  "use strict";

  const RENDER_URL = "https://tarix-do6q.onrender.com";
  window.API_BASE = "";

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

    // GitHub Pages — doim Render serveriga ulanadi
    if (host.endsWith("github.io") || host.endsWith("github.dev")) {
      window.API_BASE = RENDER_URL;
      return;
    }

    window.API_BASE = RENDER_URL;
  };
})();
