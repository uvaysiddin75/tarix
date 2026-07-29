(function () {
  "use strict";

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

    try {
      const render = "https://tarix.onrender.com";
      const check = await fetch(render + "/api/auth/status");
      if (check.ok) {
        window.API_BASE = render;
        return;
      }
    } catch {
      /* Render hali o'rnatilmagan */
    }

    try {
      const res = await fetch("live-url.json?t=" + Date.now());
      const data = await res.json();
      if (data.url && data.status === "online") {
        window.API_BASE = data.url;
        return;
      }
      if (data.permanentUrl) {
        window.API_BASE = data.permanentUrl;
      }
    } catch {
      window.API_BASE = "";
    }
  };
})();
