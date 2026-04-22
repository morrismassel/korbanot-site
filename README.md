# Korbanos Calculator

**A modern-day price calculator for the sacrificial offerings of the Beis HaMikdash.**

Built by Jeremy Spier and Morris Massel with a lot of help from Claude.ai.

---

## What This Is

The Korbanos Calculator answers a simple but surprisingly complex question: *what would it cost to bring the korbanos today?*

All prices are based on current Jerusalem market rates (Q1–Q2 2026), converted to USD at the live NIS/USD exchange rate. The app covers every category of offering — daily communal korbanos, festival musafim, individual life-event obligations, and the full annual personal bill for someone making aliyah l'regel to Yerushalayim.

This is an educational tool only. Nothing here should be relied upon for any halachic decision. All halachic questions must be directed to a qualified posek.

---

## The Story Behind Korbanos Calculator

One Shabbos afternoon, Jeremy Spier had a thought: wouldn't it be interesting to know what it would actually cost to bring korbanos today? That evening he opened Claude and started building. Meir Bar-David contributed early input and encouragement, and a working prototype took shape.

At yet another one of their sons' hockey games the next day, Spier showed the idea to Morris Massel. Massel ran with it — adding live market prices, shiur opinions, communal budgets, a full offering catalog, and considerably more than either of them originally planned.

They launched korbancalculator.com.

Within 24 hours the response was remarkable. It spread through Torah communities in the US and Israel. Rabbis and educators started using it in shiurim.

The boys lost the hockey game but a small contribution was made to Klal Yisroel.

*Morris Massel and Jeremy Spier*

---

## Acknowledgments

We are grateful to **Rav Chaim Finkel, shlita**, for his general comments on this project. No responsibility for any of the ideas, assumptions, calculations, or conclusions herein is his. All errors and oversimplifications are entirely our own.

We thank **Alex Massel** for his insights on the Eretz Yisroel-specific obligations, which informed the EY residency feature and Bikkurim implementation.

We are grateful to **Dr. Miller, Meir Meisels, Avi Rother, Aviel Hanasab, Yitzchak Rabinowitz, Ezra Glass, and Baruch Gilinsky** for their comments, corrections, and encouragement throughout the development of this project.

We owe a special debt of gratitude to **Meir Bar-David**, whose assistance, consolation, and encouragement were invaluable at every stage of this project. This would not have been completed without him.

---

## Version History

### V4 (April 2026)

**Multi-language support:**
- Full interface now available in Hebrew (עברית), Spanish (Español), French (Français), and Russian (Русский) via an elegant dropdown in the header.
- RTL layout activates automatically for Hebrew.
- Language selection covers all UI labels, tab names, settings, category names, day labels, avodah block titles, disclaimer, and summary bar.
- Halachic rationale text and detailed notes remain in English; a note in the dropdown explains this.
- Translations produced by AI — users should be aware.

**Currency toggle:**
- New $ / ₪ toggle in the header. Switches all price displays between USD and NIS (₪) using the live exchange rate.
- In ₪ mode, the secondary NIS display line is hidden (redundant); the settings strip shows ₪1 = $X instead.

**Today's Communal Costs tab:**
- New tab showing the exact public korbanos for any Hebrew date, with running cost total.
- Defaults to today's Hebrew date. Navigate day by day with ‹/› arrows.
- Jump buttons organized by category: Regular (weekday/Shabbos/Rosh Chodesh), Pesach (all 7 days + Omer block on 16 Nisan), Sukkos (all 7 days with bull count noted + Shemini Atzeres), Shavuos, and Yamim Noraim.
- Three time-blocks per day: Shacharit (Tamid + Ketores + Menorah oil; Lechem HaPanim on Shabbos), Omer (own block on 16 Nisan), Mussaf (day-specific — Sukkos decreases 13→7 bulls, Yom Kippur split into communal mussaf + public goats, Shavuos with Shtei HaLechem), and Mincha/Afternoon Tamid.
- Overnight ma'arachah note at the bottom of every day.
- Pure JavaScript Hebrew calendar (no external library) — tested against known dates.

