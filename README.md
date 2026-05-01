# KorbanCalculator · Naftoli Willner Collaborative Edition

**korbancalculator.com**

A modern-day price calculator for the korbanos of the Beis HaMikdash, built by Jeremy Spier and Morris Massel with Claude.ai.

---

## What This Is

KorbanCalculator answers a question that has never had a rigorous answer before: *what would it actually cost to fulfill your korban obligations today, in dollars, at current Jerusalem market prices?*

The calculator covers:

- **My Annual Bill** — your personal yearly korban obligations, scaled to financial standing (Ani, Beinoni, Ashir), gender, location (Eretz Yisrael / Chutz L'Aretz), and level of observance
- **Annual Communal Budget** — the total cost of all public korbanos funded by the chatzi shekel pool, with per-capita analysis
- **Today's Communal Costs** — what the Mikdash would spend today specifically, with full Hebrew calendar support and jump navigation
- **What Do I Bring?** — scenario tool for specific life situations (Nazir completion, Metzora purification, Yoledet, Pesach, voluntary olah, Nazir interrupted)
- **Full Catalog** — all 28 korban types with procedural detail, halachic classification, nesachim breakdown, and live pricing
- **Prices & Sources** — every price fully sourced and explained, with shiur-conversion math shown

Prices are based on Jerusalem wholesale market rates, converted live to USD at the current NIS/USD rate. Silver-weight obligations (chatzi shekel, pidyon haben) update against a live silver spot feed. Shiur selection (R' Naeh, R' Moshe Feinstein, Rambam, Chazon Ish) scales all volume-based prices proportionally.

---

## The Willner Collaboration

This version of KorbanCalculator represents a significant scholarly upgrade. The halachic taxonomy, procedural detail, and korban classification throughout this site were authored by **Naftoli Willner**, whose comprehensive spreadsheet analysis of all 116 korban-bearing occasions in the Torah forms the backbone of the catalog.

Naftoli's contribution covers:

- Complete halachic classification of all 116 entries from the Willner Spreadsheet ([bit.ly/korbonos](http://bit.ly/korbonos)), including korban type (olah, chatas, asham, shelamim, mixed), holiness level (Kodshei Kodashim vs. Kodshei Kalim), semichah requirements, and timing classification (fixed obligation vs. anytime)
- Procedural detail for each korban: slaughter location, blood application method, what goes to the altar / the Kohen / the owner / the bringer, and eating restrictions
- Nesachim breakdown by animal type (flour, oil, and wine quantities per issaron and hin, from Bamidbar 28–29)
- The gender of each animal (male/female/either), which is critical for pricing — the female lamb (כַּבְשָׂה/ewe) used for chataot is priced separately from the male lamb used for olot
- Distinction between the 14 poverty-tier bird substitutes and the standard animal offerings, enabling the sliding-scale financial tier logic

This work reflects an extraordinary depth of Talmudic and halachic scholarship and is offered לע"נ יהושע בן צבי ז"ל.

The halachic taxonomy has been reviewed by **R' Hillel Novetsky** and **Rabbi Yaakov Jaffe**.

---

## Halachic Scope and Coverage

Of the 116 korban-bearing occasions documented in Naftoli's spreadsheet:

| Status | Count |
|--------|-------|
| Fully priced in catalog | 28 |
| Priced via scenario tool or annual bill | ~20 |
| Priceable — pending implementation | ~40 |
| Genuinely unpriceable (Lechem HaPanim) | 1 |

The remaining ~40 entries include the 14 bird poverty-tier substitutes, the Kohen Gadol's personal YK offerings, the three distinct ashamot (shfichat charufa, meilah, gezeilot), voluntary mincha variants, and various flour offerings. These are on the implementation roadmap.

---

## Technical Notes

Built with React + TypeScript, deployed via Cloudflare Pages from [github.com/morrismassel/korbanos-site](https://github.com/morrismassel/korbanos-site). No backend — all computation happens in the browser. Live price feeds via:

- **NIS/USD rate**: Open Exchange Rates (primary) · Frankfurter (fallback)
- **Silver spot price**: fawazahmed0 currency API via jsDelivr CDN (primary) · Cloudflare Pages mirror (fallback)

The Hebrew calendar is implemented in pure JavaScript with no external library, covering leap years, deficient/complete year types, Rosh Hashana postponement rules (dechiyos), and correct Adar II handling.

---

## Known Limitations and Open Issues

**Halachic nuance still being refined:**

- **Shabbos violation examples** — eruv cases involving modern infrastructure are typically karmelis (d'rabbanan), not reshus harabim. The examples have been updated to reflect this, but edge cases remain.
- **Scrutiny slider** — the slider now correctly models that higher observance leads to *fewer* violations, not more. The Bava ben Buta standard (asham taluy daily) applies at the exceptional end.
- **Travel costs** — the travel section models today's diaspora reality (New York to Jerusalem round trip). In a Moshiach-era framework where populations are concentrated near Eretz Yisrael, these costs would be negligible or zero. Toggle travel off or set location to EY to reflect that scenario.
- **Lodging** — classical sources (Yoma 12a) suggest Jerusalem had a unique lodging status not governed by standard market pricing. The lodging estimate is included for completeness but should be understood as a modern approximation.

**Gender logic:** The calculator now supports female users. Women are exempt from re'iyah, chagigah, and shalmei simcha (most poskim). Machatzis hashekel is labeled voluntary for female users. Yoledet defaults to 1 for female users. Financial tier now correctly applies the poverty-tier bird substitute for yoledet (Vayikra 12:8).

---

## Disclaimer

For educational purposes only. Do not rely on anything here for any halachic decision. The violation examples, korban obligations, shiur conversions, and price estimates presented here have not been reviewed by any rabbinic authority and may contain errors, oversimplifications, or outright mistakes. All halachic questions must be addressed to a qualified posek.

---

## Credits

- **Halachic taxonomy and analysis**: Naftoli Willner · לע"נ יהושע בן צבי ז"ל · [bit.ly/korbonos](http://bit.ly/korbonos)
- **Reviewed by**: R' Hillel Novetsky · Rabbi Yaakov Jaffe
- **Built by**: Jeremy Spier and Morris Massel with Claude.ai
- **Contact**: info@korbancalculator.com
