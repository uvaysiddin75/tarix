# -*- coding: utf-8 -*-
"""Add Nazorat ishi - 1 questions to questions.json"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_PATH = ROOT / "data" / "questions.json"

ANSWERS = "ACDCBCBCADABACCDDAABADDDB"  # 1-25: javoblar A-D

QUESTIONS = [
    {
        "q": "O'rta Osiyo tarixi bo'yicha eng qadimgi manba bu?",
        "options": ['"Avesto"', "Behistun qoyasidagi yozuvlar", '"Geografiya"', '"Tarix" asari'],
        "explanation": "O'rta Osiyo tarixi bo'yicha eng qadimgi manba — «Avesto» asari.",
    },
    {
        "q": "Yurtimizga oid qaysi asarda ko'plab mamlakatlar xalqlari haqida ma'lumotlar berilgan?",
        "options": ['"Avesto"', "Behistun qoyasidagi yozuvlar", '"Geografiya"', '"Tarix" asari'],
        "explanation": "Strabonning «Geografiya» asarida ko'plab xalqlar haqida ma'lumotlar berilgan.",
    },
    {
        "q": "Yurtimizning qadimgi tarixi haqida muhim ma'lumotlar qaysi asorda berilgan?",
        "options": ['"Avesto"', "Behistun qoyasidagi yozuvlar", '"Geografiya"', '"Tarix" asari'],
        "explanation": "Qadimgi tarix haqida muhim ma'lumotlar «Tarix» asarida (Gerodot) berilgan.",
    },
    {
        "q": "Qadimgi odamlarning urf-odatlari, xo'jalik va madaniy an'analarini saqlab qolgan qabila va elatlarni o'rganadigan olimlar bu?",
        "options": ["Antropolog", "Arxeolog", "Etnograf", "Lingivist"],
        "explanation": "Etnograf — hozir yashayotgan qabilalar va elatlarni o'rganadi.",
    },
    {
        "q": "Miloddan avvalgi I asrda yashagan yunon olimi?",
        "options": ["Gerodot", "Strabon", "Doro I", "Arrian"],
        "explanation": "Strabon miloddan avvalgi I asrda yashagan yunon olimi.",
    },
    {
        "q": "Jahondagi barcha xalqlarning tarixi qaysi tuzumdan boshlanadi?",
        "options": ["Urug'", "Qabila", "Ibtidoiy jamoa", "Matriarxat"],
        "explanation": "Barcha xalqlarning tarixi ibtidoiy jamoa tuzumidan boshlanadi.",
    },
    {
        "q": "O'rta tosh davri yunonchada qanday nomlanadi?",
        "options": ["Poleolit", "Mezolit", "Neolit", "Eneolit"],
        "explanation": "O'rta tosh davri yunon tilida mezolit deb ataladi.",
    },
    {
        "q": "Eng qadimgi odam suyak qoldiqlari qayerdan topilgan?",
        "options": ["Shimoliy Afrikadan", "Yevropadan", "Sharqiy Afrikadan", "Amerikadan"],
        "explanation": "Eng qadimgi odam suyak qoldiqlari Sharqiy Afrikadan topilgan.",
    },
    {
        "q": "Qaysi odamning yoshi 2 mln yoshda?",
        "options": ['"Ishbilarmon odam"', "Neandertal", "Kromanyon", '"Tik yuruvchi odam"'],
        "explanation": "«Ishbilarmon odam» (Homo habilis) yoshi taxminan 2 mln yil.",
    },
    {
        "q": "Qaysi odam chaqmoq zarbidan chiqgan tabiiy olovdan foydalanishni, turli tosh qurollarni yasashni bilgan?",
        "options": ['"Ishbilarmon odam"', "Neandertal", "Kromanyon", '"Tik yuruvchi odam"'],
        "explanation": "«Tik yuruvchi odam» (Homo erectus) olovdan foydalanishni bilgan.",
    },
    {
        "q": "O'rta Osiyodan toshdan yasalgan mehnat qurollari qayerdan topilgan?",
        "options": ["Seleng'ur, Ko'lbuloq", "Samarqand, Farg'ona", "Toshkent, Suxondaryo", "Buxoro, Samarqand"],
        "explanation": "Tosh mehnat qurollari Seleng'ur va Ko'lbuloqdan topilgan.",
    },
    {
        "q": "Teshiktosh g'ori qaysi tosh davriga oid yodgorlik?",
        "options": ["Mezolit", "O'rta poleolit", "Neolit", "So'ngi poleolit"],
        "explanation": "Teshiktosh g'ori o'rta poleolit davriga oid.",
    },
    {
        "q": "Teshiktosh g'oridan qanday bola suyak qoldiqlari topilgan?",
        "options": ["Neandertal", "Kromanyon", "Sinantrop", "Pitekantrop"],
        "explanation": "Teshiktosh g'oridan neandertal bola suyak qoldiqlari topilgan.",
    },
    {
        "q": "Lasko g'ori qaysi davlatda joylashgan?",
        "options": ["Italiya", "Boshqirdiston", "Fransiya", "Ispaniya"],
        "explanation": "Lasko g'ori Fransiyada joylashgan.",
    },
    {
        "q": "Qaysi g'ordagi suratlar arxeologning qizi tomonidan topilgan?",
        "options": ["Lasko", "Teshiktosh", "Altamira", "Kapovaya"],
        "explanation": "Altamira g'oridagi suratlar arxeologning qizi tomonidan topilgan.",
    },
    {
        "q": "Samarqand, Toshkent, Farg'onadan qaysi davrga oid yodgorliklar topilgan?",
        "options": ["Mezolit", "O'rta poleolit", "Neolit", "So'ngi poleolit"],
        "explanation": "Bu hududlardan so'ngi poleolit davriga oid yodgorliklar topilgan.",
    },
    {
        "q": "So'ngi poleolit davriga oid bo'lmagan ma'lumotni toping?",
        "options": [
            "Urug' jamoalariga birlashdilar",
            "Kromanyon odam yashagan",
            "Turar joylar qurishni o'rgandilar",
            "Kulolchilik o'choqlaridan foydalanishni boshladilar",
        ],
        "explanation": "Kulolchilik o'choqlari neolit davriga xos, so'ngi poleolitga emas.",
    },
    {
        "q": "Obishir, Qo'shilish, Machay qaysi davrga oid yodgorliklar?",
        "options": ["Mezolit", "O'rta poleolit", "Neolit", "So'ngi poleolit"],
        "explanation": "Obishir, Qo'shilish, Machay mezolit davriga oid yodgorliklar.",
    },
    {
        "q": "Odamlar ibtidoiy ziroatchilik va chorvachilik bilan qaysi davrdan boshlab shug'ullana boshladilar? Sharqning turli hududlarida ziroatchilik va chorvachilikka qaysi davrdan o'tilgan?",
        "options": ["Mezolit, neolit", "O'rta poleolit, mezolit", "Neolit, bronza", "Neolit, eneolit"],
        "explanation": "Ziroatchilik mezolitdan boshlangan, Sharq hududlarida neolitda rivojlangan.",
    },
    {
        "q": "Qaysi davrning boshlanishi sopol idishlar yasashning kashf etilishi bilan belgilanadi?",
        "options": ["Mezolit", "Neolit", "Bronza", "Eneolit"],
        "explanation": "Neolit davri sopol idishlar yasash bilan boshlanadi.",
    },
    {
        "q": "Mikrolitlar qaysi davrda yasash boshlangan?",
        "options": ["Mezolit, neolit", "O'rta poleolit, mezolit", "Neolit, bronza", "Neolit, eneolit"],
        "explanation": "Mikrolitlar mezolit va neolit davrlarida yasalgan.",
    },
    {
        "q": "Neolit davrining muhim kashfiyoti?",
        "options": [
            "Kulolchilik charxi va g'ildirak",
            "Misdan foydalanish",
            "Ko'p xonali uylar qurilishi",
            "Kulolchilik va to'quvchilik",
        ],
        "explanation": "Neolitning muhim kashfiyoti — kulolchilik va to'quvchilik.",
    },
    {
        "q": "Qachondan boshlab sopol idishlar hayvon va qushlarning tasvirlari bilan bezatila boshladi?",
        "options": ["Mezolit", "Neolit", "Bronza", "Eneolit"],
        "explanation": "Sopol idishlarni hayvon va qush tasvirlari bilan bezash eneolit davrida boshlangan.",
    },
    {
        "q": "Neolit davrining eng buyuk kashfiyotlaridan biri bu?",
        "options": [
            "Kulolchilik charxi va g'ildirak",
            "Misdan foydalanish",
            "Ko'p xonali uylar qurilishi",
            "Kulolchilik va to'quvchilik",
        ],
        "explanation": "Neolitning eng buyuk kashfiyotlaridan biri — kulolchilik va to'quvchilik.",
    },
    {
        "q": "Bronza davriga oid yodgorliklar?",
        "options": [
            "Ko'lbuloq, Teshiktosh",
            "Zamonbobo, Jarqo'ton",
            "Obishir, Qo'shilish, Machay",
            "Altamira, Lasko",
        ],
        "explanation": "Zamonbobo va Jarqo'ton bronza davriga oid yodgorliklar.",
    },
]

LEARN = {
    "title": "Nazorat ishi - 1: O'rta Osiyo qadimiy tarixi",
    "intro": "Ushbu material nazorat ishiga tayyorgarlik uchun. Manbalar, tosh davri, qadimgi odamlar va O'rta Osiyo yodgorliklari haqida o'rganing.",
    "sections": [
        {
            "heading": "Tarixiy manbalar",
            "text": "«Avesto» — O'rta Osiyo tarixi bo'yicha eng qadimgi manba. Strabonning «Geografiya» asarida ko'plab xalqlar haqida ma'lumot bor. Gerodotning «Tarix» asarida yurtimizning qadimgi tarixi haqida muhim ma'lumotlar berilgan. Behistun qoyasidagi yozuvlar ham muhim manba hisoblanadi.",
        },
        {
            "heading": "Fanlar",
            "text": "Arxeolog — qadimiy yodgorliklarni o'rganadi. Etnograf — hozir yashayotgan qabila va elatlarning urf-odatlarini o'rganadi. Antropolog — odam va jamiyatni o'rganadi. Strabon miloddan avvalgi I asrda yashagan yunon olimi.",
        },
        {
            "heading": "Qadimgi odamlar va tosh davri",
            "text": "Eng qadimgi suyak qoldiqlari Sharqiy Afrikadan topilgan. «Ishbilarmon odam» yoshi ~2 mln yil. «Tik yuruvchi odam» olovdan foydalanishni bilgan. O'rta tosh davri — mezolit. Neolit — sopol idishlar davri.",
        },
        {
            "heading": "O'rta Osiyo yodgorliklari",
            "text": "Seleng'ur, Ko'lbuloq — tosh qurollar. Teshiktosh — o'rta poleolit, neandertal bola suyagi. Obishir, Qo'shilish, Machay — mezolit. Zamonbobo, Jarqo'ton — bronza davri. Samarqand, Toshkent, Farg'ona — so'ngi poleolit yodgorliklari.",
        },
        {
            "heading": "Jahon yodgorliklari",
            "text": "Lasko g'ori Fransiyada. Altamira g'oridagi suratlar arxeolog qizining kashfiyoti. So'ngi poleolitda kromanyon odam yashagan, urug' jamoalariga birlashgan. Kulolchilik o'choqlari neolitga xos.",
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
                "id": f"nazorat1-{i + 1}",
                "q": q["q"],
                "options": q["options"],
                "correct": correct,
                "explanation": q["explanation"],
            }
        )

    data["categories"]["nazorat1"] = {
        "title": "Nazorat ishi - 1",
        "icon": "📝",
        "singleMode": True,
        "defaultDifficulty": "test",
        "questionsPerQuiz": 25,
        "learn": {"test": LEARN},
        "questions": {"test": questions},
    }

    if "test" not in data["difficulties"]:
        data["difficulties"]["test"] = "Nazorat"

    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Added nazorat1 with {len(questions)} questions")


if __name__ == "__main__":
    main()