**Halachic correction — Solet repriced:**
- Issaron flour repriced from NIS 18 to NIS 28/kg, reflecting the correct identification of solet as semolina-grade wheat — coarsely ground and sifted, not fine flour.
- Source: Menachos 27a, Rashi s.v. Solet=Geres; Avos 5:15 (the best student retains the solet and lets the fine flour through).
- This correction meaningfully increases all flour-dependent calculations: Lechem HaPanim (24 issaron), Todah loaves (20 issaron), Shtei HaLechem, Nazir basket, and all nesachim libations.

**Shalmei Simcha:**
- Remains in Fixed Obligations (Rambam Hilchos Yom Tov 6:17 — the obligation of simcha for adult males is fulfilled specifically through shelamim).
- Now has a +/− spinner with "reset to auto" link. Defaults to 1 per regel attended; adjustable freely.
- Rationale updated to note the dispute: some hold that if the chagigah and re'iyah already provide sufficient meat, a separate shalmei simcha is not required. Consult your posek.
- No longer hard-locked like chagigah and re'iyah.

**Chagigat 14 Nisan — made adjustable:**
- Like Shalmei Simcha, this offering is not unconditional. It is only required when additional meat is needed so the Korban Pesach is eaten al hasova (on satiety). If other shelamim or food suffices, it is not needed (Rambam Hilchos Korban Pesach 10:12).
- Now has a +/− spinner with "reset to auto" link. Defaults to 1 when attending Pesach; set to 0 if not needed.
- No longer hard-locked.

**Rosh Hashana mussaf corrected:**
- 1 Tishrei is always Rosh Chodesh. The Today's Communal Costs tab now correctly shows three separate mussaf blocks on Rosh Hashana: Mussaf Shabbos (if applicable), Mussaf Rosh Hashana, and Mussaf Rosh Chodesh Tishrei. Note explaining the *musfei* custom in davening included.

