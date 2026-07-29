require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const auth = require("./lib/auth");
const ai = require("./lib/ai");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, "data", "questions.json");

auth.ensureDefaultAdmin();

function loadData() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
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

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin &&
    (origin.includes("github.io") ||
      origin.includes("trycloudflare.com") ||
      origin.includes("onrender.com"))
  ) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// ——— Auth ———

app.get("/api/auth/status", (req, res) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.json({
      authenticated: false,
      aiEnabled: true,
      aiMode: ai.getAiMode(),
      registrationEnabled: auth.REGISTRATION_ENABLED,
      adminEmail: auth.REGISTRATION_ENABLED ? null : auth.ADMIN_EMAIL,
    });
  }

  const payload = auth.verifyToken(token);
  if (!payload) {
    res.clearCookie("token");
    return res.json({
      authenticated: false,
      aiEnabled: true,
      aiMode: ai.getAiMode(),
      registrationEnabled: auth.REGISTRATION_ENABLED,
      adminEmail: auth.REGISTRATION_ENABLED ? null : auth.ADMIN_EMAIL,
    });
  }

  const user = auth.findUserById(payload.sub);
  if (!user) {
    res.clearCookie("token");
    return res.json({
      authenticated: false,
      aiEnabled: true,
      aiMode: ai.getAiMode(),
      registrationEnabled: auth.REGISTRATION_ENABLED,
      adminEmail: auth.REGISTRATION_ENABLED ? null : auth.ADMIN_EMAIL,
    });
  }

  res.json({
    authenticated: true,
    user: auth.sanitizeUser(user),
    aiEnabled: true,
    aiMode: ai.getAiMode(),
    registrationEnabled: auth.REGISTRATION_ENABLED,
  });
});

app.post("/api/auth/register", async (req, res) => {
  if (!auth.REGISTRATION_ENABLED) {
    return res.status(403).json({ error: "Ro'yxatdan o'tish o'chirilgan" });
  }
  try {
    const user = await auth.register(req.body);
    const token = auth.signToken(user);
    res.cookie("token", token, auth.JWT_COOKIE_OPTIONS);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const user = await auth.login(req.body);
    const token = auth.signToken(user);
    res.cookie("token", token, auth.JWT_COOKIE_OPTIONS);
    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

app.get("/api/auth/me", auth.authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/progress", auth.authMiddleware, (req, res) => {
  const { category, score, total } = req.body;
  if (!category || score == null || !total) {
    return res.status(400).json({ error: "category, score, total talab qilinadi" });
  }
  const progress = auth.saveProgress(req.user.id, { category, score, total });
  res.json({ progress });
});

app.patch("/api/profile", auth.authMiddleware, (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = auth.updateProfile(req.user.id, { name, avatar });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/users/progress", auth.authMiddleware, auth.adminMiddleware, (_req, res) => {
  res.json({ users: auth.getAllUsersProgress() });
});

// ——— Protected quiz API ———

app.get("/api/meta", auth.authMiddleware, (_req, res) => {
  const data = loadData();
  res.json({
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
});

app.get("/api/learn/:category/:difficulty", auth.authMiddleware, (req, res) => {
  const data = loadData();
  const { category, difficulty } = req.params;
  const cat = data.categories[category];
  if (!cat || !cat.learn[difficulty]) {
    return res.status(404).json({ error: "Material topilmadi" });
  }
  res.json({
    title: cat.title,
    icon: cat.icon,
    difficulty,
    difficultyLabel: data.difficulties[difficulty],
    ...cat.learn[difficulty],
  });
});

app.get("/api/quiz/:category/:difficulty", auth.authMiddleware, (req, res) => {
  const data = loadData();
  const { category, difficulty } = req.params;
  const cat = data.categories[category];
  if (!cat || !cat.questions[difficulty]) {
    return res.status(404).json({ error: "Savollar topilmadi" });
  }

  const pool = cat.questions[difficulty];
  const quizSize = cat.questionsPerQuiz || data.questionsPerQuiz;
  const useAll = Boolean(cat.singleMode);
  const count = useAll ? pool.length : Math.min(quizSize, pool.length);
  const picked = useAll ? shuffle(pool) : shuffle(pool).slice(0, count);
  const questions = shuffle(picked.map(prepareQuestion));

  res.json({
    category,
    categoryTitle: cat.title,
    difficulty,
    difficultyLabel: data.difficulties[difficulty],
    total: questions.length,
    questions,
  });
});

// ——— AI ———

app.post("/api/ai/chat", auth.authMiddleware, async (req, res) => {
  const { message, context } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "Xabar bo'sh bo'lmasligi kerak" });
  }
  try {
    const result = await ai.chat({ message: message.trim(), context });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/explain", auth.authMiddleware, async (req, res) => {
  const { question, options, correctIndex, selectedIndex, explanation } = req.body;
  try {
    const result = await ai.explainAnswer({
      question,
      options,
      correctIndex,
      selectedIndex,
      explanation,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/import-questions", auth.authMiddleware, auth.adminMiddleware, async (req, res) => {
  const { text, category, difficulty = "test" } = req.body;
  if (!text?.trim() || !category) {
    return res.status(400).json({ error: "text va category talab qilinadi" });
  }

  try {
    const newQuestions = await ai.parseQuestionsFromText(text.trim(), category);
    const data = loadData();

    if (!data.categories[category]) {
      return res.status(404).json({ error: "Kategoriya topilmadi" });
    }
    if (!data.categories[category].questions[difficulty]) {
      data.categories[category].questions[difficulty] = [];
    }

    data.categories[category].questions[difficulty].push(...newQuestions);
    saveData(data);

    res.json({
      added: newQuestions.length,
      total: data.categories[category].questions[difficulty].length,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`AI rejim: ${ai.getAiMode()}`);
  if (auth.REGISTRATION_ENABLED) {
    console.log("Ro'yxatdan o'tish: ochiq");
  } else {
    console.log(`Administrator: ${auth.ADMIN_EMAIL}`);
    console.log("Ro'yxatdan o'tish: o'chirilgan (faqat admin kiradi)");
  }
});
