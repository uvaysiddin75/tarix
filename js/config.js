(function () {
  "use strict";

  const RENDER_URL = "https://tarix-do6q.onrender.com";

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
      useStatic();
      return;
    }

    useServer();
  };

  window.ApiMode = { useStatic, useServer, RENDER_URL };
})();
