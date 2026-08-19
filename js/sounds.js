// ═══════════════════════════════════════════════════════
//  FX System: Splash · Particles · Sounds · Animations
// ═══════════════════════════════════════════════════════
(function () {
  "use strict";

  // ─── 1. SPLASH SCREEN ───────────────────────────────
  const splash = document.getElementById("splashScreen");
  const canvas = document.getElementById("splashCanvas");

  if (splash && canvas) {
    const ctx = canvas.getContext("2d");
    let W, H, stars = [], raf;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < 120; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 2 + 0.3,
          speed: Math.random() * 0.4 + 0.1,
          opacity: Math.random() * 0.8 + 0.2,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawStars(t) {
      ctx.clearRect(0, 0, W, H);
      // Background gradient
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
      grad.addColorStop(0, "#1a2230");
      grad.addColorStop(1, "#0c0f14");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Gold glow center
      const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 300);
      glow.addColorStop(0, "rgba(212,160,23,0.08)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      stars.forEach((s) => {
        s.twinkle += 0.03;
        const alpha = s.opacity * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,200,160,${alpha})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
      });
    }

    let startTime = null;
    function animate(t) {
      if (!startTime) startTime = t;
      drawStars(t);
      raf = requestAnimationFrame(animate);
    }

    resize();
    initStars();
    window.addEventListener("resize", () => { resize(); initStars(); });
    requestAnimationFrame(animate);

    // Hide splash after 2s
    setTimeout(() => {
      splash.style.transition = "opacity 0.7s ease";
      splash.style.opacity = "0";
      setTimeout(() => {
        splash.style.display = "none";
        cancelAnimationFrame(raf);
      }, 700);
    }, 2000);
  }

  // ─── 2. AUDIO ENGINE ────────────────────────────────
  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, type, dur, vol, delay, fade) {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(vol, ctx.currentTime + delay);
      if (fade) g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + dur);
    } catch (e) {}
  }

  function playCorrect() {
    tone(523, "sine", 0.12, 0.28, 0.00, true);
    tone(659, "sine", 0.12, 0.28, 0.06, true);
    tone(784, "sine", 0.18, 0.28, 0.12, true);
    tone(1047,"sine", 0.30, 0.22, 0.20, true);
  }

  function playWrong() {
    tone(350, "sawtooth", 0.07, 0.14, 0.00, true);
    tone(220, "sawtooth", 0.12, 0.16, 0.07, true);
    tone(160, "sawtooth", 0.18, 0.13, 0.15, true);
  }

  function playClick() {
    tone(900, "sine", 0.04, 0.10, 0.00, true);
    tone(700, "sine", 0.05, 0.07, 0.03, true);
  }

  function playComplete() {
    [523,659,784,1047,784,1047,1319].forEach((f,i) =>
      tone(f, "sine", 0.18, 0.26, i * 0.11, true)
    );
  }

  function playSwipe() {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(700, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18);
      g.gain.setValueAtTime(0.10, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  window.SoundFX = { playCorrect, playWrong, playClick, playComplete, playSwipe };

  // ─── 3. PARTICLES / CONFETTI ────────────────────────
  function spawnParticles(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 9;
      const angle = Math.random() * Math.PI * 2;
      const spd = 70 + Math.random() * 130;
      const vx = Math.cos(angle) * spd;
      const vy = Math.sin(angle) * spd - 90;
      el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;
        background:${color};border-radius:${Math.random()>0.5?"50%":"3px"};
        pointer-events:none;z-index:9999;transform:rotate(${Math.random()*360}deg);`;
      document.body.appendChild(el);
      let st = null;
      const dur = 750 + Math.random() * 500;
      (function animate(ts) {
        if (!st) st = ts;
        const p = (ts - st) / dur;
        if (p >= 1) { el.remove(); return; }
        el.style.left = (x + vx * p) + "px";
        el.style.top  = (y + vy * p + 220 * p * p) + "px";
        el.style.opacity = 1 - p;
        el.style.transform = `rotate(${p * 720}deg)`;
        requestAnimationFrame(animate);
      })(performance.now());
    }
  }

  const GOLD_COLORS = ["#d4a017","#fbbf24","#34d399","#ffffff","#2dd4bf","#a78bfa"];

  function burstCorrect(btn) {
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    spawnParticles(r.left + r.width/2, r.top + r.height/2, 20, GOLD_COLORS);
  }

  function burstComplete() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        spawnParticles(
          window.innerWidth * (0.15 + Math.random() * 0.7),
          window.innerHeight * 0.25,
          22, GOLD_COLORS
        );
      }, i * 160);
    }
  }

  window.FXBurst = { burstCorrect, burstComplete };

  // ─── 4. SLIDE ANIMATION ─────────────────────────────
  function slideIn(el, dir) {
    if (!el) return;
    const dx = dir === "left" ? "-40px" : "40px";
    el.style.opacity = "0";
    el.style.transform = `translateX(${dx})`;
    el.style.transition = "opacity 0.32s ease, transform 0.32s ease";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    }));
  }

  function fadeIn(el) {
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(16px) scale(0.97)";
    el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0) scale(1)";
    }));
  }

  window.FXAnimate = { slideIn, fadeIn };

  // ─── 5. GLOBAL CLICK SOUND ──────────────────────────
  // MutationObserver — answer buttons
  new MutationObserver(() => {
    document.querySelectorAll(".answer-btn:not([data-fx])").forEach((btn) => {
      btn.setAttribute("data-fx", "1");
      btn.addEventListener("click", () => playClick(), { once: false });
    });
  }).observe(document.body, { childList: true, subtree: true });

  // All other buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button, .category-card, .difficulty-card");
    if (btn && !btn.closest("[data-fx]") && !btn.classList.contains("answer-btn")) {
      playClick();
    }
  });

})();
