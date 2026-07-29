const fs = require("fs");
const path = require("path");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const WIKI_HEADERS = {
  "User-Agent": "NazoratIshi/1.0 (history-quiz-app; educational)",
  Accept: "application/json",
};

const wikiCache = new Map();
const DATA_PATH = path.join(__dirname, "..", "data", "questions.json");

const STOP_WORDS = new Set([
  "что", "такое", "это", "как", "кто", "где", "когда", "почему", "расскажи", "про", "об", "о",
  "nima", "qanday", "kim", "qayerda", "qachon", "nega", "haqida", "degani", "such", "the", "is",
  "are", "was", "men", "siz", "menga", "ayting", "javob",   "ber", "скажи", "ответь", "на", "вопрос", "edi", "bor", "yoki", "uchun", "bilan",
]);

const HISTORY_QUERY_HINTS = {
  египет: ["Египет", "Древний Египет", "Ancient Egypt"],
  misr: ["Qadimgi Misr", "Ancient Egypt", "Египет"],
  napoleon: ["Napoleon Bonaparte", "Наполеон Бонапарт"],
  rim: ["Ancient Rome", "Римская империя", "Qadimgi Rim"],
  nil: ["Nil daryosi", "Nile", "Нил"],
  samarqand: ["Samarqand", "Samarkand"],
  toshkent: ["Toshkent", "Tashkent"],
};

const TOPIC_ALIASES = {
  история: "tarix",
  tarix: "tarix",
  history: "tarix",
  misr: "misr",
  egypt: "misr",
  египет: "misr",
  nil: "nil",
  avesto: "avesto",
  arxeolog: "arxeolog",
  archeology: "arxeolog",
  археология: "arxeolog",
  археолог: "arxeolog",
  etnograf: "etnograf",
  ethnography: "etnograf",
  этнограф: "etnograf",
  antropolog: "antropolog",
  anthropologist: "antropolog",
  антрополог: "antropolog",
};

const BUILTIN_ANSWERS = {
  tarix: {
    ru: `История — это наука о прошлом человечества. Она изучает события, людей, общества и культуры, которые существовали до нашего времени. Историки используют документы, археологические находки, памятники и другие источники, чтобы понять, как развивались цивилизации и как прошлое влияет на настоящее.`,
    uz: `Tarix — bu insoniyatning o'tmishi haqidagi fan. U hodisalar, shaxslar, jamiyatlar va madaniyatlarni o'rganadi. Tarixchilar hujjatlar, arxeologik topilmalar va yodgorliklardan foydalanib, sivilizatsiyalar qanday rivojlanganini va o'tmish hozirgi zamonni qanday shakllantirganini o'rganadilar.`,
  },
  arxeolog: {
    ru: `Археолог — учёный, который изучает древние памятники, раскапывает и исследует археологические объекты: городища, могильники, орудия труда, остатки построек. Благодаря археологам мы узнаём о жизни людей в доисторическую эпоху.`,
    uz: `Arxeolog — qadimiy yodgorliklarni o'rganadigan olim. U arxeologik obyektlarni qazib, tosh davri qurollari, qadimiy shahar va qabrlarni o'rganadi. Arxeologlar orqali biz qadimgi odamlarning hayoti haqida bilib olamiz.`,
  },
  etnograf: {
    ru: `Этнограф — учёный, изучающий обычаи, хозяйство и культурные традиции племён и народов, которые сохранились до наших дней.`,
    uz: `Etnograf — hozir yashayotgan qabila va elatlarning urf-odatlari, xo'jalik faoliyati va madaniy an'analarini o'rganadigan olim.`,
  },
  antropolog: {
    ru: `Антрополог — учёный, изучающий человека и общество: происхождение, развитие и культуру людей.`,
    uz: `Antropolog — odam va jamiyatni o'rganadigan olim: insonning kelib chiqishi, rivojlanishi va madaniyati.`,
  },
  avesto: {
    ru: `«Авеста» — священная книга зороастризма, один из древнейших письменных источников по истории Средней Азии.`,
    uz: `«Avesto» — zoroastriylikning muqaddas kitobi, O'rta Osiyo tarixi bo'yicha eng qadimgi yozma manbalardan biri.`,
  },
  misr: {
    ru: `Египет — древняя цивилизация в Северо-Восточной Африке на берегах Нила (более 5000 лет назад). Египтяне построили пирамиды, создали иероглифическую письменность и мощное государство фараонов.`,
    uz: `Misr — Nil daryosi bo'yida vujudga kelgan qadimiy sivilizatsiya. Misrliklar piramidalar qurgan, iyeroglif yozuvini yaratgan va fir'avonlar boshqaruvidagi kuchli davlat barpo etgan.`,
  },
  napoleon: {
    ru: `Наполеон Бонапарт (1769–1821) — французский полководец и император. Завоевал большую часть Европы, провёл реформы во Франции (Кодекс Наполеона). Потерпел поражение при Waterloo и был сослан на остров Святой Елены.`,
    uz: `Napoleon Bonapart (1769–1821) — fransuz sarkardasi va imperator. Yevropaning katta qismini bosib olgan, Fransiyada islohotlar o'tkazgan (Napoleon kodeksi). Vaterloo jangida mag'lub bo'lib, avliyo Yelena oroliga sürgün qilingan.`,
  },
  rim: {
    ru: `Древний Рим — цивилизация в Италии, существовавшая с VIII века до н.э. Римская республика и империя завоевали Средиземноморье, создали развитое право, инженерию (акведуки, дороги) и оказали огромное влияние на мировую историю.`,
    uz: `Qadimgi Rim — miloddan avvalgi VIII asrdan boshlab Italiyada mavjud bo'lgan sivilizatsiya. Rim respublikasi va imperiyasi O'rta yer dengizini bosib olgan, qonunchilik va muhandislik rivoji bilan dunyo tarixiga katta ta'sir ko'rsatgan.`,
  },
};

