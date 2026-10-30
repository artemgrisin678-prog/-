#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Сборка Excel-таблицы конкурентов по продаже СОЖ для металлообработки.
Данные собраны через гугл-выдачу (web search) 2026-10-30."""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()

# ---------- Стили ----------
HEADER_FILL = PatternFill("solid", fgColor="1F4E78")
HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
TITLE_FONT = Font(bold=True, size=14, color="1F4E78")
PROD_FILL = PatternFill("solid", fgColor="E2EFDA")   # производители
DIST_FILL = PatternFill("solid", fgColor="DDEBF7")   # дистрибьюторы
RETAIL_FILL = PatternFill("solid", fgColor="FCE4D6") # розница
thin = Side(style="thin", color="BFBFBF")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")
WRAP_CENTER = Alignment(wrap_text=True, vertical="center", horizontal="center")

# ============================================================
# Лист 1: Конкуренты
# ============================================================
ws = wb.active
ws.title = "Конкуренты"

ws["A1"] = "Конкуренты по продаже СОЖ для металлообработки"
ws["A1"].font = TITLE_FONT
ws.merge_cells("A1:G1")
ws["A2"] = "Источник: гугл-выдача (web search), собрано 2026-10-30. Эталон: argentum-group.ru"
ws["A2"].font = Font(italic=True, size=9, color="808080")
ws.merge_cells("A2:G2")

headers = ["№", "Компания", "Сайт", "Тип игрока", "Продукция / марки СОЖ", "Регион", "Примечания"]
hrow = 4
for c, h in enumerate(headers, start=1):
    cell = ws.cell(row=hrow, column=c, value=h)
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = WRAP_CENTER
    cell.border = BORDER

# (компания, сайт, тип, продукция, регион, примечания, категория)
rows = [
    # --- Производители ---
    ("Техносож", "techno-sozh.ru", "Производитель",
     "Запатентованные СОЖ, концентраты, эмульсолы; разделительные эмульсолы для опалубки/форм ЖБИ; СОЖ «Синапол» (совм. с ИНЭОС РАН)",
     "Москва", "С 2002 г., собственная база. Качество подтверждено экспертным заключением Минобороны РФ", "prod"),
    ("ПКФ РУСМА", "rusma-spb.ru", "Производитель",
     "Эмульсолы, полусинтетика, синтетика: РУСМА Т-57 (водосмеш., 3–12%), РУСМА-Укринол 50",
     "Санкт-Петербург", "Т-57 — для сверления, точения, шлифования; биостабильность, антикоррозия, низкое пенообразование", "prod"),
    ("Олеокам", "oleokam.ru", "Производитель",
     "СОЖ (полный цикл производства)",
     "РФ", "Позиционируется как один из лидеров производства СОЖ в России", "prod"),
    ("Симэкс-Хим", "simex-chem.ru", "Производитель",
     "СОЖ МР-1У, МР-7, эмульсол Т, эмульсол ЭГТ",
     "РФ", "Российский производитель, прямой каталог СОЖ", "prod"),
    ("Завод технической химии", "sozh21.ru", "Производитель",
     "Концентрат «Вента», полусинтетический эмульсол «Вента М1», закалочные жидкости",
     "Чувашия", "Профильный завод теххимии", "prod"),
    ("Аналитик-Хим", "productcenter.ru (карточка)", "Производитель",
     "Эмульсол ПМ-14, Эмульсол СП-4",
     "РФ", "Опт по запросу («цена договорная»)", "prod"),
    ("Авикс Групп", "fabricators.ru (каталог)", "Производитель",
     "СОЖ",
     "Дзержинск", "Указан в каталоге производителей СОЖ", "prod"),
    ("Савалт Индастриал", "fabricators.ru (каталог)", "Производитель",
     "СОЖ",
     "РФ", "Указан в каталоге производителей СОЖ", "prod"),
    ("НТК Нордоил", "fabricators.ru (каталог)", "Производитель",
     "СОЖ, смазочные материалы",
     "РФ", "Указан в каталоге производителей СОЖ", "prod"),
    ("Машпромсм", "fabricators.ru (каталог)", "Производитель",
     "СОЖ серии «Константа-5»",
     "РФ", "Указан в каталоге производителей СОЖ", "prod"),
    # --- Дистрибьюторы / торговые компании ---
    ("AIMOL", "aimol.ru", "Дистрибьютор / бренд",
     "СОЖ + индустриальные масла, импортные линейки",
     "РФ", "Модель, близкая к argentum-group (торговля ассортиментом брендов)", "dist"),
    ("Divinol Rus", "divinolrus.ru", "Дистрибьютор / бренд",
     "СОЖ, индустриальные масла, промышленные смазки",
     "РФ", "Немецкий бренд Divinol, продажи в РФ", "dist"),
    ("Amertend", "amertend.ru", "Дистрибьютор",
     "Индустриальные масла и смазки (в т.ч. СОЖ)",
     "РФ", "Широкий ассортимент индустриальной химии", "dist"),
    ("Transoil Group", "transoil-group.com", "Дистрибьютор",
     "Смазочные материалы для машиностроения, СОЖ",
     "РФ", "Поставки смазочных материалов для промышленности", "dist"),
    ("«Прикамье»", "prikamie.ru", "Дистрибьютор / производитель",
     "Широкий ассортимент продукции, включая СОЖ",
     "РФ (Пермский край)", "Промышленная химия и смазочные материалы", "dist"),
    # --- Розница / маркетплейсы ---
    ("ВсеИнструменты.ру", "vseinstrumenti.ru", "Розница / маркетплейс",
     "Debever SafeCut, Karnasch Mecutoil, Liksir MW Drill Cut, РУСМА Т-57 и др.",
     "РФ", "Крупная розница с ценами и остатками — удобно смотреть цены конкурентных брендов", "retail"),
    ("Mobil (Mobil Industrial)", "mobil.com/ru-ru", "Импортный бренд",
     "Серия Mobilcut (водосмешиваемые СОЖ): Mobilcut 140, Mobilcut 250 (для алюминия)",
     "РФ / мир", "Глобальный бренд, представлен на рынке РФ", "retail"),
    ("Blaser Swisslube", "blaser.com", "Импортный бренд",
     "Blasocut (напр. BC 25 MD), Synergy и др.",
     "Швейцария / РФ", "Премиальный импорт, часто как эталон качества", "retail"),
    ("Castrol", "castrol.com", "Импортный бренд",
     "Hysol (напр. Hysol MB 50) и др. металлообрабатывающие СОЖ",
     "мир / РФ", "Глобальный бренд", "retail"),
    ("Rhenus Lube", "rhenuslub.de", "Импортный бренд",
     "СОЖ для металлообработки",
     "Германия", "Импорт; в РФ через дистрибьюторов", "retail"),
    ("Debever Machining Solutions", "debever (через vseinstrumenti)", "Бренд",
     "Концентрат СОЖ SafeCut (DB-SS300H)",
     "РФ", "Продаётся в рознице; позиционируется как замена Blaser 2000uni", "retail"),
]

r = hrow + 1
for i, (name, site, typ, prod, region, note, cat) in enumerate(rows, start=1):
    fill = PROD_FILL if cat == "prod" else DIST_FILL if cat == "dist" else RETAIL_FILL
    values = [i, name, site, typ, prod, region, note]
    for c, v in enumerate(values, start=1):
        cell = ws.cell(row=r, column=c, value=v)
        cell.alignment = WRAP
        cell.border = BORDER
        cell.fill = fill
    r += 1

# ширины колонок
widths = [5, 24, 26, 22, 48, 20, 42]
for c, w in enumerate(widths, start=1):
    ws.column_dimensions[get_column_letter(c)].width = w

ws.freeze_panes = "A5"
ws.row_dimensions[1].height = 22

# легенда
lr = r + 1
ws.cell(row=lr, column=2, value="Легенда:").font = Font(bold=True)
leg = [("Производитель СОЖ (прямой конкурент-завод)", PROD_FILL),
       ("Дистрибьютор / торговая компания (ближе к вашей модели)", DIST_FILL),
       ("Розница / импортные бренды", RETAIL_FILL)]
for k, (txt, fill) in enumerate(leg):
    cc = ws.cell(row=lr + 1 + k, column=2, value=txt)
    cc.fill = fill
    cc.border = BORDER

# ============================================================
# Лист 2: Источники
# ============================================================
ws2 = wb.create_sheet("Источники")
ws2["A1"] = "Источники (гугл-выдача)"
ws2["A1"].font = TITLE_FONT
src_headers = ["Компания / тема", "Ссылка"]
for c, h in enumerate(src_headers, start=1):
    cell = ws2.cell(row=3, column=c, value=h)
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.border = BORDER
sources = [
    ("Техносож", "https://techno-sozh.ru/"),
    ("ПКФ РУСМА (каталог СОЖ)", "https://rusma-spb.ru/catalog/sozh-i-emulsoly/"),
    ("РУСМА Т-57 (карточка)", "https://www.vseinstrumenti.ru/product/smazochno-ohlazhdayuschaya-zhidkost-rusma-t57-1-l-rusma-15-2779436/"),
    ("Олеокам", "https://oleokam.ru/"),
    ("Симэкс-Хим (СОЖ)", "https://simex-chem.ru/katalog/smazochno-oxlazhdayushhie-zhidkosti-(sozh)/"),
    ("Завод технической химии", "https://sozh21.ru/"),
    ("Каталог производителей СОЖ (fabricators.ru)", "https://fabricators.ru/produkt/smazochno-ohlazhdayushchie-zhidkosti"),
    ("Аналитик-Хим (Эмульсол ПМ-14)", "https://productcenter.ru/products/112090/emulsol-pm-14"),
    ("AIMOL (СОЖ)", "https://aimol.ru/products/soj/"),
    ("Divinol Rus", "https://divinolrus.ru/sozh-industrialnye-masla-i-smazki/"),
    ("Amertend", "https://amertend.ru/"),
    ("Transoil Group (машиностроение)", "https://transoil-group.com/masla_mashinostroenie"),
    ("Прикамье", "https://www.prikamie.ru/products/"),
    ("Debever SafeCut (vseinstrumenti)", "https://www.vseinstrumenti.ru/product/kontsentrat-sozh-safecut-20-kg-debever-db-ss300h-2207564/"),
    ("Mobilcut (Mobil)", "https://www.mobil.com/ru-ru/industrial/pds/eu-xx-mobilcut-series"),
]
rr = 4
for name, url in sources:
    ws2.cell(row=rr, column=1, value=name).border = BORDER
    lc = ws2.cell(row=rr, column=2, value=url)
    lc.hyperlink = url
    lc.font = Font(color="0563C1", underline="single")
    lc.border = BORDER
    rr += 1
ws2.column_dimensions["A"].width = 44
ws2.column_dimensions["B"].width = 80

# ============================================================
# Лист 3: Примечания / методология
# ============================================================
ws3 = wb.create_sheet("Примечания")
notes = [
    ("Методология и ограничения", True),
    ("", False),
    ("• Данные собраны ТОЛЬКО через гугл-выдачу (web search) 30.10.2026, как было запрошено.", False),
    ("• Прямой парсинг сайтов невозможен: в облачной сессии заблокирован сетевой доступ", False),
    ("  к argentum-group.ru и ко всем сайтам конкурентов (techno-sozh.ru, rusma-spb.ru,", False),
    ("  simex-chem.ru и др. — ошибка ENOTFOUND / домен вне разрешённых).", False),
    ("• Чтобы собрать ассортимент/цены/бренды прямо со страниц, нужно добавить домены", False),
    ("  в Network access настроек окружения (меню облачного окружения → Edit → Allowed domains).", False),
    ("• Сам сайт argentum-group.ru в гугл-выдаче по названию не находится — профиль компании", False),
    ("  взят из задания пользователя (СОЖ для металлообработки), а не с сайта.", False),
    ("• Инструмент web search ориентирован на США, поэтому российские карточки товаров и", False),
    ("  каталоги приходят частично — список конкурентов неполный, его стоит расширять.", False),
    ("• Каталог fabricators.ru заявляет ~24 производителя, но содержит нерелевантные компании —", False),
    ("  список отфильтрован вручную.", False),
]
for i, (txt, bold) in enumerate(notes, start=1):
    c = ws3.cell(row=i, column=1, value=txt)
    if bold:
        c.font = TITLE_FONT
    else:
        c.font = Font(size=10)
ws3.column_dimensions["A"].width = 95

out = "/home/user/-/Конкуренты_СОЖ_металлообработка.xlsx"
wb.save(out)
print("saved:", out)
