(function () {
  "use strict";

  const RENDER_URL = "https://tarix-do6q.onrender.com";
  window.API_BASE = "";
  window.STATIC_MODE = false;

  function useStaticFallback() {
    window.API_BASE = "";
    window.STATIC_MODE = true;
    if (window.StaticApi) window.StaticApi.enabled = true;
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

    // GitHub Pages — tez statik rejim (Render ga o'tish yo'q, lag kam)
    if (host.endsWith("github.io") || host.endsWith("github.dev")) {
      useStaticFallback();
      return;
    }

    window.API_BASE = RENDER_URL;
    window.STATIC_MODE = false;
    if (window.StaticApi) window.StaticApi.enabled = false;
  };
})();