function loadKnowledge() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch {
    return { categories: {} };
  }
}

function detectLang(text) {
  return /[а-яё]/i.test(text) ? "ru" : "uz";
}

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function normalizeTopic(word) {
  const key = word.toLowerCase();
  return TOPIC_ALIASES[key] || key;
}

function extractTopic(message) {
  const m = message.trim();
  const patterns = [
    /(?:что\s+такое|что\s+значит|кто\s+такой|кто\s+такая|расскажи\s+(?:о|про|об))\s+(.+)/i,
    /(?:nima|nima\s+degani|kim|qachon|qayerda|nega)\s+(.+)/i,
    /(.+?)\s+(?:nima|nima\s+degani|nedir)\s*$/i,
    /^(.+?)\??$/,
  ];

  for (const pattern of patterns) {
    const match = m.match(pattern);
    if (match?.[1]) {
      const words = tokenize(match[1]);
      if (words.length) return normalizeTopic(words.join(" "));
    }
  }

  const words = tokenize(m);
  return words.length ? normalizeTopic(words.join(" ")) : "";
}

function scoreText(text, words) {
  if (words.length === 0) return 0;
  const lower = text.toLowerCase();
  let matched = 0;
  for (const word of words) {
    if (word.length >= 4 && lower.includes(word)) matched++;
  }
  return matched;
}

