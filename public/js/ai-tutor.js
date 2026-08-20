(function () {
  "use strict";

  let panelOpen = false;
  let chatHistory = [];

  const fab = document.getElementById("aiFab");
  const panel = document.getElementById("aiPanel");
  const messagesEl = document.getElementById("aiMessages");
  const inputEl = document.getElementById("aiInput");
  const sendBtn = document.getElementById("aiSend");
  const closeBtn = document.getElementById("aiClose");
  const statusEl = document.getElementById("aiStatus");

  function getContext() {
    return window.AppState?.getAiContext?.() || {};
  }

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `ai-msg ai-msg-${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setLoading(loading) {
    sendBtn.disabled = loading;
    inputEl.disabled = loading;
    sendBtn.textContent = loading ? "..." : "Yuborish";
  }

  function openPanel() {
    panelOpen = true;
    panel.classList.add("is-open");
    panel.removeAttribute("hidden");
    panel.setAttribute("aria-hidden", "false");
    fab.classList.add("active");
    inputEl.focus();
  }

  function closePanel() {
    panelOpen = false;
    panel.classList.remove("is-open");
    panel.setAttribute("hidden", "");
    panel.setAttribute("aria-hidden", "true");
    fab.classList.remove("active");
  }

  function togglePanel() {
    if (panelOpen) closePanel();
    else openPanel();
  }

  async function sendMessage(text) {
    const msg = text?.trim();
    if (!msg) return;

    appendMessage("user", msg);
    chatHistory.push({ role: "user", content: msg });
    inputEl.value = "";
    setLoading(true);

    try {
      const res = await Auth.apiFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: msg, context: getContext() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      appendMessage("assistant", data.reply);
      chatHistory.push({ role: "assistant", content: data.reply });
    } catch (err) {
      appendMessage("assistant", "Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function explainWrong(questionData, selectedIndex) {
    openPanel();
    appendMessage("user", `Tushuntiring: «${questionData.question}»`);
    setLoading(true);

    try {
      const res = await Auth.apiFetch("/api/ai/explain", {
        method: "POST",
        body: JSON.stringify({
          question: questionData.question,
          options: questionData.options,
          correctIndex: questionData.correctIndex,
          selectedIndex,
          explanation: questionData.explanation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      appendMessage("assistant", data.reply);
    } catch (err) {
      appendMessage("assistant", questionData.explanation || err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateStatus() {
    if (!statusEl) return;
    if (!Auth.isAiEnabled?.()) {
      statusEl.textContent = Auth.isStaticMode?.()
        ? "GitHub rejimi — AI o'chirilgan"
        : "AI o'chirilgan";
      statusEl.classList.remove("ai-live");
      if (fab) fab.hidden = true;
      return;
    }
    const modes = {
      openai: "AI faol (OpenAI)",
      groq: "AI faol (Groq)",
      gemini: "AI faol (Gemini)",
      smart: "Barcha savollarga javob beradi",
    };
    statusEl.textContent = modes[Auth.getAiMode?.()] || modes.smart;
    statusEl.classList.add("ai-live");
    if (fab) fab.hidden = false;
  }

  fab?.addEventListener("click", togglePanel);

  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePanel();
  });

  sendBtn?.addEventListener("click", () => sendMessage(inputEl.value));

  inputEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
    if (e.key === "Escape") closePanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panelOpen) closePanel();
  });

  window.AiTutor = {
    explainWrong,
    updateStatus,
    openPanel,
    closePanel,
    clearChat() {
      chatHistory = [];
      if (messagesEl) {
        messagesEl.innerHTML =
          '<div class="ai-msg ai-msg-assistant">Salom! Tarix bo\'yicha istalgan savolingizni yozing — javob beraman.</div>';
      }
    },
  };

  AiTutor.clearChat();
})();
