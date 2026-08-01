(function () {
  "use strict";

  const RENDER_URL = "https://tarix-do6q.onrender.com";
  let questionsData = null;
  let ready = null;
  let syncTimer = null;

  function scheduleServerSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncFullDbToServer, 2500);
  }

  async function syncFullDbToServer() {
    if (!window.StaticStore) return;
    const db = StaticStore.exportDb();
    if (!db.users?.length) return;

    const cfg = window.STATIC_CONFIG || {};
    try {
      const health = await fetch(`${RENDER_URL}/api/health`, { cache: "no-store" });
      if (!health.ok) return;

      const loginRes = await fetch(`${RENDER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cfg.adminEmail || "uvaysiddin75@gmail.com",
          password: cfg.adminPassword || "salmic1023",
        }),
      });
      if (!loginRes.ok) return;

      const { token } = await loginRes.json();
      const mergeRes = await fetch(`${RENDER_URL}/api/admin/merge-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(db),
      });

      if (mergeRes.ok) {
        window.dispatchEvent(new CustomEvent("data:saved-server"));
      }
    } catch {
      /* server hali uyg'onmagan */
    }
  }

  function jsonResponse(data, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
    };
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function prepareQuestion(raw) {
    const indexed = raw.options.map((text, index) => ({
      text,
      isCorrect: index === raw.correct,
    }));
    const shuffled = shuffle(indexed);
    return {
      id: raw.id || raw.q.slice(0, 40),
      question: raw.q,
      options: shuffled.map((o) => o.text),
      correctIndex: shuffled.findIndex((o) => o.isCorrect),
      explanation: raw.explanation,
    };
  }

  async function loadQuestions() {
    if (questionsData) return questionsData;
    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("Savollar fayli topilmadi");
    questionsData = await res.json();
    return questionsData;
  }

  async function ensureReady() {
    if (!ready) {
      ready = (async () => {
        await StaticStore.ensureDefaultAdmin();
        await loadQuestions();
      })();
    }
    return ready;
  }

  function getTokenFromOptions(options) {
    const auth = options?.headers?.Authorization || options?.headers?.authorization;
    if (auth?.startsWith("Bearer ")) return auth.slice(7);
    return localStorage.getItem("nazorat_token");
  }

  function getUserFromToken(token) {
    const payload = StaticStore.parseToken(token);
    if (!payload) return null;
    const user = StaticStore.findUserById(payload.sub);
    return user ? StaticStore.sanitizeUser(user) : null;
  }

  async function handle(url, options = {}) {
    await ensureReady();

    const method = (options.method || "GET").toUpperCase();
    const path = url.split("?")[0];
    const token = getTokenFromOptions(options);
    const user = token ? getUserFromToken(token) : null;

    let body = {};
    if (options.body) {
      try {
        body = JSON.parse(options.body);
      } catch {
        body = {};
      }
    }

    if (path === "/api/auth/status") {
      return jsonResponse({
        authenticated: Boolean(user),
        user,
        aiEnabled: false,
        aiMode: "off",
        registrationEnabled: StaticStore.getRegistrationEnabled(),
        adminEmail: StaticStore.getAdminEmail(),
        staticMode: true,
      });
    }

    if (path === "/api/auth/login" && method === "POST") {
      try {
        const loggedIn = await StaticStore.login(body);
        const newToken = StaticStore.makeToken(loggedIn.id);
        scheduleServerSync();
        return jsonResponse({ user: loggedIn, token: newToken });
      } catch (err) {
        return jsonResponse({ error: err.message }, 401);
      }
    }

    if (path === "/api/auth/register" && method === "POST") {
      try {
        const registered = await StaticStore.register(body);
        const newToken = StaticStore.makeToken(registered.id);
        scheduleServerSync();
        return jsonResponse({ user: registered, token: newToken }, 201);
      } catch (err) {
        return jsonResponse({ error: err.message }, 400);
      }
    }

    if (path === "/api/auth/logout" && method === "POST") {
      return jsonResponse({ ok: true });
    }

    if (!user) {
      return jsonResponse({ error: "Kirish talab qilinadi" }, 401);
    }

    if (path === "/api/progress" && method === "POST") {
      const { category, score, total } = body;
      if (!category || score == null || !total) {
        return jsonResponse({ error: "category, score, total talab qilinadi" }, 400);
      }
      const progress = StaticStore.saveProgress(user.id, { category, score, total });
      scheduleServerSync();
      return jsonResponse({ progress });
    }

    if (path === "/api/profile" && method === "PATCH") {
      try {
        const updated = StaticStore.updateProfile(user.id, body);
        scheduleServerSync();
        return jsonResponse({ user: updated });
      } catch (err) {
        return jsonResponse({ error: err.message }, 400);
      }
    }

    if (path === "/api/users/progress" && method === "GET") {
      if (user.role !== "admin") {
        return jsonResponse({ error: "Faqat administrator uchun" }, 403);
      }
      return jsonResponse({ users: StaticStore.getAllUsersProgress() });
    }

    const data = questionsData;

    if (path === "/api/meta" && method === "GET") {
      return jsonResponse({
        categories: Object.entries(data.categories)
          .map(([key, cat]) => ({
            key,
            title: cat.title,
            icon: cat.icon,
            singleMode: Boolean(cat.singleMode),
            defaultDifficulty: cat.defaultDifficulty || null,
            questionsPerQuiz: cat.questionsPerQuiz || data.questionsPerQuiz,
            description: cat.description || null,
          }))
          .sort((a, b) => {
            const na = parseInt(a.key.replace(/\D/g, ""), 10) || 0;
            const nb = parseInt(b.key.replace(/\D/g, ""), 10) || 0;
            return na - nb;
          }),
        difficulties: data.difficulties,
        questionsPerQuiz: data.questionsPerQuiz,
      });
    }

    const learnMatch = path.match(/^\/api\/learn\/([^/]+)\/([^/]+)$/);
    if (learnMatch && method === "GET") {
      const [, category, difficulty] = learnMatch;
      const cat = data.categories[category];
      if (!cat || !cat.learn[difficulty]) {
        return jsonResponse({ error: "Material topilmadi" }, 404);
      }
      return jsonResponse({
        title: cat.title,
        icon: cat.icon,
        difficulty,
        difficultyLabel: data.difficulties[difficulty],
        ...cat.learn[difficulty],
      });
    }

    const quizMatch = path.match(/^\/api\/quiz\/([^/]+)\/([^/]+)$/);
    if (quizMatch && method === "GET") {
      const [, category, difficulty] = quizMatch;
      const cat = data.categories[category];
      if (!cat || !cat.questions[difficulty]) {
        return jsonResponse({ error: "Savollar topilmadi" }, 404);
      }

      const pool = cat.questions[difficulty];
      const quizSize = cat.questionsPerQuiz || data.questionsPerQuiz;
      const useAll = Boolean(cat.singleMode);
      const count = useAll ? pool.length : Math.min(quizSize, pool.length);
      const picked = useAll ? shuffle(pool) : shuffle(pool).slice(0, count);
      const questions = shuffle(picked.map(prepareQuestion));

      return jsonResponse({
        category,
        categoryTitle: cat.title,
        difficulty,
        difficultyLabel: data.difficulties[difficulty],
        total: questions.length,
        questions,
      });
    }

    if (path.startsWith("/api/ai/")) {
      return jsonResponse(
        {
          error:
            "AI faqat server rejimida ishlaydi. GitHub Pages rejimida testlar va progress saqlanadi.",
        },
        503
      );
    }

    return jsonResponse({ error: "Topilmadi" }, 404);
  }

  window.StaticApi = {
    enabled: false,
    handle,
    syncFullDbToServer,
    isEnabled() {
      return this.enabled;
    },
  };
})();
