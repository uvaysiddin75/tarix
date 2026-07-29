# -*- coding: utf-8 -*-
"""Add Nazorat ishi - 2: Misr va Mesopotamiya"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_PATH = ROOT / "data" / "questions.json"

ANSWERS = "ABDDADADADACBADBCBACACBAC"

QUESTIONS = [
    {
        "q": "Nil daryosi Afrikaning qaysi qismida sivilizatsiya vujudga kelishi uchun zamin yaratgan?",
        "options": [
            "Afrikaning shimoli-sharqida",
            "Afrika janubida",
            "Afrika shimoli-g'arbida",
            "Afrika janubi-sharqida",
        ],
        "explanation": "Nil daryosi Afrikaning shimoli-sharqida joylashgan va qadimgi Misr sivilizatsiyasining paydo bo'lishiga zamin yaratgan.",
    },
    {
        "q": "Nil daryosi qirg'oqlarini vodiyliklar qachondan boshlab o'zlashtira boshlaganlar?",
        "options": [
            "Mil avv 4-mingyillik oxirida",
            "Mil avv 4-mingyillik boshlarida",
            "Mil avv 3-mingyillik boshlarida",
            "Mil avv 4-mingyillik o'rtalarida",
        ],
        "explanation": "Nil daryosi qirg'oqlaridagi vodiyliklar mil avv 4-mingyillik boshlarida o'zlashtirila boshlangan.",
    },
    {
        "q": "Misrda qachondan boshlab «nom»lar vujudga kela boshlagan?",
        "options": [
            "Mil avv 4-mingyillik boshlarida",
            "Mil avv 4-mingyillik o'rtalarida",
            "Mil avv 4-mingyillikda",
            "Mil avv 4-mingyillik oxirida",
        ],
        "explanation": "Misrda «nom»lar (ma'muriy birliklar) mil avv 4-mingyillik oxirida vujudga kela boshlagan.",
    },
    {
        "q": "Misrni mil avv 3000-yillikda birlashtirgan Quyi Misr hukmdori kim edi?",
        "options": ["Menes", "Tutanxamon", "Ramzes II", "To'g'ri javob yo'q"],
        "explanation": "Mil avv 3000-yillikda Misrni birlashtirgan hukmdor haqida aniq ma'lumot yo'q — to'g'ri javob yo'q.",
    },
    {
        "q": "Misr Nubiya bilan qaysi tomondan chegaradosh?",
        "options": ["Janub", "G'arb", "Shimol", "Sharq"],
        "explanation": "Misr janubida Nubiya joylashgan.",
    },
    {
        "q": "Giksoslar Quyi Misrni qachon bosib oladi?",
        "options": [
            "Mil avv XVI asr",
            "Mil avv XV asr",
            "Mil avv XVII asr",
            "Mil avv XVIII asr",
        ],
        "explanation": "Giksoslar mil avv XVIII asrda Quyi Misrni bosib olgan.",
    },
    {
        "q": "Liviya Misrning qaysi qismida joylashgan?",
        "options": ["Janubiy Misr", "Sharqiy Misr", "Shimoliy Misr", "G'arbiy Misr"],
        "explanation": "Liviya Misrning g'arbiy qismida joylashgan.",
    },
    {
        "q": "Giksoslarga qarshi kurashda qaysi shahar fir'avni atrofida birlashadilar?",
        "options": ["Fiva", "Memfis", "Giza", "Baolbek"],
        "explanation": "Giksoslarga qarshi kurashda Fiva shahri fir'avni atrofida birlashgan.",
    },
    {
        "q": "Qaysi podsholik davrida Sinay yarim oroli bosib olinadi, Nubiya va Liviyaga yurish qilinadi?",
        "options": [
            "Ilk podsholik davrida",
            "So'ngi podsholik",
            "Yangi podsholik",
            "Qadimgi podsholik",
        ],
        "explanation": "Qadimgi podsholik davrida Sinay yarim oroli, Nubiya va Liviya bosib olinadi.",
    },
    {
        "q": "Kir II ning o'g'li Kambiz II qachon Misrni bosib oladi?",
        "options": [
            "Mil avv 525-yilda",
            "Mil avv 522-yilda",
            "Mil avv 605-yilda",
            "Mil avv 605-yilda",
        ],
        "explanation": "Kambiz II mil avv 525-yilda Misrni bosib olgan.",
    },
    {
        "q": "Old Osiyoda misrliklar hukmronligi kimning davrida o'rnatilgan?",
        "options": ["Menes", "Tutmos I", "Tutmos II", "Tutmos III"],
        "explanation": "Old Osiyoda misrliklar hukmronligi Tutmos III davrida o'rnatilgan.",
    },
    {
        "q": "Tutmos II davrida qayerlar egallangan?",
        "options": [
            "Falastin, Finikiya, Suriya",
            "Old Osiyo",
            "Nubiya va Liviya",
            "Falastin, Suriya",
        ],
        "explanation": "Tutmos II davrida Falastin, Finikiya va Suriya egallangan.",
    },
    {
        "q": "Misrdagi hayotning birlamchi manbai va posboni bu?",
        "options": ["Ptax", "Amon-Ra", "Xapi", "Osiris"],
        "explanation": "Xapi — Nil daryosi va hayotning birlamchi manbai, posbon deb hisoblangan.",
    },
    {
        "q": "Piramidalar qaysi podsholiklarda qurilgan?",
        "options": [
            "Ilk va qadimgi podsholik",
            "Qadimgi va o'rta podsholik",
            "Qadimgi va yangi podsholik",
            "Yangi va so'ngi podsholik",
        ],
        "explanation": "Piramidalar ilk va qadimgi podsholik davrlarida qurilgan.",
    },
    {
        "q": "Tutanxamon maqbarasi qaysi davrga oid?",
        "options": [
            "Qadimgi podsholik",
            "O'rta podsholik",
            "So'ngi podsholik",
            "Yangi podsholik",
        ],
        "explanation": "Tutanxamon maqbarasi yangi podsholik davriga oid.",
    },
    {
        "q": "Misr iyerogliflarini sirini kim kashf etgan?",
        "options": [
            "Dyupperon 1825-yilda",
            "Shampolyon 1822-yilda",
            "Rixtgofen 1877-yilda",
            "Genrix Shliman 1822-yilda",
        ],
        "explanation": "Misr iyerogliflarining siri Shampolyon tomonidan 1822-yilda kashf etilgan.",
    },
    {
        "q": "Tabiblarni tayyorlovchi maxsus maktablar qayerda bo'lgan?",
        "options": ["Mesopotamiyada", "Bobilda", "Hindistonda", "Misrda"],
        "explanation": "Tabiblarni tayyorlovchi maxsus maktablar Misrda bo'lgan.",
    },
    {
        "q": "Mil avv 4-mingyillikda Mesopotamiyada kimlarning manzilgohlari vujudga kela boshlagan?",
        "options": ["Shumer", "Akkad", "Elamiylar", "Kassiylar"],
        "explanation": "Mil avv 4-mingyillikda Mesopotamiyada shumerlarning manzilgohlari paydo bo'la boshlagan.",
    },
    {
        "q": "Mesopotamiyaliklar kimlar bilan savdo-sotiq qilganlar?",
        "options": [
            "Misr, Suriya",
            "Xetlar va Mitanni bilan",
            "Eon, Kavkazorti",
            "Suriya va Falastin",
        ],
        "explanation": "Mesopotamiyaliklar Eon va Kavkazorti bilan savdo-sotiq qilganlar.",
    },
    {
        "q": "Mixxat yozuvini kimlar ixtiro qilgan?",
        "options": ["Misrliklar", "Shumerlar", "Akkadlar", "Bobilliklar"],
        "explanation": "Mixxat yozuvini shumerlar ixtiro qilgan.",
    },
    {
        "q": "Quyidagi ma'budlardan o'xshashini toping:",
        "options": [
            "Ea — Xapi",
            "Ishtar — Ptax",
            "Sina — Osiris",
            "Shamash — Apis",
        ],
        "explanation": "Ea (Mesopotamiya) va Xapi (Misr) — suv va hayot bilan bog'liq xudolar.",
    },
    {
        "q": "Mesopotamiyada mil avv 4-mingyillikda vujudga kelgan shahar-davlatlar?",
        "options": [
            "Tir, Sidon, Ugarit",
            "Uruk, Umma, Lagash, Ur",
            "Magadha, Koshola, Malla",
            "Shumer va Akkad",
        ],
        "explanation": "Mil avv 4-mingyillikda Uruk, Umma, Lagash, Ur kabi shahar-davlatlar vujudga kelgan.",
    },
    {
        "q": "Dastlabki rasadxonalar qaysi davlatda bo'lgan va u ibodatxonalar tepasida bunyod etilgan?",
        "options": ["Misrliklar", "Suriya", "Mesopotamiya", "Inklar"],
        "explanation": "Dastlabki rasadxonalar Mesopotamiyada ibodatxonalar (zikkuratlar) tepasida qurilgan.",
    },
    {
        "q": "Sargon I haqida quyidagi fikrlardan qaysi biri noto'g'ri?",
        "options": [
            "Shumer podshosi Sargon I mil avv 3-mingyillik ikkinchi yarmida Mesopotamiyani yagona davlatga birlashtiradi",
            "O'zini «to'rt iqlim mamlakati podshosi» deb ataydi",
            "Yagona og'irlik, uzunlik, maydon o'lchovini joriy qiladi",
            "5400 nafardan iborat muntazam qo'shin tuzadi",
        ],
        "explanation": "Sargon I shumer podshosi emas — bu fikr noto'g'ri. U Akkad podshosi bo'lgan.",
    },
    {
        "q": "Mesopotamiyada qadimiy ibodatxonalar qanday nomlanadi?",
        "options": ["Sinagoga", "Maqbara", "Zikkurat", "Cherkov"],
        "explanation": "Mesopotamiyadagi qadimiy ibodatxonalar zikkurat deb atalgan.",
    },
]

LEARN = {
    "title": "Nazorat ishi - 2: Misr va Mesopotamiya",
    "intro": "Qadimgi Misr va Mesopotamiya tarixi bo'yicha nazorat ishiga tayyorgarlik materiali.",
    "sections": [
        {
            "heading": "Qadimgi Misr",
            "text": "Nil daryosi Afrikaning shimoli-sharqida joylashgan. Vodiylar mil avv 4-mingyillik boshlarida o'zlashtirilgan. «Nom»lar mil avv 4-mingyillik oxirida paydo bo'lgan. Misr janubida Nubiya, g'arbida Liviya bilan chegaradosh. Piramidalar ilk va qadimgi podsholikda qurilgan. Xapi — hayotning manbai. Shampolyon 1822-yilda iyeroglif sirini ochgan.",
        },
        {
            "heading": "Misr podsholiklari",
            "text": "Qadimgi podsholik — Sinay, Nubiya va Liviyaga yurishlar. Giksoslar mil avv XVIII asrda Quyi Misrni bosib olgan, Fiva fir'avni atrofida birlashgan. Tutmos III Old Osiyoda hukmronlik o'rnatgan. Tutmos II Falastin, Finikiya va Suriyani egallagan. Tutanxamon yangi podsholik davriga oid.",
        },
        {
            "heading": "Qadimgi Mesopotamiya",
            "text": "Mil avv 4-mingyillikda shumerlar manzilgohlari paydo bo'lgan. Uruk, Umma, Lagash, Ur — shahar-davlatlar. Mixxat yozuvini shumerlar ixtiro qilgan. Ibodatxonalar — zikkurat. Dastlabki rasadxonalar zikkuratlar tepasida qurilgan. Sargon I Akkad podshosi, «to'rt iqlim mamlakati podshosi».",
        },
        {
            "heading": "Savdo va ma'budlar",
            "text": "Mesopotamiyaliklar Eon va Kavkazorti bilan savdo qilgan. Ea (Mesopotamiya) va Xapi (Misr) o'xshash xudolar — suv va hayot bilan bog'liq. Misrda tabiblar maktablarida tayyorlangan.",
        },
    ],
}


def letter_to_index(letter):
    return ord(letter.upper()) - ord("A")


def main():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

    questions = []
    for i, q in enumerate(QUESTIONS):
        correct = letter_to_index(ANSWERS[i])
        questions.append(
            {
                "id": f"nazorat2-{i + 1}",
                "q": q["q"],
                "options": q["options"],
                "correct": correct,
                "explanation": q["explanation"],
            }
        )

    data["categories"]["nazorat2"] = {
        "title": "Nazorat ishi - 2",
        "icon": "🏛️",
        "singleMode": True,
        "defaultDifficulty": "test",
        "questionsPerQuiz": 25,
        "learn": {"test": LEARN},
        "questions": {"test": questions},
    }

    if "test" not in data["difficulties"]:
        data["difficulties"]["test"] = "Nazorat"

    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Added nazorat2 with {len(questions)} questions")


if __name__ == "__main__":
    main()
