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

    aiFab.hidden = name === "auth";

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

    AiTutor.updateStatus();

  }



  async function onAuthenticated(user) {

    updateUserUI(user);

    await loadMeta();

    showScreen("menu");

  }



  async function initApp() {
    if (window.initApiBase) await window.initApiBase();

    const user = await Auth.checkAuth();
    setupAuthUI();

    if (user) {

      await onAuthenticated(user);

    } else {

      showScreen("auth");

      mainHeader.hidden = true;

      mainFooter.hidden = true;

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
    } else if (authHint) {
      authHint.textContent = "Ro'yxatdan o'ting yoki mavjud hisobingiz bilan kiring";
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

    try {

      const user = await Auth.login(

        document.getElementById("loginEmail").value,

        document.getElementById("loginPassword").value

      );

      await onAuthenticated(user);

    } catch (err) {

      errEl.textContent = err.message;

      errEl.hidden = false;

    }

  });



  document.getElementById("formRegister").addEventListener("submit", async (e) => {

    e.preventDefault();

    const errEl = document.getElementById("registerError");

    errEl.hidden = true;

    try {

      const user = await Auth.register(

        document.getElementById("regName").value,

        document.getElementById("regEmail").value,

        document.getElementById("regPassword").value

      );

      await onAuthenticated(user);

    } catch (err) {

      errEl.textContent = err.message;

      errEl.hidden = false;

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



  async function loadMeta() {

    const res = await Auth.apiFetch("/api/meta");

    if (!res.ok) throw new Error("Ma'lumot yuklanmadi");

    state.meta = await res.json();

    renderCategories();

    populateAdminCategories();

  }



  function getProgressBadge(categoryKey) {

    const user = Auth.getUser();

    const p = user?.progress?.[categoryKey];

    if (!p) return "";

    return `<span class="progress-badge">Eng yaxshi: ${p.bestScore}/${p.total}</span>`;

  }



  function renderCategories() {

    categoryGrid.innerHTML = state.meta.categories

      .map((cat) => {

        const desc = cat.description || `${cat.questionsPerQuiz} ta savol · o'qish + test`;

        return `

        <button class="category-card" data-category="${cat.key}">

          <span class="card-icon">${cat.icon}</span>

          <h3>${cat.title}</h3>

          <p>${desc}</p>

          ${getProgressBadge(cat.key)}

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

    const total = state.questions.length;

    const percent = Math.round((state.score / total) * 100);



    document.getElementById("resultsScore").textContent = `${state.score} / ${total}`;

    document.getElementById("resultsPercent").textContent = `${percent}%`;



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

    } catch { /* ignore */ }



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



    try {

      const users = await Auth.fetchAllUsersProgress();



      tbody.innerHTML = users

        .map((u) => {

          const totalAttempts = Object.values(u.progress || {}).reduce(

            (sum, p) => sum + (p.attempts || 0),

            0

          );

          const avatarHtml = u.avatar

            ? `<img src="${u.avatar}" alt="">`

            : u.name.charAt(0).toUpperCase();



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

    } catch {

      tbody.innerHTML = `<tr><td colspan="${cats.length + 3}" class="empty-hint">Progress yuklanmadi</td></tr>`;

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

    document.getElementById("profileName").value = user.name;

    document.getElementById("profileEmail").value = user.email;

    document.getElementById("profileRole").value =

      user.role === "admin" ? "Administrator" : "O'quvchi";

    document.getElementById("profileError").hidden = true;

    document.getElementById("profileSuccess").hidden = true;



    updateSettingsAvatarPreview(user);

    renderMyProgress(user);

    await renderAllUsersProgress();

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



  document.getElementById("btnPickAvatar").addEventListener("click", () => {

    document.getElementById("avatarInput").click();

  });



  document.getElementById("avatarInput").addEventListener("change", (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 500000) {

      alert("Rasm hajmi 500 KB dan oshmasligi kerak");

      return;

    }

    const reader = new FileReader();

    reader.onload = () => {

      pendingAvatar = reader.result;

      updateSettingsAvatarPreview(Auth.getUser(), pendingAvatar);

    };

    reader.readAsDataURL(file);

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



      const user = await Auth.updateProfile(payload);

      pendingAvatar = undefined;

      updateUserUI(user);

      updateSettingsAvatarPreview(user);

      renderMyProgress(user);

      await renderAllUsersProgress();

      okEl.textContent = "Profil saqlandi";

      okEl.hidden = false;

    } catch (err) {

      errEl.textContent = err.message;

      errEl.hidden = false;

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
    const authHint = document.getElementById("authHint");
    if (authHint) {
      authHint.textContent =
        "Server ishlamayapti. ZAPUSK.bat yoki ZAPUSK-INTERNET.bat ni ishga tushiring.";
    }
    categoryGrid.innerHTML =
      '<p class="loading">Yuklanmadi. Serverni ishga tushiring: ZAPUSK.bat</p>';
  });

})();

