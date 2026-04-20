# Korbanos Calculator

**A modern-day price calculator for the sacrificial offerings of the Beis HaMikdash.**

Built by Jeremy Spier and Morris Massel, with significant assistance from Claude (Anthropic's AI).

---

## What This Is

The Korbanos Calculator answers a simple but surprisingly complex question: *what would it cost to bring the korbanos today?*

All prices are based on current Jerusalem market rates (Q1 2026), converted to USD at the live NIS/USD exchange rate. The app covers every category of offering — daily communal korbanos, festival musafim, individual life-event obligations, and the full annual personal bill for someone making aliyah to Yerushalayim.

This is an educational tool only. Nothing here should be relied upon for any halachic decision. All halachic questions must be directed to a qualified posek.

---

## Acknowledgments

We are grateful to **Rav Chaim Finkel, shlita**, for his general comments. It goes without saying that no responsibility for any of the ideas, assumptions, calculations, or conclusions herein is his. All errors and oversimplifications are entirely our own.

---

## Version History

### V2 (April 2026)

**New individual offerings:**
- **Shalmei Simcha** — Added as a distinct Fixed Obligation for each regel attended. The Torah obligation of simcha (Devarim 27:7) is separate from the chagigah; both are required and neither fulfills the other. Scales automatically with regalim attendance.
- **Chagigat 14 Nisan** — The supplementary shelamim brought on Erev Pesach so that the Korban Pesach is eaten *al hasova* (on satiety). Source: Pesachim 70a–71a; Rambam Hilchos Korban Pesach 10:12. Automatically tied to Pesach attendance.

**New communal offerings:**
- **Ketores** — Added as a standalone communal line item. Priced as a composite calculation across all 11 spices (Kerisos 6a): 368 maneh annually (~184kg), dominated by saffron (16 maneh at ~NIS 50/g wholesale, accounting for over half the annual cost). Total ~NIS 782,000/year ÷ 730 offerings = ~NIS 1,072 per offering. Previously the Tamid entry included a frankincense placeholder; ketores now has its own accurate pricing.
- **Menorah oil** — Added as a standalone communal line item. Pure first-pressing olive oil, ~3.5 log daily for the seven-branched menorah (Menachos 89a).

**Pricing corrections:**
- **Chatzi shekel** — Corrected weight from 10g (a common approximation) to 9.6g per R' Naeh (shekel hakodesh = 19.2g = 320 barley grains; Rambam Hilchos Shekalim 1:2). Silver price updated from stale $0.97/gram to live spot price (fetched via XAG rate on load).
- **Pidyon haben** — Corrected to 96g silver (5 × 19.2g per R' Naeh) from the rounded 100g figure.
- **Silver price** — Now fetched live alongside the NIS/USD rate. Displays $/troy oz in the settings strip and is fully editable in the Assumptions panel.
- **Ketores** — Replaced frankincense-only placeholder with a proper 11-spice composite price. Marked as FIXED FORMULA in the Prices & Sources tab (not shiur-dependent).

**Todah improvements:**
- Baseline set to 2 (illness, other travel, general *hashgacha pratis*).
- Travel-related todaos (2 per regel) are now opt-in via a checkbox rather than automatically added.
- Manual +/− spinner allows free adjustment at any time.
- "Reset to auto" link restores the calculated total.

**Settings panel:**
- Silver price section added between Exchange Rate and Financial Standing, matching the same design as the NIS rate control. Shows live $/troy oz with Refresh button, status indicator, and a live preview of chatzi shekel and pidyon haben prices.
- Silver price shown in the collapsed settings strip summary alongside the NIS rate.

**Terminology:**
- "Ketoret" corrected to "Ketores" throughout.

### V1 (March 2026)

Initial release.

---

## Features

### My Annual Bill
A personalized cost estimator. Configure your situation and see what your total annual obligation would look like:

- **Strictness level** — A five-point slider from Minimally Observant to Exceptional Scrutiny, which sets the assumed number of chatas and asham toluy obligations. Adjustable freely with +/− after.
- **Financial standing** — Average or Wealthy (Ashir), which affects the grade of animal for olas re'iyah and chagigah.
- **Regalim attendance** — Toggle which of the three pilgrimage festivals (Pesach, Shavuos, Sukkos) you attend, which drives offering obligations, travel costs, and todah count.
- **Life events** — Adjust quantities for offerings tied to life events: yoledet, Nazirite vows, chatas, asham taluy, chatzi shekel, pidyon haben, bikkurim, and more.
- **Travel assumptions** — Configure flight cost per person, nightly hotel rate, number of additional family members, and nights per festival. Travel can be toggled in or out of the total.
- **Todah** — Baseline of 2, with optional travel component (+2 per regel) via checkbox. Fully adjustable.

### Communal Budget
Shows the full annual cost of all public korbanos funded by the chatzi shekel — the Tamid, Ketores, Menorah oil, all musafim, Yom Kippur service, Sukkos' 70 bulls, and more — and divides by the assumed population (600,000 adult males) to show a per-capita share.

### Full Catalog
Browse every offering in the database by category (Daily & Weekly, Pilgrimage Festivals, Individual Offerings). Adjust quantities with +/− controls to build a custom total. Each entry shows its Hebrew name, source pasuk, description, and component breakdown (animals, flour, oil, wine, ketores, wood).

### Prices & Sources
Full transparency on every price used. Each commodity lists:
- The base NIS price
- The shiur-adjusted price (for agricultural items); fixed-formula items (ketores, frankincense, wood, salt) are marked accordingly
- The source (market, vendor, or exchange)
- Notes on why that price is appropriate for Mikdash use

---

## Key Inputs and Settings

### Shiur (Halachic Measurement Standard)
Agricultural quantities — flour (issaron), oil (log), wine (log) — depend on the halachic opinion used for volumetric measurement. The calculator supports four positions:

| Opinion | Beitzah | Log | Issaron | Multiplier |
|---|---|---|---|---|
| R' Naeh *(default)* | 50 ml | 300 ml | 2.4 L / ~2.4 kg | 1.0× |
| R' Moshe Feinstein | 57 ml | 342 ml | 2.74 L / ~2.74 kg | 1.14× |
| Rambam (R' Kafih) | 75 ml | 450 ml | 3.6 L / ~3.6 kg | 1.5× |
| Chazon Ish | 100 ml | 600 ml | 4.8 L / ~4.8 kg | 2.0× |

Livestock prices are not affected by the shiur. Only flour, oil, and wine scale. Ketores and other fixed-formula items are also unaffected.

### USD / NIS Exchange Rate
Fetched live from the web on load. Can be overridden manually in the Assumptions panel. All NIS prices are sourced from Israeli markets; USD conversion is applied on top.

### Silver Price
Fetched live (XAG spot rate) on load. Displayed as $/troy oz; stored internally as $/gram. Affects chatzi shekel (9.6g per R' Naeh) and pidyon haben (96g). Can be overridden manually in the Assumptions panel.

### Financial Tier
Affects which animals are brought for olas re'iyah and chagigah:
- **Average** — Lamb for re'iyah, ram for chagigah
- **Wealthy (Ashir)** — Ram for re'iyah, bull for chagigah

---

## Commodity Prices (Jerusalem, Q1 2026)

| Item | Base NIS | Source |
|---|---|---|
| Bull | 9,000 | Central Cattle Market, Moshav Beit Dagan |
| Ram | 1,200 | Central Sheep & Goat Market |
| Lamb | 700 | Central Sheep & Goat Market |
| Goat | 650 | Central Sheep & Goat Market |
| Bird (squab) | 30 | Israeli poultry wholesale |
| Issaron flour | 18 | Osem / Sugat retail (per R' Naeh baseline) |
| Log olive oil | 12 | Galilee domestic EVOO |
| Log wine | 15 | Golan Heights / Carmel table wine |
| Frankincense | 25 | Machane Yehuda spice market (Omani) |
| Ketores (per offering) | 1,072 | Composite — 11 spices per Kerisos 6a |
| Wood | 45 | Jerusalem lumber market (per offering) |
| Salt | 2 | Israeli commodity pricing |
| Silver | live | XAG spot rate ($/troy oz, fetched on load) |

---

## Tech Stack

- **React** (TypeScript) — single-component application
- **Vite** — build tooling
- **Cloudflare Pages** — hosting and deployment via GitHub
- No external UI libraries; all styling is inline CSS

---

## How It Was Built

This project was conceived and directed by Jeremy Spier and Morris Massel. The application — including the halachic research, commodity pricing, offering catalog, and all code — was built with significant assistance from **Claude** (claude.ai), Anthropic's AI. Claude authored the React component, structured the offering database, sourced and cross-referenced the Jerusalem market prices, and implemented the shiur conversion logic. Iterative refinement, editorial decisions, and halachic framing were provided by the human collaborators.

---

## Disclaimer

For educational purposes only. Do not rely on anything here for any halachic decision whatsoever. The violation examples, korban obligations, shiur conversions, and price estimates have not been reviewed by any rabbinic authority and may contain errors, oversimplifications, or outright mistakes. All halachic questions must be addressed to a qualified posek.
