# -*- coding: utf-8 -*-
"""
Yangi nazorat ishini qo'shish:
  python scripts/add-nazorat.py 2 "ACDC..." questions.json

questions.json format:
{
  "title": "Nazorat ishi - 2",
  "learn": { "title": "...", "intro": "...", "sections": [...] },
  "questions": [
    {"q": "...", "options": ["A","B","C","D"], "explanation": "..."},
    ...
  ],
  "answers": "ACDCBC..."
}
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_PATH = ROOT / "data" / "questions.json"


def letter_to_index(letter):
    return ord(letter.upper()) - ord("A")


def add_nazorat(num, answers, questions, learn, title=None):
    key = f"nazorat{num}"
    if len(answers) != len(questions):
        raise ValueError(f"Javoblar ({len(answers)}) va savollar ({len(questions)}) soni mos emas")

    built = []
    for i, q in enumerate(questions):
        built.append({
            "id": f"{key}-{i + 1}",
            "q": q["q"],
            "options": q["options"],
            "correct": letter_to_index(answers[i]),
            "explanation": q.get("explanation", ""),
        })

    return {
        "title": title or f"Nazorat ishi - {num}",
        "icon": "📝",
        "singleMode": True,
        "defaultDifficulty": "test",
        "questionsPerQuiz": len(built),
        "learn": {"test": learn},
        "questions": {"test": built},
    }


def main():
    if len(sys.argv) < 3:
        print("Usage: python add-nazorat.py <num> <answers> [source.json]")
        sys.exit(1)

    num = int(sys.argv[1])
    answers = re.sub(r"\s+", "", sys.argv[2].upper())

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

    if len(sys.argv) >= 4:
        src = json.loads(Path(sys.argv[3]).read_text(encoding="utf-8"))
        learn = src["learn"]
        questions = src["questions"]
        title = src.get("title")
    else:
        print("source.json kerak")
        sys.exit(1)

    data.setdefault("categories", {})[f"nazorat{num}"] = add_nazorat(
        num, answers, questions, learn, title
    )
    if "test" not in data.get("difficulties", {}):
        data["difficulties"] = {"test": "Nazorat"}

    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Qo'shildi: nazorat{num} ({len(answers)} savol)")


if __name__ == "__main__":
    main()