function localSearch(message, context) {
  const words = tokenize(message).filter((w) => w.length >= 4);
  if (words.length === 0) return [];
  const results = [];

  if (context?.learnSections?.length) {
    for (const section of context.learnSections) {
      const text = `${section.heading}. ${section.text}`;
      const score = scoreText(text, words) + 2;
      if (score > 2) results.push({ score, text: `${section.heading}: ${section.text}` });
    }
  }

  const data = loadKnowledge();
  for (const cat of Object.values(data.categories || {})) {
    for (const diffQuestions of Object.values(cat.questions || {})) {
      for (const q of diffQuestions) {
        const text = `${q.q} ${q.explanation} ${(q.options || []).join(" ")}`;
        const score = scoreText(text, words);
        if (score >= 1) results.push({ score, text: `${q.q}\n→ ${q.explanation}` });
      }
    }
    for (const learnBlock of Object.values(cat.learn || {})) {
      for (const section of learnBlock.sections || []) {
        const text = `${section.heading}. ${section.text}`;
        const score = scoreText(text, words);
        if (score >= 2) results.push({ score, text: `${section.heading}: ${section.text}` });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3);
}

function builtinAnswer(message) {
  const lang = detectLang(message);
  const topic = extractTopic(message);
  const topicKey = topic.split(" ")[0];

  if (BUILTIN_ANSWERS[topicKey]) {
    return BUILTIN_ANSWERS[topicKey][lang] || BUILTIN_ANSWERS[topicKey].uz;
  }

  for (const word of tokenize(message)) {
    const key = normalizeTopic(word);
    if (BUILTIN_ANSWERS[key]) {
      return BUILTIN_ANSWERS[key][lang] || BUILTIN_ANSWERS[key].uz;
    }
  }

  if (/^(tarix|история|history)$/i.test(topic) || /\b(tarix|истори)\b/i.test(message)) {
    return BUILTIN_ANSWERS.tarix[lang];
  }

  return null;
}

async function fetchWikipedia(message) {
  const cacheKey = message.toLowerCase().trim();
  if (wikiCache.has(cacheKey)) return wikiCache.get(cacheKey);

  const queries = buildWikiQueries(message);
  const priority = [];
  const topic = extractTopic(message);
  const hints = HISTORY_QUERY_HINTS[normalizeTopic(topic.split(" ")[0])];
  if (hints) priority.push(...hints);
  priority.push(...queries);

  const seen = new Set();
  for (const query of priority) {
    if (!query || seen.has(query.toLowerCase())) continue;
    seen.add(query.toLowerCase());

    for (const wikiLang of ["ru", "en", "uz"]) {
      const result = await fetchWikiDirectTitle(query, wikiLang);
      if (result) {
        wikiCache.set(cacheKey, result);
        return result;
      }
    }
  }

  wikiCache.set(cacheKey, null);
  return null;
}

function buildWikiQueries(message) {
  const queries = new Set();
  const cleaned = message.trim().replace(/\?+$/, "").trim();
  const topic = extractTopic(message);
  const words = tokenize(message);

  if (topic && topic.length > 1) {
    queries.add(topic);
    const hints = HISTORY_QUERY_HINTS[topic.split(" ")[0]];
    if (hints) hints.forEach((h) => queries.add(h));
  }

  if (cleaned.length > 2) queries.add(cleaned);

  for (const word of words) {
    queries.add(word);
    const hints = HISTORY_QUERY_HINTS[normalizeTopic(word)];
    if (hints) hints.forEach((h) => queries.add(h));
  }

  const stripped = cleaned
    .replace(/^(что такое|что значит|кто такой|расскажи (?:о|про|об))\s+/i, "")
    .replace(/^(nima|nima degani|kim|haqida)\s+/i, "")
    .replace(/\s+(nima|nima degani|haqida|nedir)$/i, "")
    .trim();
  if (stripped.length > 2) {
    queries.add(stripped);
    queries.add(stripped.charAt(0).toUpperCase() + stripped.slice(1));
  }

  return [...queries].slice(0, 5);
}

async function fetchWikiDirectTitle(title, wikiLang) {
  if (!title || title.length < 2) return null;
  try {
    const summaryUrl = `https://${wikiLang}.wikipedia.org/api/rest.php/v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(summaryUrl, { headers: WIKI_HEADERS });
    if (!res.ok) return null;
    const summary = await res.json();
    const extract = summary.extract?.trim();
    return extract && extract.length > 60 ? extract.slice(0, 1400) : null;
  } catch {
    return null;
  }
}

async function fetchWikiSearch(query, wikiLang) {
  try {
    const searchUrl =
      `https://${wikiLang}.wikipedia.org/w/api.php?` +
      new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: query,
        srlimit: "3",
        format: "json",
        origin: "*",
      });

    const searchRes = await fetch(searchUrl, { headers: WIKI_HEADERS });
    const searchData = await searchRes.json();
    const titles = searchData?.query?.search?.map((s) => s.title) || [];

    for (const title of titles) {
      const summaryUrl = `https://${wikiLang}.wikipedia.org/api/rest.php/v1/page/summary/${encodeURIComponent(title)}`;
      const summaryRes = await fetch(summaryUrl, { headers: WIKI_HEADERS });
      if (!summaryRes.ok) continue;

      const summary = await summaryRes.json();
      const extract = summary.extract?.trim();
      if (extract && extract.length > 60) return extract.slice(0, 1400);
    }

    return null;
  } catch (err) {
    console.error(`Wikipedia (${wikiLang}) error:`, err.message);
    return null;
  }
}

