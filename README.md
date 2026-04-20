# Korbanos Calculator

**A modern-day price calculator for the sacrificial offerings of the Beis HaMikdash.**

Built by Jeremy Spier and Morris Massel, with significant assistance from Claude (Anthropic's AI).

---

## What This Is

The Korbanos Calculator answers a simple but surprisingly complex question: *what would it cost to bring the korbanos today?*

All prices are based on current Jerusalem market rates (Q1 2026), converted to USD at the live NIS/USD exchange rate. The app covers every category of offering — daily communal korbanos, festival musafim, individual life-event obligations, and the full annual personal bill for someone making aliyah to Yerushalayim.

This is an educational tool only. Nothing here should be relied upon for any halachic decision. All halachic questions must be directed to a qualified posek.

---

## Features

### My Annual Bill
A personalized cost estimator. Configure your situation and see what your total annual obligation would look like:

- **Strictness level** — Choose between standard, machmir (stringent), or meikil (lenient) profiles, which affect how many voluntary and obligatory korbanos are assumed.
- **Financial standing** — Average or wealthy (Ashir), which affects the grade of animal for re'iyah and chagigah.
- **Regalim attendance** — Toggle which of the three pilgrimage festivals (Pesach, Shavuos, Sukkos) you attend, which drives both offering obligations and travel costs.
- **Life events** — Adjust quantities for offerings tied to life events: childbirth (yoledet), Nazirite vows, chatas and asham obligations, chatzi shekel, pidyon haben, bikkurim, and more.
- **Travel assumptions** — Configure flight cost per person, nightly hotel rate, number of additional family members traveling, and nights per festival. Travel can be toggled in or out of the total.

### Communal Budget
Shows the full annual cost of all public korbanos funded by the chatzi shekel — the Tamid, all musafim, Yom Kippur service, Sukkos' 70 bulls, and more — and divides by the assumed Jewish population (600,000) to show a per-capita share.

### Full Catalog
Browse every offering in the database by category (Daily & Weekly, Pilgrimage Festivals, Individual Offerings). Adjust quantities with +/− controls to build a custom total. Each entry shows its Hebrew name, source pasuk, description, and component breakdown (animals, flour, oil, wine, frankincense, wood).

### Prices & Sources
Full transparency on every price used. Each commodity lists:
- The base NIS price
- The shiur-adjusted price (for agricultural items)
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

Livestock prices are not affected by the shiur. Only flour, oil, and wine scale.

### USD / NIS Exchange Rate
Fetched live from the web on load. Can be overridden manually in the settings strip. All NIS prices are sourced from Israeli markets; USD conversion is applied on top.

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
| Wood | 45 | Jerusalem lumber market (per offering) |
| Salt | 2 | Israeli commodity pricing |

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
