# -*- coding: utf-8 -*-
"""Add Nazorat ishi - 3: Bobil va qadimgi Sharq"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_PATH = ROOT / "data" / "questions.json"

ANSWERS = "BCAAAABCDABACCCDDACBCDBBA"

QUESTIONS = [
    {
        "q": "Mil avv II mingyillikda Bobil podsholigi Mesopotamiyaning qaysi qismida vujudga kelgan?",
        "options": ["Shimol", "Janub", "Sharq", "G'arb"],
        "explanation": "Bobil podsholigi janubiy Mesopotamiyada vujudga kelgan.",
    },
    {
        "q": "Mesopotamiyani mil avv XVIII asrda yagona davlatga birlashtirgan hukmdor?",
        "options": ["Navuxudonosor II", "Sargon I", "Hamurappi", "Kiaksar"],
        "explanation": "Hamurappi mil avv XVIII asrda Mesopotamiyani yagona davlatga birlashtirgan.",
    },
    {
        "q": "Kimning davrida Misr bosib olinadi, Iyerusalim vayron qilib tashlanadi?",
        "options": ["Navuxudonosor II", "Sargon I", "Hamurappi", "Kiaksar"],
        "explanation": "Navuxudonosor II davrida Misr bosib olingan va Iyerusalim vayron qilingan.",
    },
    {
        "q": "Yangi Bobil podsholigiga kim hukmronlik qilgan davrda 8 ta darvozasi bo'lgan?",
        "options": ["Navuxudonosor II", "Sargon I", "Hamurappi", "Kiaksar"],
        "explanation": "Navuxudonosor II davrida Bobilning mashhur 8 darvozasi qurilgan.",
    },
    {
        "q": "Kim turarjoy binolari va mudofaa devorlari qurilishida pishgan g'isht ishlatish to'g'risida farmon beradi?",
        "options": ["Navuxudonosor II", "Sargon I", "Hamurappi", "Kiaksar"],
        "explanation": "Navuxudonosor II pishgan g'isht ishlatish to'g'risida farmon bergan.",
    },
    {
        "q": "Dajla va Frot daryolarining yuqori oqimidagi hududda qaysi davlat tashkil topgan?",
        "options": ["Urartu", "Ossuriya", "Finikiya", "Elam"],
        "explanation": "Ossuriya Dajla va Frot daryolarining yuqori oqimidagi hududda joylashgan.",
    },
    {
        "q": "O'rta Yer dengizining sharqiy qirg'og'i bo'ylab hozirgi Livan hududida va Suriyaning bir qismida joylashgan davlat?",
        "options": ["Urartu", "Ossuriya", "Finikiya", "Elam"],
        "explanation": "Finikiya O'rta Yer dengizining sharqiy qirg'og'ida, hozirgi Livan va Suriya hududida joylashgan.",
    },
    {
        "q": "Eronning janubi-g'arbiy qismida, Mesopotamiya bilan chegarada tashkil topgan davlat?",
        "options": ["Urartu", "Ossuriya", "Finikiya", "Elam"],
        "explanation": "Elam Eronning janubi-g'arbiy qismida, Mesopotamiya bilan chegarada joylashgan.",
    },
    {
        "q": "Kavkazorti, Turkiyaning bir qismi va Armaniston hududlarida tashkil topgan davlat?",
        "options": ["Urartu", "Ossuriya", "Finikiya", "Elam"],
        "explanation": "Urartu Kavkazorti, Turkiyaning bir qismi va Armaniston hududlarida tashkil topgan.",
    },
    {
        "q": "Skif qabilalari tomonidan vayron qilingan shahar?",
        "options": ["Ashshur", "Teyshebaini", "Nineviya", "Tushpa"],
        "explanation": "Teyshebaini shahar skif qabilalari tomonidan vayron qilingan.",
    },
    {
        "q": "Midiya va Bobil tomonidan bosib olingan davlat?",
        "options": ["Urartu", "Ossuriya", "Finikiya", "Elam"],
        "explanation": "Ossuriya Midiya va Bobil tomonidan bosib olingan.",
    },
    {
        "q": "Kaspiy dengizining janubi-g'arbida tashkil topgan davlat?",
        "options": ["Urartu", "Ossuriya", "Midiya", "Elam"],
        "explanation": "Midiya Kaspiy dengizining janubi-g'arbida joylashgan.",
    },
    {
        "q": "Tir, Sidon, Ugarit kabi yirik dengiz bo'yi shaharlari qaysi davlatda bo'lgan?",
        "options": ["Urartu", "Ossuriya", "Finikiya", "Elam"],
        "explanation": "Tir, Sidon va Ugarit Finikiyaning yirik dengiz bo'yi shaharlari bo'lgan.",
    },
    {
        "q": "Fors viloyati qayerda joylashgan?",
        "options": [
            "Kaspiy dengizining janubi-g'arbida",
            "Kavkazorti, Turkiyaning bir qismi va Armaniston hududlarida",
            "O'rta Yer dengizining sharqiy qirg'og'i bo'ylab hozirgi Livan va Suriyaning bir qismida",
            "Eronning janubida, Fors ko'rfaziga tutashib ketgan yerlarda",
        ],
        "explanation": "Fors viloyati Eronning janubida, Fors ko'rfaziga tutashib ketgan hududda joylashgan.",
    },
    {
        "q": "Kir II ning istilochilik yurishlari to'g'ri berilgan qatorni belgilang?",
        "options": [
            "Midiya, Armaniston, Bobil",
            "Kavkazorti, Armaniston, Midiya, Bobil",
            "Falastin, Finikiya",
            "A va C javoblar",
        ],
        "explanation": "Kir II Midiya, Armaniston, Bobil hamda Falastin va Finikiyani bosib olgan — A va C javoblar to'g'ri.",
    },
    {
        "q": "Yunon-fors urushlariga sabab bo'lgan voqea?",
        "options": [
            "Frakiyaning bosib olinishi",
            "Mamlakatni satrapliklarga bo'lishi",
            "Skiflar ustiga yurish qilishi",
            "Falastinni bosib olinishi",
        ],
        "explanation": "Frakiyaning bosib olinishi Yunon-fors urushlariga sabab bo'lgan voqealardan biri.",
    },
    {
        "q": "«Shoh yo'li» qayerdan qayergacha davom etgan?",
        "options": [
            "O'rta Yer dengizidan to Shimoliy Hindistongacha",
            "Persepoldan to O'rta Yer dengizigacha",
            "Suza shahridan to Qora dengizgacha",
            "Baqtryadan to Persepol shahrigacha",
        ],
        "explanation": "«Shoh yo'li» Persepoldan O'rta Yer dengizigacha davom etgan.",
    },
    {
        "q": "Behistun, Naqshi Rustam va Persepol saroyi devoridagi yozuvlar qaysi davlat tarixiga mansub?",
        "options": ["Shumerlar", "Akkadlar", "Forslar", "Hindlar"],
        "explanation": "Behistun, Naqshi Rustam va Persepol yozuvlari Fors imperiyasi tarixiga mansub.",
    },
    {
        "q": "Yunon-fors urushlari qaysi hukmdor davrida boshlangan?",
        "options": ["Kambiz", "Doro I", "Kserks", "Kir II"],
        "explanation": "Yunon-fors urushlari Doro I davrida boshlangan.",
    },
    {
        "q": "Makedoniyalik Aleksandr qachon Fors davlatini bosib oldi?",
        "options": [
            "Mil avv 337-yil",
            "Mil avv 336-yil",
            "Mil avv 338-yil",
            "Mil avv 330-yil",
        ],
        "explanation": "Aleksandr mil avv 330-yilda Fors davlatini bosib olgan.",
    },
    {
        "q": "Hamurappi qonunlar to'plamida qanday prinsip mavjud?",
        "options": [
            "Bir qo'l uchun bir qo'l",
            "Ko'z uchun ko'z",
            "Bir hayot uchun bir hayot",
            "Bir oila uchun bir oila",
        ],
        "explanation": "Hamurappi qonunlarida «ko'z uchun ko'z» prinsipi mavjud.",
    },
    {
        "q": "Kir II Bobil podsholigini qachon bosib oldi?",
        "options": [
            "Mil avv 612-yil",
            "Mil avv 539-yil",
            "Mil avv 330-yil",
            "Mil avv 586-yil",
        ],
        "explanation": "Kir II mil avv 539-yilda Bobil podsholigini bosib olgan.",
    },
    {
        "q": "Aleksandr Makedonskiyning otasi kim edi?",
        "options": ["Filipp II", "Doro I", "Kserks", "Perikl"],
        "explanation": "Aleksandrning otasi Makedoniya qiroli Filipp II bo'lgan.",
    },
    {
        "q": "Yunon-fors urushlarida qaysi jang dastlabki muhim janglardan biri hisoblanadi?",
        "options": ["Gaugamela", "Marafon", "Iss", "Grankik"],
        "explanation": "Marafon jangi Yunon-fors urushlarining dastlabki muhim janglaridan biri.",
    },
    {
        "q": "Kir II qaysi davlatni birinchi bo'lib yirik istilo qilgan?",
        "options": ["Midiya", "Lidiya", "Bobil", "Misr"],
        "explanation": "Kir II birinchi bo'lib Midiyani yirik istilo qilgan.",
    },
]

LEARN = {
    "title": "Nazorat ishi - 3: Bobil va qadimgi Sharq",
    "intro": "Bobil, Ossuriya, Finikiya, Urartu, Fors imperiyasi va Aleksandr istilosi bo'yicha nazorat ishiga tayyorgarlik materiali.",
    "sections": [
        {
            "heading": "Bobil podsholigi",
            "text": "Mil avv II mingyillikda Bobil janubiy Mesopotamiyada vujudga kelgan. Hamurappi mil avv XVIII asrda mamlakatni birlashtirgan va qonunlar to'plamini yaratgan. Navuxudonosor II davrida Misr bosib olingan, Iyerusalim vayron qilingan, 8 darvoza qurilgan va pishgan g'isht ishlatish farmon qilingan.",
        },
        {
            "heading": "Qo'shni davlatlar",
            "text": "Ossuriya — Dajla va Frotning yuqori oqimida, Nineviya poytaxt. Finikiya — O'rta Yer dengizining sharqiy qirg'og'i (Tir, Sidon, Ugarit). Elam — Eronning janubi-g'arbiy qismida. Urartu — Kavkazorti, Turkiyaning bir qismi va Armaniston hududida. Teyshebaini skiflar tomonidan vayron qilingan.",
        },
        {
            "heading": "Fors imperiyasi",
            "text": "Midiya Kaspiy dengizining janubi-g'arbida joylashgan. Fors viloyati Eronning janubida, Fors ko'rfaziga tutash. Kir II Midiya, Armaniston, Bobil, Falastin va Finikiyani bosib olgan. Bobilni mil avv 539-yilda egallagan. «Shoh yo'li» Persepoldan O'rta Yer dengizigacha. Behistun, Naqshi Rustam va Persepol — Fors yozuvlari.",
        },
        {
            "heading": "Yunon-fors urushlari va Aleksandr",
            "text": "Yunon-fors urushlari Doro I davrida boshlangan. Marafon jangi muhim dastlabki janglardan biri. Aleksandr mil avv 330-yilda Forsni bosib olgan. Uning otasi Filipp II bo'lgan.",
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
                "id": f"nazorat3-{i + 1}",
                "q": q["q"],
                "options": q["options"],
                "correct": correct,
                "explanation": q["explanation"],
            }
        )

    data["categories"]["nazorat3"] = {
        "title": "Nazorat ishi - 3",
        "icon": "🏺",
        "singleMode": True,
        "defaultDifficulty": "test",
        "questionsPerQuiz": 25,
        "learn": {"test": LEARN},
        "questions": {"test": questions},
    }

    if "test" not in data["difficulties"]:
        data["difficulties"]["test"] = "Nazorat"

    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Added nazorat3 with {len(questions)} questions")


if __name__ == "__main__":
    main()
