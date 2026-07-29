(function () {

  "use strict";



  window.API_BASE = "";

  const RENDER_URL = "https://tarix-do6q.onrender.com";



  async function probeApi(base, timeoutMs) {

    try {

      const controller = new AbortController();

      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(base + "/api/auth/status", { signal: controller.signal });

      clearTimeout(timer);

      return res.ok;

    } catch {

      return false;

    }

  }



  async function tryApiBase(base, { retries = 0, timeoutMs = 8000, delayMs = 4000 } = {}) {

    if (!base) return false;

    for (let attempt = 0; attempt <= retries; attempt++) {

      if (await probeApi(base, timeoutMs)) {

        window.API_BASE = base;

        return true;

      }

      if (attempt < retries) {

        await new Promise((resolve) => setTimeout(resolve, delayMs));

      }

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



    // Render — doimiy server (birinchi marta uyg'onish 30–60 soniya)

    if (

      await tryApiBase(RENDER_URL, {

        retries: 2,

        timeoutMs: 60000,

        delayMs: 5000,

      })

    ) {

      return;

    }



    // ZAPUSK-INTERNET.bat ishlayotganda — vaqtinchalik tunnel

    try {

      const res = await fetch("live-url.json?t=" + Date.now());

      const data = await res.json();

      if (data.url && data.status === "online" && (await tryApiBase(data.url))) return;

    } catch {

      /* tunnel yo'q */

    }

  };

})();