function composeAnswer(message, parts, lang) {
  const unique = [...new Set(parts.filter(Boolean))];
  if (unique.length === 0) return null;

  if (unique.length === 1) return unique[0];

  const header =
    lang === "ru"
      ? `По вашему вопросу «${message}»:\n\n`
      : `«${message}» savolingiz bo'yicha:\n\n`;

  return header + unique.slice(0, 2).join("\n\n---\n\n");
}

async function callLLM(provider, messages, maxTokens) {
  if (provider === "openai" && OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: OPENAI_MODEL, messages, max_tokens: maxTokens, temperature: 0.7 }),
    });
    if (!res.ok) throw new Error(parseApiError(await res.text()));
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  }

  if (provider === "groq" && GROQ_API_KEY) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: maxTokens, temperature: 0.7 }),
    });
    if (!res.ok) throw new Error(parseApiError(await res.text()));
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  }

  if (provider === "gemini" && GEMINI_API_KEY) {
    const text = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    });
    if (!res.ok) throw new Error(parseApiError(await res.text()));
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  }

  return null;
}

async function callAnyLLM(messages, maxTokens = 800) {
  for (const provider of ["openai", "groq", "gemini"]) {
    try {
      const reply = await callLLM(provider, messages, maxTokens);
      if (reply) return { reply, source: provider };
    } catch (err) {
      console.error(`${provider} error:`, err.message?.slice(0, 100));
    }
  }
  return null;
}

function buildSystemPrompt(context, lang) {
  const langNote = lang === "ru" ? "Javobni rus tilida ber." : "Javobni o'zbek tilida ber.";
  return `Sen tarix bo'yicha o'qituvchi yordamchisan. Har qanday tarix savoliga to'liq, aniq va tushunarli javob ber.
${langNote}
Faqat tarix mavzusida yordam ber.
${context?.categoryTitle ? `Hozirgi mavzu: ${context.categoryTitle}` : ""}
${context?.learnIntro ? `Kontekst: ${context.learnIntro}` : ""}`;
}

async function smartAnswer(message, context) {
  const lang = detectLang(message);

  const builtin = builtinAnswer(message);
  if (builtin) return { reply: builtin, source: "builtin" };

  const wiki = await fetchWikipedia(message);
  if (wiki) return { reply: wiki, source: "wikipedia" };

  const local = localSearch(message, context);
  if (local.length > 0) {
    return {
      reply: local.map((r, i) => `${i + 1}. ${r.text}`).join("\n\n"),
      source: "local",
    };
  }

  const fallback =
    lang === "ru"
      ? `По запросу «${message}»: уточните вопрос — укажите эпоху, страну или имя («Древний Рим», «Наполеон», «Средние века»).`
      : `«${message}» bo'yicha savolni aniqroq yozing: davr, mamlakat yoki shaxs nomini kiriting.`;

  return { reply: fallback, source: "local" };
}

function fallbackExplain(question, userAnswer, correctAnswer, explanation) {
  return `${explanation}\n\nTo'g'ri javob: «${correctAnswer}». Siz «${userAnswer}» deb tanladingiz. Materialni qayta o'qing.`;
}

async function chat({ message, context }) {
  const lang = detectLang(message);
  const systemPrompt = buildSystemPrompt(context, lang);

  const userContent = context?.learnSections?.length
    ? `${message}\n\nO'quv materiali:\n${context.learnSections.map((s) => `- ${s.heading}: ${s.text}`).join("\n")}`
    : message;

  const llm = await callAnyLLM(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    700
  );
  if (llm) return llm;

  return smartAnswer(message, context);
}

async function explainAnswer({ question, options, correctIndex, selectedIndex, explanation }) {
  const correctAnswer = options[correctIndex];
  const userAnswer = options[selectedIndex];

  const llm = await callAnyLLM(
    [
      {
        role: "system",
        content: "Sen tarix o'qituvchisan. Noto'g'ri javobni tushuntir. O'zbek yoki rus tilida, 3-5 jumla.",
      },
      {
        role: "user",
        content: `Savol: ${question}\nVariantlar: ${options.join(" | ")}\nTo'g'ri: ${correctAnswer}\nTanlangan: ${userAnswer}\nIzoh: ${explanation}`,
      },
    ],
    400
  );
  if (llm) return llm;

  return {
    reply: fallbackExplain(question, userAnswer, correctAnswer, explanation),
    source: "local",
  };
}

