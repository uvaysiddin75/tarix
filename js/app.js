(function () {

  "use strict";



  const state = {

    category: null,

    categoryTitle: "",

    difficulty: null,

    questions: [],

    currentIndex: 0,

    score: 0,

    answered: false,

    meta: null,

    learnData: null,

    lastSelectedIndex: null,

  };



  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const passwordEyeIcons = `<svg class="icon-eye" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><svg class="icon-eye-off" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

  function renderPasswordCell(password) {
    if (!password) return "—";
    return `<div class="password-reveal"><span class="user-password-text">••••••</span><button type="button" class="password-toggle password-toggle-sm" data-password="${escapeAttr(password)}" aria-label="Parolni ko'rsatish">${passwordEyeIcons}</button></div>`;
  }



  const screens = {

    auth: document.getElementById("screenAuth"),

    menu: document.getElementById("screenMenu"),

    difficulty: document.getElementById("screenDifficulty"),

    learn: document.getElementById("screenLearn"),

    quiz: document.getElementById("screenQuiz"),

    results: document.getElementById("screenResults"),

    admin: document.getElementById("screenAdmin"),

    settings: document.getElementById("screenSettings"),

  };



  const mainHeader = document.getElementById("mainHeader");

  const mainFooter = document.getElementById("mainFooter");

  const aiFab = document.getElementById("aiFab");

  const statsBar = document.getElementById("statsBar");

  const statScore = document.getElementById("statScore");

  const statProgress = document.getElementById("statProgress");

  const categoryGrid = document.getElementById("categoryGrid");

  let pendingAvatar = undefined;
  let pendingCover = undefined;
  let adminRefreshTimer = null;



  function renderAvatarEl(el, user) {

    if (!el) return;

    const letter = user.name.charAt(0).toUpperCase();

    el.innerHTML = "";

    if (user.avatar) {

      const img = document.createElement("img");

      img.src = user.avatar;

      img.alt = user.name;

      el.appendChild(img);

    } else {

      el.textContent = letter;

    }

  }



  function setNavActive(nav) {

    document.querySelectorAll(".nav-tab").forEach((tab) => {

      tab.classList.toggle("active", tab.dataset.nav === nav);

    });

  }



  window.AppState = {

    getAiContext() {

      return {

        categoryTitle: state.categoryTitle,

        learnIntro: state.learnData?.intro,

        learnSections: state.learnData?.sections || [],

      };

    },

  };



  function showScreen(name) {

    Object.entries(screens).forEach(([key, el]) => {

      if (el) el.classList.toggle("active", key === name);

    });

    statsBar.hidden = name !== "quiz";

    aiFab.hidden = name === "auth" || !Auth.isAiEnabled?.();

    if (name === "menu" || name === "settings") {

      setNavActive(name);

    }

    window.scrollTo({ top: 0, behavior: "smooth" });

  }



  function updateUserUI(user) {

    document.getElementById("userName").textContent = user.name.split(" ")[0];

    document.getElementById("userEmail").textContent = user.email;

    renderAvatarEl(document.getElementById("userAvatar"), user);

    document.getElementById("btnAdminPanel").hidden = user.role !== "admin";

    document.getElementById("mainNav").hidden = false;

    mainHeader.hidden = false;

    mainFooter.hidden = false;

    const syncSection = document.getElementById("dataSyncSection");
    if (syncSection) {
      syncSection.hidden = !(Auth.isStaticMode?.() && user.role === "admin");
    }

    const studentExport = document.getElementById("studentExportSection");
    if (studentExport) {
      studentExport.hidden = !(Auth.isStaticMode?.() && user.role !== "admin");
    }

    if (Auth.isStaticMode?.()) {
      aiFab.hidden = true;
      const footer = mainFooter.querySelector("p");
      if (footer) footer.textContent = "Tez rejim · Serverga kirganda barcha userlar ko'rinadi";
    } else {
      AiTutor.updateStatus();
      const footer = mainFooter.querySelector("p");
      if (footer) footer.textContent = "Umumiy baza · Barcha foydalanuvchilar saqlanadi";
    }

  }



  async function onAuthenticated(user) {

    updateUserUI(user);

    await loadMeta();

    showScreen("menu");

  }



  function setAuthStatus(text, type = "info") {
    const el = document.getElementById("authStatus");
    if (!el) return;
    if (!text) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = text;
    el.dataset.type = type;
  }

  function showSaveToast(text, type = "ok") {
    let toast = document.getElementById("saveToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "saveToast";
      toast.className = "save-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.dataset.type = type;
    toast.hidden = false;
    clearTimeout(showSaveToast._timer);
    showSaveToast._timer = setTimeout(() => {
      toast.hidden = true;
    }, 3500);
  }



  async function initApp() {
    showScreen("auth");
    mainHeader.hidden = true;
    mainFooter.hidden = true;
    setupAuthUI();

    if (window.initApiBase) {
      try {
        await window.initApiBase();
      } catch {
        /* ignore */
      }
    }

    const user = await Auth.checkAuth().catch(() => null);
    setupAuthUI();

    if (user) {
      await onAuthenticated(user);
    }
  }



  function setupAuthUI() {
    const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
    const registerForm = document.getElementById("formRegister");
    const authHint = document.getElementById("authHint");
    const loginEmail = document.getElementById("loginEmail");

    if (!Auth.isRegistrationEnabled()) {
      if (registerTab) registerTab.hidden = true;
      if (registerForm) registerForm.hidden = true;
      document.querySelector('.auth-tab[data-tab="login"]')?.classList.add("active");
      document.getElementById("formLogin").hidden = false;

      const email = Auth.getAdminEmail();
      if (authHint) {
        authHint.textContent = email
          ? `Faqat administrator kirishi mumkin: ${email}`
          : "Faqat administrator kirishi mumkin";
      }
      if (email && loginEmail && !loginEmail.value) {
        loginEmail.value = email;
      }
    } else {
      if (registerTab) registerTab.hidden = false;
      if (authHint) {
        authHint.textContent = "Ro'yxatdan o'ting yoki mavjud hisobingiz bilan kiring";
      }
    }
  }



  // ——— Auth UI ———

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".password-toggle");
    if (!btn) return;

    if (btn.dataset.target) {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.classList.toggle("visible", show);
      btn.setAttribute("aria-label", show ? "Parolni yashirish" : "Parolni ko'rsatish");
      return;
    }

    const wrap = btn.closest(".password-reveal");
    if (!wrap) return;
    const span = wrap.querySelector(".user-password-text");
    const pwd = btn.dataset.password;
    if (!span || !pwd) return;
    const show = span.dataset.visible !== "true";
    span.textContent = show ? pwd : "••••••";
    span.dataset.visible = show ? "true" : "false";
    btn.classList.toggle("visible", show);
    btn.setAttribute("aria-label", show ? "Parolni yashirish" : "Parolni ko'rsatish");
  });



  document.querySelectorAll(".auth-tab").forEach((tab) => {

    tab.addEventListener("click", () => {

      document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));

      tab.classList.add("active");

      const isLogin = tab.dataset.tab === "login";

      document.getElementById("formLogin").hidden = !isLogin;

      document.getElementById("formRegister").hidden = isLogin;

    });

  });



  document.getElementById("formLogin").addEventListener("submit", async (e) => {

    e.preventDefault();

    const errEl = document.getElementById("loginError");
    errEl.hidden = true;

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span> Kirilmoqda...';
    }

    try {
      const user = await Auth.login(
        document.getElementById("loginEmail").value.trim(),
        document.getElementById("loginPassword").value.trim()
      );
      await onAuthenticated(user);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.hidden = false;
      // Shake animation on error
      const card = document.querySelector(".auth-card");
      if (card) { card.classList.add("shake"); setTimeout(() => card.classList.remove("shake"), 500); }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Kirish"; }
    }

  });



  document.getElementById("formRegister").addEventListener("submit", async (e) => {

    e.preventDefault();

    const errEl = document.getElementById("registerError");
    errEl.hidden = true;

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span> Ro\'yxatdan o\'tilmoqda...';
    }

    try {
      const user = await Auth.register(
        document.getElementById("regName").value.trim(),
        document.getElementById("regEmail").value.trim(),
        document.getElementById("regPassword").value.trim()
      );
      await onAuthenticated(user);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.hidden = false;
      const card = document.querySelector(".auth-card");
      if (card) { card.classList.add("shake"); setTimeout(() => card.classList.remove("shake"), 500); }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Ro'yxatdan o'tish"; }
    }

  });



  document.getElementById("userMenuBtn").addEventListener("click", () => {

    const dd = document.getElementById("userDropdown");

    dd.hidden = !dd.hidden;

  });



  document.addEventListener("click", (e) => {

    const menu = document.getElementById("userMenu");

    if (!menu.contains(e.target)) {

      document.getElementById("userDropdown").hidden = true;

    }

  });



  document.getElementById("btnLogout").addEventListener("click", async () => {

    await Auth.logout();

    showScreen("auth");

    mainHeader.hidden = true;

    mainFooter.hidden = true;

  });



  window.addEventListener("auth:logout", () => {

    showScreen("auth");

    mainHeader.hidden = true;

    mainFooter.hidden = true;

  });



  // ——— Meta & categories ———



  async function fetchLocalMeta() {
    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("Savollar yuklanmadi");
    const data = await res.json();
    return {
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
    };
  }

  async function loadMeta() {
    let meta = null;

    if (!Auth.isStaticMode?.()) {
      try {
        const res = await Auth.apiFetch("/api/meta");
        if (res.ok) meta = await res.json();
      } catch {
        /* server uxlagan — lokal zaxira */
      }
    }

    if (!meta) {
      try {
        if (window.StaticApi?.enabled) {
          const res = await Auth.apiFetch("/api/meta");
          if (res.ok) meta = await res.json();
        }
      } catch {
        /* ignore */
      }
    }

    if (!meta) meta = await fetchLocalMeta();

    state.meta = meta;
    renderCategories();
    populateAdminCategories();
  }



  function getProgressBadge(categoryKey) {
    const user = Auth.getUser();
    const p = user?.progress?.[categoryKey];
    if (!p) return `<span class="progress-badge new-badge">Yangi</span>`;
    const pct = Math.round((p.bestScore / p.total) * 100);
    const color = pct >= 90 ? "#34d399" : pct >= 70 ? "#e8b020" : pct >= 50 ? "#2dd4bf" : "#f87171";
    return `
      <div class="card-progress-row">
        <div class="card-progress-ring" style="--ring-pct:${pct};--ring-color:${color}">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
            <circle cx="20" cy="20" r="16" fill="none" stroke="${color}" stroke-width="3"
              stroke-dasharray="${Math.round(2*Math.PI*16*pct/100)} 999"
              stroke-linecap="round" transform="rotate(-90 20 20)" style="transition:stroke-dasharray 1s ease"/>
          </svg>
          <span class="ring-label">${pct}%</span>
        </div>
        <span class="card-best">En yaxshi: ${p.bestScore}/${p.total}</span>
      </div>
    `;
  }

  // Category color + image themes
  const CAT_THEMES = [
    { accent: "#e8b020", glow: "rgba(232,176,32,0.25)",  tag: "O'rta Osiyo",        img: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=600&q=70&auto=format&fit=crop" },
    { accent: "#2dd4bf", glow: "rgba(45,212,191,0.25)",  tag: "Misr & Mesopotamiya", img: "https://images.unsplash.com/photo-1539650116574-8efeb43b83c3?w=600&q=70&auto=format&fit=crop" },
    { accent: "#f87171", glow: "rgba(248,113,113,0.25)", tag: "Bobil & Sharq",       img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70&auto=format&fit=crop" },
    { accent: "#a78bfa", glow: "rgba(167,139,250,0.25)", tag: "Xorazm & Kushon",     img: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=600&q=70&auto=format&fit=crop" },
    { accent: "#34d399", glow: "rgba(52,211,153,0.25)",  tag: "Qadimgi tarix",       img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=70&auto=format&fit=crop" },
    { accent: "#fb923c", glow: "rgba(251,146,60,0.25)",  tag: "Tarix",               img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=70&auto=format&fit=crop" },
  ];



  function renderCategories() {

    categoryGrid.innerHTML = state.meta.categories

      .map((cat, idx) => {

        const theme = CAT_THEMES[idx % CAT_THEMES.length];
        const desc = cat.description || `${cat.questionsPerQuiz} ta savol · o'qish + test`;
        const user = Auth.getUser();
        const prog = user?.progress?.[cat.key];
        const completed = prog ? "completed" : "";

        return `
        <button class="category-card ${completed}" data-category="${cat.key}"
          style="--cat-accent:${theme.accent};--cat-glow:${theme.glow};--cat-img:url('${theme.img}')">
          <div class="card-bg-img"></div>
          <div class="card-bg-overlay"></div>
          <div class="card-body">
            <div class="card-header-row">
              <span class="card-icon">${cat.icon}</span>
              <span class="card-tag">${theme.tag}</span>
            </div>
            <h3>${cat.title}</h3>
            <p>${desc}</p>
            <div class="card-footer-row">
              <span class="card-questions-badge">📋 ${cat.questionsPerQuiz} savol</span>
              ${getProgressBadge(cat.key)}
            </div>
          </div>
        </button>
      `;

      })

      .join("");



    categoryGrid.querySelectorAll(".category-card").forEach((card) => {

      card.addEventListener("click", async () => {

        state.category = card.dataset.category;

        const cat = state.meta.categories.find((c) => c.key === state.category);

        state.categoryTitle = cat.title;



        if (cat.singleMode) {

          state.difficulty = cat.defaultDifficulty || "test";

          await renderLearnContent();

          showScreen("learn");

          return;

        }



        document.getElementById("difficultyTitle").textContent = `${cat.icon} ${cat.title}`;

        showScreen("difficulty");

      });

    });

  }



  async function renderLearnContent() {

    const res = await Auth.apiFetch(`/api/learn/${state.category}/${state.difficulty}`);

    if (!res.ok) return;

    state.learnData = await res.json();



    document.getElementById("learnBadge").textContent =

      `${state.learnData.title} · ${state.learnData.difficultyLabel}`;

    document.getElementById("learnTitle").textContent = state.learnData.title;

    document.getElementById("learnIntro").textContent = state.learnData.intro;



    document.getElementById("learnContent").innerHTML = state.learnData.sections

      .map(

        (section, i) => `

        <article class="learn-section">

          <div class="section-number">${i + 1}</div>

          <div class="section-body">

            <h3>${section.heading}</h3>

            <p>${section.text}</p>

          </div>

        </article>

      `

      )

      .join("");

  }



  async function startQuiz() {

    const btn = document.getElementById("btnStartQuiz");

    btn.disabled = true;

    btn.textContent = "Yuklanmoqda...";



    try {

      const res = await Auth.apiFetch(`/api/quiz/${state.category}/${state.difficulty}`);

      if (!res.ok) throw new Error("Test yuklanmadi");

      const data = await res.json();



      state.questions = data.questions;

      state.currentIndex = 0;

      state.score = 0;

      state.answered = false;



      document.getElementById("quizBadge").textContent =

        `${data.categoryTitle} · ${data.difficultyLabel}`;



      showScreen("quiz");

      renderQuestion();

    } catch {

      alert("Test yuklanmadi. Qayta urinib ko'ring.");

    } finally {

      btn.disabled = false;

      btn.textContent = "Testni boshlash →";

    }

  }



  function renderQuestion() {

    const q = state.questions[state.currentIndex];

    const total = state.questions.length;

    const num = state.currentIndex + 1;



    document.getElementById("questionNumber").textContent = `Savol ${num} / ${total}`;

    document.getElementById("questionText").textContent = q.question;

    document.getElementById("progressFill").style.width = `${((num - 1) / total) * 100}%`;



    statScore.textContent = `Ball: ${state.score}`;

    statProgress.textContent = `Savol ${num} / ${total}`;



    const container = document.getElementById("answersContainer");

    container.innerHTML = q.options

      .map(

        (opt, i) => `

        <button class="answer-btn" data-index="${i}">

          <span class="answer-letter">${String.fromCharCode(65 + i)}</span>

          <span class="answer-text">${opt}</span>

        </button>

      `

      )

      .join("");



    container.querySelectorAll(".answer-btn").forEach((btn) => {

      btn.addEventListener("click", () => selectAnswer(Number(btn.dataset.index)));

    });



    document.getElementById("quizFeedback").hidden = true;

    document.getElementById("btnAiExplain").hidden = true;

    state.answered = false;

    state.lastSelectedIndex = null;

    // Update question number dot nav
    updateQuizDots();

    // Slide animation
    if (window.FXAnimate) {
      const qCard = document.getElementById("questionText");
      if (qCard) FXAnimate.slideIn(qCard);
      const aContainer = document.getElementById("answersContainer");
      if (aContainer) FXAnimate.slideIn(aContainer);
    }

    // Swipe sound
    if (window.SoundFX) SoundFX.playSwipe();

    // Start per-question timer
    startQuestionTimer();

  }

  // ── Timer ──
  let timerInterval = null;
  let timerSeconds = 0;
  function startQuestionTimer() {
    clearInterval(timerInterval);
    timerSeconds = 0;
    const el = document.getElementById("questionTimer");
    if (!el) return;
    el.textContent = "0s";
    timerInterval = setInterval(() => {
      timerSeconds++;
      el.textContent = timerSeconds + "s";
      if (timerSeconds >= 30) el.style.color = "var(--error)";
      else if (timerSeconds >= 15) el.style.color = "var(--accent)";
      else el.style.color = "var(--text-muted)";
    }, 1000);
  }
  function stopTimer() { clearInterval(timerInterval); }

  // ── Dot navigation ──
  function updateQuizDots() {
    const container = document.getElementById("quizDots");
    if (!container) return;
    const total = state.questions.length;
    const cur = state.currentIndex;
    container.innerHTML = Array.from({ length: total }, (_, i) => {
      const cls = i < cur ? "dot done" : i === cur ? "dot active" : "dot";
      return `<span class="${cls}"></span>`;
    }).join("");
  }



  function selectAnswer(index) {

    if (state.answered) return;

    state.answered = true;

    state.lastSelectedIndex = index;



    const q = state.questions[state.currentIndex];

    const buttons = document.querySelectorAll(".answer-btn");

    const isCorrect = index === q.correctIndex;



    buttons.forEach((btn, i) => {

      btn.disabled = true;

      if (i === q.correctIndex) btn.classList.add("correct");

      if (i === index && !isCorrect) btn.classList.add("wrong");

    });



    if (isCorrect) state.score++;



    const feedback = document.getElementById("quizFeedback");

    const feedbackText = document.getElementById("feedbackText");

    const feedbackExplanation = document.getElementById("feedbackExplanation");

    const btnNext = document.getElementById("btnNextQuestion");

    const btnAi = document.getElementById("btnAiExplain");



    feedbackText.textContent = isCorrect ? "✓ To'g'ri!" : "✗ Noto'g'ri";
    feedbackText.className = "feedback-text " + (isCorrect ? "correct" : "wrong");

    stopTimer();

    // Sounds & particles
    if (isCorrect) {
      if (window.SoundFX) SoundFX.playCorrect();
      const correctBtn = document.querySelector(".answer-btn.correct");
      if (correctBtn && window.FXBurst) FXBurst.burstCorrect(correctBtn);
    } else {
      if (window.SoundFX) SoundFX.playWrong();
    }

    feedbackExplanation.textContent = q.explanation;

    btnAi.hidden = isCorrect;



    const isLast = state.currentIndex >= state.questions.length - 1;

    btnNext.textContent = isLast ? "Natijani ko'rish →" : "Keyingi savol →";

    feedback.hidden = false;

  }



  document.getElementById("btnAiExplain").addEventListener("click", () => {

    const q = state.questions[state.currentIndex];

    AiTutor.explainWrong(q, state.lastSelectedIndex);

  });



  async function showResults() {
    // Play completion sound & confetti
    if (window.SoundFX) SoundFX.playComplete();
    if (window.FXBurst) FXBurst.burstComplete();

    const total = state.questions.length;

    const percent = Math.round((state.score / total) * 100);



    document.getElementById("resultsScore").textContent = `${state.score} / ${total}`;
    document.getElementById("resultsPercent").textContent = `${percent}%`;

    // Extra stats
    const wrong = total - state.score;
    const statC = document.getElementById("statCorrect");
    const statW = document.getElementById("statWrong");
    const statA = document.getElementById("statAccuracy");
    if (statC) statC.textContent = state.score;
    if (statW) statW.textContent = wrong;
    if (statA) statA.textContent = percent + "%";



    let icon, title, message;

    if (percent >= 90) {

      icon = "🏆";

      title = "A'lo natija!";

      message = "Siz tarixni juda yaxshi bilasiz!";

    } else if (percent >= 70) {

      icon = "🎉";

      title = "Yaxshi natija!";

      message = "Materialni yaxshi o'zlashtirdingiz.";

    } else if (percent >= 50) {

      icon = "📚";

      title = "Yomon emas!";

      message = "O'quv materialini qayta o'qing.";

    } else {

      icon = "💪";

      title = "Ko'proq mashq kerak";

      message = "Bo'limlarni diqqat bilan o'qing va AI yordamchidan foydalaning.";

    }



    document.getElementById("resultsIcon").textContent = icon;

    document.getElementById("resultsTitle").textContent = title;

    document.getElementById("resultsMessage").textContent = message;

    document.getElementById("progressFill").style.width = "100%";



    try {

      await Auth.saveProgress(state.category, state.score, total);

      const user = await Auth.checkAuth();

      if (user) updateUserUI(user);

      showSaveToast("Natija saqlandi ✓");

    } catch {

      showSaveToast("Natija saqlanmadi — internetni tekshiring", "warn");

    }



    showScreen("results");

  }



  // ——— Settings ———



  function scoreClass(percent) {

    if (percent >= 70) return "good";

    if (percent >= 50) return "mid";

    return "low";

  }



  function formatProgressItem(cat, prog) {

    const percent = prog.bestPercent || Math.round((prog.bestScore / prog.total) * 100);

    return `

      <div class="progress-item">

        <div class="progress-item-header">

          <span class="progress-item-title">${cat.icon} ${cat.title}</span>

          <span class="progress-item-score">${prog.bestScore}/${prog.total} · ${percent}%</span>

        </div>

        <div class="progress-bar-track">

          <div class="progress-bar-fill" style="width: ${percent}%"></div>

        </div>

        <p class="progress-item-meta">${prog.attempts} urinish · oxirgi: ${prog.lastScore}/${prog.total}</p>

      </div>

    `;

  }



  function renderMyProgress(user) {

    const el = document.getElementById("myProgressList");

    if (!state.meta?.categories?.length) {

      el.innerHTML = '<p class="empty-hint">Yuklanmoqda...</p>';

      return;

    }

    const items = state.meta.categories

      .map((cat) => {

        const prog = user.progress?.[cat.key];

        if (!prog) return null;

        return formatProgressItem(cat, prog);

      })

      .filter(Boolean);



    el.innerHTML = items.length

      ? items.join("")

      : '<p class="empty-hint">Hali test topshirilmagan. Testlar bo\'limidan boshlang.</p>';

  }



  function renderCellScore(prog) {

    if (!prog) return '<span class="score-empty">—</span>';

    const percent = prog.bestPercent || Math.round((prog.bestScore / prog.total) * 100);

    return `<span class="score-cell ${scoreClass(percent)}">${prog.bestScore}/${prog.total}</span>`;

  }



  function renderUsersTable(users, cats, tbody) {
    tbody.innerHTML = users
      .map((u) => {
        const totalAttempts = Object.values(u.progress || {}).reduce(
          (sum, p) => sum + (p.attempts || 0),
          0
        );
        const avatarHtml = u.name.charAt(0).toUpperCase();
        const catCells = cats
          .map((cat) => `<td>${renderCellScore(u.progress?.[cat.key])}</td>`)
          .join("");

        return `
          <tr>
            <td>
              <div class="user-cell">
                <div class="user-cell-avatar">${avatarHtml}</div>
                <div>
                  <strong>${u.name}</strong><br>
                  <small style="color:var(--text-muted)">${u.email}</small>
                </div>
              </div>
            </td>
            <td>${renderPasswordCell(u.password)}</td>
            ${catCells}
            <td>${totalAttempts || "—"}</td>
          </tr>
        `;
      })
      .join("");
  }



  async function renderAllUsersProgress() {
    const section = document.getElementById("allUsersSection");
    const thead = document.getElementById("usersProgressHead");
    const tbody = document.getElementById("usersProgressBody");
    const user = Auth.getUser();

    if (user?.role !== "admin") {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    const cats = state.meta?.categories || [];

    thead.innerHTML = `
      <tr>
        <th>Foydalanuvchi</th>
        <th>Parol</th>
        ${cats.map((c) => `<th>${c.title.replace("Nazorat ishi - ", "N")}</th>`).join("")}
        <th>Urinishlar</th>
      </tr>
    `;

    tbody.innerHTML = `<tr><td colspan="${cats.length + 3}" class="empty-hint">Yuklanmoqda...</td></tr>`;

    try {
      const users = await Auth.fetchAllUsersProgress();
      renderUsersTable(users, cats, tbody);
    } catch {
      tbody.innerHTML = `<tr><td colspan="${cats.length + 3}" class="empty-hint">Server uyg'onmoqda — Yangilash tugmasini bosing</td></tr>`;
    }
  }



  function updateSettingsCoverPreview(user, previewDataUrl) {
    const img = document.getElementById("settingsCoverImg");
    const removeBtn = document.getElementById("btnRemoveCover");
    const hero = document.getElementById("profileHero");
    const src = previewDataUrl !== undefined ? previewDataUrl : user?.cover;

    if (src) {
      img.src = src;
      img.hidden = false;
      removeBtn.hidden = false;
      hero?.classList.add("has-cover");
    } else {
      img.hidden = true;
      img.removeAttribute("src");
      removeBtn.hidden = true;
      hero?.classList.remove("has-cover");
    }
  }



  function updateSettingsAvatarPreview(user, previewDataUrl) {

    const img = document.getElementById("settingsAvatarImg");

    const letter = document.getElementById("settingsAvatarLetter");

    const removeBtn = document.getElementById("btnRemoveAvatar");

    const src = previewDataUrl !== undefined ? previewDataUrl : user?.avatar;



    if (src) {

      img.src = src;

      img.hidden = false;

      letter.hidden = true;

      removeBtn.hidden = false;

    } else {

      img.hidden = true;

      letter.hidden = false;

      letter.textContent = (user?.name || "U").charAt(0).toUpperCase();

      removeBtn.hidden = true;

    }

  }



  async function openSettings() {

    const user = Auth.getUser();

    if (!user) return;



    pendingAvatar = undefined;
    pendingCover = undefined;

    document.getElementById("profileName").value = user.name;

    document.getElementById("profileEmail").value = user.email;

    document.getElementById("profileRole").value =

      user.role === "admin" ? "Administrator" : "O'quvchi";

    document.getElementById("profileError").hidden = true;

    document.getElementById("profileSuccess").hidden = true;



    updateSettingsAvatarPreview(user);
    updateSettingsCoverPreview(user);

    renderMyProgress(user);

    await renderAllUsersProgress();

    if (adminRefreshTimer) clearInterval(adminRefreshTimer);
    if (user.role === "admin") {
      adminRefreshTimer = setInterval(() => {
        if (document.hidden) return;
        if (document.getElementById("screenSettings")?.classList.contains("active")) {
          renderAllUsersProgress();
        }
      }, 90000);
    }

    showScreen("settings");

  }



  document.querySelectorAll(".nav-tab").forEach((tab) => {

    tab.addEventListener("click", () => {

      if (tab.dataset.nav === "menu") showScreen("menu");

      else if (tab.dataset.nav === "settings") openSettings();

    });

  });



  document.getElementById("btnSettings").addEventListener("click", () => {

    document.getElementById("userDropdown").hidden = true;

    openSettings();

  });



  function compressImage(file, maxW, maxH) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          const ratio = Math.min(maxW / w, maxH / h, 1);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }



  document.getElementById("btnRefreshUsers")?.addEventListener("click", () => {
    renderAllUsersProgress();
  });



  document.getElementById("btnPickCover")?.addEventListener("click", () => {
    document.getElementById("coverInput").click();
  });



  document.getElementById("btnPickAvatar").addEventListener("click", () => {

    document.getElementById("avatarInput").click();

  });



  document.getElementById("coverInput")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      pendingCover = await compressImage(file, 900, 240);
      updateSettingsCoverPreview(Auth.getUser(), pendingCover);
    } catch {
      alert("Rasm yuklanmadi");
    }
  });



  document.getElementById("avatarInput").addEventListener("change", async (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    try {

      pendingAvatar = await compressImage(file, 256, 256);

      updateSettingsAvatarPreview(Auth.getUser(), pendingAvatar);

    } catch {

      alert("Rasm yuklanmadi");

    }

  });



  document.getElementById("btnRemoveCover")?.addEventListener("click", () => {
    pendingCover = null;
    updateSettingsCoverPreview(Auth.getUser(), null);
    document.getElementById("coverInput").value = "";
  });



  document.getElementById("btnRemoveAvatar").addEventListener("click", () => {

    pendingAvatar = null;

    updateSettingsAvatarPreview(Auth.getUser(), null);

    document.getElementById("avatarInput").value = "";

  });



  document.getElementById("formProfile").addEventListener("submit", async (e) => {

    e.preventDefault();

    const errEl = document.getElementById("profileError");

    const okEl = document.getElementById("profileSuccess");

    errEl.hidden = true;

    okEl.hidden = true;



    try {

      const payload = { name: document.getElementById("profileName").value.trim() };

      if (pendingAvatar !== undefined) payload.avatar = pendingAvatar;
      if (pendingCover !== undefined) payload.cover = pendingCover;



      const user = await Auth.updateProfile(payload);

      pendingAvatar = undefined;
      pendingCover = undefined;

      updateUserUI(user);

      updateSettingsAvatarPreview(user);
      updateSettingsCoverPreview(user);

      renderMyProgress(user);

      await renderAllUsersProgress();

      okEl.textContent = "Profil saqlandi";

      okEl.hidden = false;

    } catch (err) {

      errEl.textContent = err.message;

      errEl.hidden = false;

    }

  });



  document.getElementById("btnExportUsers")?.addEventListener("click", () => {
    try {
      const data = Auth.exportUsersDb();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nazorat-users-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const errEl = document.getElementById("importError");
      errEl.textContent = err.message;
      errEl.hidden = false;
    }
  });

  document.getElementById("btnExportMyProgress")?.addEventListener("click", () => {
    const user = Auth.getUser();
    if (!user) return;
    const data = { users: [user] };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nazorat-${user.email.split("@")[0]}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importUsersFile")?.addEventListener("change", async (e) => {
    const errEl = document.getElementById("importError");
    const okEl = document.getElementById("importSuccess");
    errEl.hidden = true;
    okEl.hidden = true;

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const count = Auth.importUsersDb(data);
      okEl.textContent = `${count} ta foydalanuvchi ma'lumoti birlashtirildi`;
      okEl.hidden = false;
      await renderAllUsersProgress();
      const user = Auth.getUser();
      if (user) renderMyProgress(user);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.hidden = false;
    } finally {
      e.target.value = "";
    }
  });



  // ——— Admin ———



  function populateAdminCategories() {

    const sel = document.getElementById("adminCategory");

    if (!sel || !state.meta) return;

    sel.innerHTML = state.meta.categories

      .map((c) => `<option value="${c.key}">${c.title}</option>`)

      .join("");

  }



  document.getElementById("btnAdminPanel").addEventListener("click", () => {

    document.getElementById("userDropdown").hidden = true;

    showScreen("admin");

  });



  document.getElementById("btnBackFromAdmin").addEventListener("click", () => showScreen("menu"));



  document.getElementById("btnImportQuestions").addEventListener("click", async () => {

    const errEl = document.getElementById("adminError");

    const okEl = document.getElementById("adminSuccess");

    errEl.hidden = true;

    okEl.hidden = true;



    const btn = document.getElementById("btnImportQuestions");

    btn.disabled = true;

    btn.textContent = "AI ishlayapti...";



    try {

      const res = await Auth.apiFetch("/api/ai/import-questions", {

        method: "POST",

        body: JSON.stringify({

          text: document.getElementById("adminText").value,

          category: document.getElementById("adminCategory").value,

        }),

      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);



      okEl.textContent = `${data.added} ta savol qo'shildi (jami: ${data.total})`;

      okEl.hidden = false;

      document.getElementById("adminText").value = "";

      await loadMeta();

    } catch (err) {

      errEl.textContent = err.message;

      errEl.hidden = false;

    } finally {

      btn.disabled = false;

      btn.textContent = "AI bilan qo'shish";

    }

  });



  // ——— Navigation ———



  document.querySelectorAll(".difficulty-card").forEach((card) => {

    card.addEventListener("click", async () => {

      state.difficulty = card.dataset.difficulty;

      await renderLearnContent();

      showScreen("learn");

    });

  });



  document.getElementById("btnBackToMenu").addEventListener("click", () => showScreen("menu"));

  document.getElementById("btnBackToDifficulty").addEventListener("click", () => {

    const cat = state.meta?.categories.find((c) => c.key === state.category);

    showScreen(cat?.singleMode ? "menu" : "difficulty");

  });

  document.getElementById("btnStartQuiz").addEventListener("click", startQuiz);



  document.getElementById("btnNextQuestion").addEventListener("click", () => {

    if (state.currentIndex < state.questions.length - 1) {

      state.currentIndex++;

      renderQuestion();

    } else {

      showResults();

    }

  });



  document.getElementById("btnRetry").addEventListener("click", startQuiz);

  document.getElementById("btnBackLearn").addEventListener("click", async () => {

    await renderLearnContent();

    showScreen("learn");

  });

  document.getElementById("btnMainMenu").addEventListener("click", () => showScreen("menu"));



  initApp().catch(() => {
    setAuthStatus("Xatolik yuz berdi. Sahifani yangilang (Ctrl+F5)", "error");
    showScreen("auth");
    mainHeader.hidden = true;
    mainFooter.hidden = true;
  });

  window.addEventListener("auth:server-mode", () => {
    const user = Auth.getUser();
    if (user) updateUserUI(user);
    if (Auth.isAdmin?.() && document.getElementById("screenSettings")?.classList.contains("active")) {
      renderAllUsersProgress();
    }
  });

})();