**Chatas violation examples revised:**
- Removed halachically incorrect examples (lemon squeezing = d'rabbanan; elevator yichud = d'rabbanan; physical contact with niddah alone = no korban).
- Added four missing kareis categories: chelev, chametz on Pesach, blood in a dish, bishul on Yom Kippur.
- Replaced electricity example (controversial) with lighting a candle (classic Mav'ir).
- Tightened niddah and arayos examples to clarify the halachic distinction: lo yada (didn't know her status changed) vs. ta'us (mistaken identity — classic Kerisus 2a case).
- Basar b'chalav example retained with honest note about the Rishonim dispute on whether eating carries kareis.

**Bug fix — Eretz Yisroel travel:**
- Travel costs were incorrectly included in the annual total even when "I live in Eretz Yisroel" was checked. Fixed: EY residents now correctly see $0 travel in their total and summary bar.

**Annual Communal Budget renamed:**
- Tab renamed from "Communal Budget" to "Annual Communal Budget" for clarity.

**Mussaf spelling:**
- Corrected to "Mussaf" (double s) throughout.

---

### V3 (April 2026)

**Eretz Yisroel residency:**
- "I live in Eretz Yisroel" checkbox removes travel costs and travel-related todaos from the annual total.
- "I own agricultural land in Eretz Yisroel" checkbox automatically activates Bikkurim.

**Bikkurim — tiered pricing:**
- Basket type scales with financial standing (Mishnah Bikkurim 3:8):
  - **Poor (Ani)** — straw basket (~$150)
  - **Average** — silver basket returned after use (~$450)
  - **Wealthy (Ashir)** — gold basket kept by the Kohen with doves (~$1,200)

**Silver weight now shiur-dependent:**
- Chatzi shekel and pidyon haben weights scale with the active shiur, exactly as flour, oil, and wine do.

**Ashir travel defaults:**
- Selecting Wealthy (Ashir) sets flight cost to $5,000/person and hotel to $1,000/night automatically.

---

### V2 (April 2026)

**New offerings:**
- Shalmei Simcha, Chagigat 14 Nisan, Ketores (11-spice composite per Kerisos 6a), Menorah oil.

**Pricing corrections:**
- Chatzi shekel corrected to 9.6g (R' Naeh); silver price now fetched live.
- Pidyon haben corrected to 96g.
- Ketores priced as a proper 11-spice composite (~NIS 1,072/offering).

**Todah improvements:**
- Baseline 2, travel component opt-in, manual spinner, reset-to-auto link.

---

### V1 (March 2026)

Initial release.

---

## Features

### My Annual Bill
A personalized cost estimator covering:
- **Fixed Obligations** — Korban Pesach, Olas Re'iyah, Chagigah, Shalmei Simcha, Chagigat 14 Nisan, Chatzi Shekel, Bikkurim — all scaling with regalim attendance, EY status, and financial standing.
- **Personal Violations** — Chataos and asham taluy, set by a five-point scrutiny slider.
- **Thanksgiving (Todah)** — Baseline 2, optional travel component.
- **Life Events** — Yoledet, nazir, metzora, oleh v'yored, pidyon haben, pesach sheni, and voluntary offerings.
- **Travel** — Round-trip flights and lodging for the regalim, configurable by family size and nights.

### Annual Communal Budget
Full annual cost of all public korbanos funded by the chatzi shekel. Shows total, per-capita cost, actual chatzi shekel value (shiur-adjusted), and per-person subsidy/surplus.

### Today's Communal Costs
Any Hebrew date's public avodah with full pricing. Jump to any Yom Tov, Shabbos, or Rosh Chodesh. Overnight ma'arachah noted.

### Full Catalog
Every offering by category with Hebrew names, sources, descriptions, and component breakdowns. +/− quantity controls with a running sticky total.

### Prices & Sources
Full price transparency: base NIS, shiur-adjusted price, source, and notes for every commodity.

---

## Key Settings

### Shiur (Halachic Measurement Standard)
Agricultural quantities and silver-weight obligations scale with the active shiur:

| Opinion | Beitzah | Log | Issaron | Chatzi Shekel | Multiplier |
|---|---|---|---|---|---|
| R' Naeh *(default)* | 50 ml | 300 ml | ~2.4 kg | 9.6g | 1.0× |
| R' Moshe Feinstein | 57 ml | 342 ml | ~2.74 kg | 10.9g | 1.14× |
| Rambam (R' Kafih) | 75 ml | 450 ml | ~3.6 kg | 14.4g | 1.5× |
| Chazon Ish | 100 ml | 600 ml | ~4.8 kg | 19.2g | 2.0× |

### USD / NIS Exchange Rate
Fetched live on load. Overridable manually.

### Silver Price
Fetched live (XAG spot). Affects chatzi shekel and pidyon haben. Weights scale with shiur.

### Financial Tier
Affects olas re'iyah and chagigah animal grade, Bikkurim basket, and travel defaults.

---

## Commodity Prices (Jerusalem, Q1–Q2 2026)

| Item | Base NIS | Notes |
|---|---|---|
| Bull | 9,000 | Central Cattle Market, Moshav Beit Dagan |
| Ram | 1,200 | Central Sheep & Goat Market |
| Lamb | 700 | Central Sheep & Goat Market |
| Goat | 650 | Central Sheep & Goat Market |
| Bird (squab) | 30 | Israeli poultry wholesale |
| Solet (issaron) | 28 | Semolina-grade wheat; Sugat/Osem semolina retail. Solet = coarsely ground, not fine flour (Menachos 27a, Rashi; Avos 5:15) |
| Log olive oil | 12 | Galilee domestic EVOO |
| Log wine | 15 | Golan Heights / Carmel table wine |
| Frankincense | 25 | Machane Yehuda spice market (Omani) |
| Ketores (per offering) | 1,072 | Composite — 11 spices per Kerisos 6a; saffron >50% of cost |
| Wood | 45 | Jerusalem lumber market (per offering) |
| Salt | 2 | Israeli commodity pricing |
| Silver | live | XAG spot rate, fetched on load |

---

## Tech Stack

- **React** (TypeScript) — single-component application
- **Vite** — build tooling
- **Cloudflare Pages** — hosting via GitHub auto-deploy
- Pure JavaScript Hebrew calendar (no npm packages)
- No external UI libraries; all styling is inline CSS

---

## How It Was Built

This project was conceived and directed by Jeremy Spier and Morris Massel. The application — including the halachic research, commodity pricing, offering catalog, multilingual interface, Hebrew calendar implementation, and all code — was built with a lot of help from **Claude** (claude.ai), Anthropic's AI.

---

## Disclaimer

For educational purposes only. Do not rely on anything here for any halachic decision whatsoever. The violation examples, korban obligations, shiur conversions, and price estimates have not been reviewed by any rabbinic authority and may contain errors, oversimplifications, or outright mistakes. All halachic questions must be addressed to a qualified posek.