function parseApiError(errText) {
  try {
    const data = JSON.parse(errText);
    const msg = data?.error?.message || data?.message;
    if (msg) return msg;
  } catch {
    /* not JSON */
  }
  if (/access denied|network settings/i.test(errText)) {
    return "Tarmoq cheklangan — Groq/OpenAI sizning hududingizda ishlamasligi mumkin. Gemini kalitini sinab ko'ring yoki savollarni oddiy matn formatida qo'shing.";
  }
  return errText.slice(0, 300);
}

function letterToIndex(letter) {
  const c = (letter || "").trim().toUpperCase();
  if (c.length === 1 && c >= "A" && c <= "D") return c.charCodeAt(0) - 65;
  return null;
}

function parseQuestionsLocally(rawText, categoryKey) {
  const text = rawText.replace(/\r\n/g, "\n").trim();
  const blocks = text.split(/\n(?=\d+[\.\)]\s)/).filter(Boolean);
  const questions = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 5) continue;

    const qMatch = lines[0].match(/^\d+[\.\)]\s*(.+)$/);
    if (!qMatch) continue;

    const options = [];
    let correct = null;
    let explanation = "";

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const optMatch = line.match(/^[A-Da-d][\.\)]\s*(.+)$/);
      const ansMatch = line.match(/^(?:Javob|Answer|To'g'ri javob)\s*[:：]?\s*([A-Da-d])/i);

      if (optMatch) {
        options.push(optMatch[1].trim());
      } else if (ansMatch) {
        correct = letterToIndex(ansMatch[1]);
      } else if (/^Izoh\s*[:：]/i.test(line)) {
        explanation = line.replace(/^Izoh\s*[:：]\s*/i, "").trim();
      }
    }

    if (options.length >= 2 && correct != null && correct < options.length) {
      while (options.length < 4) options.push(`Variant ${String.fromCharCode(65 + options.length)}`);
      questions.push({
        id: `${categoryKey}-local-${Date.now()}-${questions.length}`,
        q: qMatch[1].trim(),
        options: options.slice(0, 4),
        correct,
        explanation,
      });
    }
  }

  if (questions.length === 0) {
    throw new Error(
      "Savollar aniqlanmadi. Har bir savol shunday formatda bo'lsin:\n1. Savol matni?\nA) variant\nB) variant\nC) variant\nD) variant\nJavob: B"
    );
  }

  return questions;
}

async function parseQuestionsFromText(rawText, categoryKey) {
  if (isAiConfigured()) {
    try {
      const llm = await callAnyLLM(
        [
          {
            role: "system",
            content: `Test savollarini JSON massiviga aylantir. Faqat JSON:
[{"q":"savol","options":["A","B","C","D"],"correct":0,"explanation":"izoh"}]`,
          },
          { role: "user", content: `Kategoriya: ${categoryKey}\n\n${rawText}` },
        ],
        4000
      );

      if (llm?.reply) {
        const cleaned = llm.reply.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) throw new Error("JSON massiv emas");

        return parsed.map((item, i) => ({
          id: `${categoryKey}-ai-${Date.now()}-${i}`,
          q: item.q,
          options: item.options,
          correct: item.correct,
          explanation: item.explanation || "",
        }));
      }
    } catch (err) {
      console.error("AI import failed, using local parser:", err.message?.slice(0, 120));
    }
  }

  return parseQuestionsLocally(rawText, categoryKey);
}

function isAiConfigured() {
  return Boolean(OPENAI_API_KEY || GROQ_API_KEY || GEMINI_API_KEY);
}

function getAiMode() {
  if (OPENAI_API_KEY) return "openai";
  if (GROQ_API_KEY) return "groq";
  if (GEMINI_API_KEY) return "gemini";
  return "smart";
}

module.exports = {
  chat,
  explainAnswer,
  parseQuestionsFromText,
  isAiConfigured,
  getAiMode,
};
