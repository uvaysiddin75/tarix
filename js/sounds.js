// Sound & Animation System
(function () {
  "use strict";

  // ─── Audio Engine (Web Audio API — hech qanday fayl kerak emas) ───
  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(frequency, type, duration, volume, startTime, fadeOut) {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
      if (fadeOut) {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      }
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    } catch (e) {}
  }

  // To'g'ri javob — maftunkor chord
  function playCorrect() {
    playTone(523, "sine", 0.15, 0.3, 0.0, true);
    playTone(659, "sine", 0.15, 0.3, 0.05, true);
    playTone(784, "sine", 0.25, 0.3, 0.10, true);
    playTone(1047, "sine", 0.35, 0.25, 0.18, true);
  }

  // Noto'g'ri javob — past buzilish tovushi
  function playWrong() {
    playTone(330, "sawtooth", 0.08, 0.15, 0.0, true);
    playTone(220, "sawtooth", 0.15, 0.2, 0.08, true);
    playTone(165, "sawtooth", 0.2, 0.15, 0.18, true);
  }

  // Tugma bosish — nozik click
  function playClick() {
    playTone(800, "sine", 0.05, 0.12, 0.0, true);
    playTone(600, "sine", 0.06, 0.08, 0.03, true);
  }

  // Test tugashi — g'alaba fanfar
  function playComplete() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    const times = [0, 0.12, 0.24, 0.36, 0.50, 0.62, 0.74];
    notes.forEach((f, i) => playTone(f, "sine", 0.2, 0.28, times[i], true));
  }

  // Savol o'tishi — whoosh
  function playSwipe() {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  window.SoundFX = { playCorrect, playWrong, playClick, playComplete, playSwipe };

  // ─── Confetti (to'g'ri javobda va test tugashida) ───
  function spawnParticles(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "fx-particle";
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 80;
      el.style.cssText = `
        position:fixed;
        left:${x}px;
        top:${y}px;
        width:${size}px;
        height:${size}px;
        background:${color};
        border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
        pointer-events:none;
        z-index:9999;
        transform:rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(el);

      let start = null;
      const duration = 700 + Math.random() * 500;

      function animate(ts) {
        if (!start) start = ts;
        const p = (ts - start) / duration;
        if (p >= 1) { el.remove(); return; }
        const cx = x + vx * p;
        const cy = y + vy * p + 200 * p * p;
        el.style.left = cx + "px";
        el.style.top = cy + "px";
        el.style.opacity = 1 - p;
        el.style.transform = `rotate(${p * 720}deg)`;
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }
  }

  function burstCorrect(btn) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    spawnParticles(cx, cy, 18, ["#d4a017", "#34d399", "#ffffff", "#2dd4bf", "#fbbf24"]);
  }

  function burstComplete() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = window.innerWidth * (0.2 + Math.random() * 0.6);
        const y = window.innerHeight * 0.3;
        spawnParticles(x, y, 20, ["#d4a017", "#34d399", "#f87171", "#2dd4bf", "#ffffff", "#a78bfa"]);
      }, i * 180);
    }
  }

  window.FXBurst = { burstCorrect, burstComplete };

  // ─── Question slide animation ───
  function slideIn(el) {
    el.style.opacity = "0";
    el.style.transform = "translateX(40px)";
    el.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateX(0)";
      });
    });
  }

  window.FXAnimate = { slideIn };

  // ─── Hook into app events ───
  function hookAnswerBtn(btn) {
    btn.addEventListener("click", function handler() {
      btn.removeEventListener("click", handler);
    });
  }

  // Observe DOM mutations to hook into answer buttons & next button
  const observer = new MutationObserver(() => {
    document.querySelectorAll(".answer-btn:not([data-fx])").forEach((btn) => {
      btn.setAttribute("data-fx", "1");
      btn.addEventListener("click", () => {
        playClick();
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Hook all regular buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button, .category-card, .difficulty-card");
    if (btn && !btn.closest(".answer-btn")) {
      playClick();
    }
  });

})();
