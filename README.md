# Korbanos Calculator

**A modern-day price calculator for the sacrificial offerings of the Beis HaMikdash.**

Built by Morris Massel and Jeremy Spier with a lot of help from Claude.ai.

---

## What This Is

The Korbanos Calculator answers a simple but surprisingly complex question: *what would it cost to bring the korbanos today?*

All prices are based on current Jerusalem market rates (Q1–Q2 2026), converted to USD at the live NIS/USD exchange rate. The app covers every category of offering — daily communal korbanos, festival musafim, individual life-event obligations, and the full annual personal bill for someone making aliyah l'regel to Yerushalayim.

This is an educational tool only. Nothing here should be relied upon for any halachic decision. All halachic questions must be directed to a qualified posek.

---

## The Story Behind Korbanos Calculator

In case you did not sufficiently value the power of a long Shabbos afternoon, you should know this story.

Over Shabbos, Jeremy Spier had a deep and important shayla — l'maysa, wouldn't it be cool to know how much it costs to bring korbanos today? Was it divine inspiration that caused him to open Claude motzei Shabbos, or perhaps just enough cholent and l'chaims? Who knows — but he developed the perfect idea, received deep and meaningful input from Meir Bar-David, and coded a beautiful prototype.

At a hockey game the next day, Spier shared the idea with Morris Massel. Unable to control his enthusiasm, Massel carried forward the mesorah — building out more detail, live market prices, shiur opinions, communal budgets, and all kinds of other insanity.

They launched korbancalculator.com.

Within 24 hours, the reception was overwhelming. Lakewood Scoop featured the site on its WhatsApp status (bigger than the New York Times bestseller list). It stormed the olam.

Should you ever question whether important things happen at hockey games besides sportsmanship, competition, and performance — you now have your answer.

*B'simcha u'b'siyata d'shmeya,*  
*Morris Massel and Jeremy Spier*

---

## Acknowledgments

We are grateful to **Rav Chaim Finkel, shlita**, for his general comments on this project. No responsibility for any of the ideas, assumptions, calculations, or conclusions herein is his. All errors and oversimplifications are entirely our own.

We thank **Alex Massel** for his insights on the Eretz Yisroel-specific obligations, which informed the EY residency feature and Bikkurim implementation.

We are grateful to **Dr. Miller, Meir Meisels, Avi Rother, Aviel Hanasab, Yitzchak Rabinowitz, Ezra Glass, and Baruch Gilinsky** for their comments, corrections, and encouragement throughout the development of this project.

We owe a special debt of gratitude to **Meir Bar-David**, whose assistance, consolation, and encouragement were invaluable at every stage of this project. This would not have been completed without him.

---

## Version History

### V4.2 — Educational Depth Update (April 22, 2026)

#### Sefaria Links — Corrected and Comprehensive

All Sefaria URLs have been audited and corrected. Rambam links now use the proper Sefaria format (`Mishneh_Torah,_Shekalim.1.5` etc.) rather than the incorrect `%2C_Laws_of_` format used previously. Every one of the 18 annual offering entries and all 22 Full Catalog entries now carries a verified Sefaria link pointing to the primary pasuk or Rambam chapter. The Full Catalog source line renders as a live hyperlink. Measurement conversions each show their Talmudic source with a Sefaria link (Ephah → Menachos 77a, Issaron → Bamidbar 28:5, Hin → Menachos 88a, Log → Kerisos 5a, Komatz → Vayikra 2:2).

#### Inline Citation Hyperlinks

A `renderWithLinks()` function parses all rationale text at render time, detecting recognized citation patterns (35 citations mapped) and wrapping them in live `<a>` tags. When the Shalmei Simcha rationale says "(Rambam Hilchos Yom Tov 6:17)" or the Chatzi Shekel rationale cites "Rambam Hilchos Shekalim 1:2," those are blue clickable links opening the correct Sefaria page in a new tab. The same function is used for Did You Know? fact and source text.

#### Glossary Tooltips

16 halachic terms defined in a `GLOSSARY` object: *kareis, shogeg, b'shogeg, olah, shelamim, chatas, asham, nesachim, issaron, log, mussaf, tamid, al hasova, posek, hekdesh, me'ilah.* The `renderWithLinks()` function, when called with `withGlossary=true`, performs a second pass over rationale text wrapping the first occurrence of each term in a `GlossaryTerm` component. Gold dotted underline; hover activates a definition tooltip. Tooltip uses `useRef` + `getBoundingClientRect()` to position above the word with viewport clamping — no more tooltips falling off the left edge of the screen. Activates on hover (desktop) and tap (mobile).

#### Did You Know? Panel

A rotating educational fact panel at the bottom of the Annual Bill tab. 10 sourced facts: the 70 bulls of Sukkos (Sukkah 55b), Lechem HaPanim freshness (Avos 5:5), saffron in the Ketores (Kerisos 6a), Kohen Gadol's garment changes (Yoma 32a), Korban Pesach timing (Pesachim 58a), the olah's hide goes to the Kohen (Vayikra 7:8), Josephus's 256,500 Pesach offerings, the chatzi shekel equality principle (Shemos 30:15), the wood offering by family lottery (Nehemiah 10:35; Taanis 28a), the tamid as the day's frame (Tamid 28b). Navigate with ‹/› or dot indicators. All source citations hyperlinked via `renderWithLinks()`.

#### Print and Share — Today's Communal Costs Tab

The Today's Communal Costs tab now has Print Summary and Share buttons matching the Annual Bill tab. The print modal shows the full day's avodah broken down by block (Shacharit, Mussaf, Mincha as applicable) with Hebrew and Gregorian date, shiur label, per-block costs, and grand total. The modal is correctly scoped inside the Today tab IIFE so all variables (hebrewStr, gregDate, blocks, bTotal, dayTotal) are in scope.

#### Full Catalog Sources

All 22 Full Catalog entries now display their source citation as a hyperlink in the expanded detail panel. Clicking opens the primary source on Sefaria.

#### Printable Source Sheets for the Classroom

---

### V4.1 — Sources Update (April 22, 2026)

#### Source Citations in Rationale Panel

All 18 ANNUAL_ASSUMPTIONS entries now carry `source` and `sefaria` fields. The rationale expand panel displays the source citation below the explanation text, separated by a thin divider, as a hyperlink to Sefaria. The "SOURCE:" label was removed as self-evident.

#### Sources Added to All Offerings

Every offering in the annual bill now has a primary source citation:

| Offering | Primary Source |
|---|---|
| Korban Pesach | Shemos 12:6; Rambam Hilchos Korban Pesach 1:1 |
| Olas Re'iyah | Devarim 16:16; Rambam Hilchos Chagigah 1:1 |
| Chagigah | Devarim 16:16; Rambam Hilchos Chagigah 1:1 |
| Shalmei Simcha | Devarim 27:7; Rambam Hilchos Yom Tov 6:17 |
| Chagigat 14 Nisan | Pesachim 70a; Rambam Hilchos Korban Pesach 10:12 |
| Chatzi Shekel | Shemos 30:13; Rambam Hilchos Shekalim 1:5 |
| Bikkurim | Devarim 26:1-11; Mishnah Bikkurim 3:8 |
| Chataos | Vayikra 4:27-35; Rambam Hilchos Shegagos 1:1 |
| Asham Taluy | Vayikra 5:17-19; Rambam Hilchos Shegagos 8:1 |
| Todah | Vayikra 7:11-15; Rambam Hilchos Maaseh HaKorbanos 9:12 |
| Yoledet | Vayikra 12:6-8; Rambam Hilchos Mechusrei Kaparah 1:1 |
| Olah (voluntary) | Vayikra 1:2-17; Rambam Hilchos Maaseh HaKorbanos 1:1 |
| Shelamim | Vayikra 3:1-17; Rambam Hilchos Maaseh HaKorbanos 11:1 |
| Nazir | Bamidbar 6:13-20; Rambam Hilchos Nezirus 8:1 |
| Metzora | Vayikra 14:10-32; Rambam Hilchos Mechusrei Kaparah 4:1 |
| Oleh v'Yored | Vayikra 5:1-13; Rambam Hilchos Shegagos 10:1 |
| Pesach Sheni | Bamidbar 9:9-12; Rambam Hilchos Korban Pesach 5:1 |
| Pidyon Haben | Bamidbar 18:15-16; Rambam Hilchos Bikkurim 11:1 |

#### Shiur Source Links

All four shiur opinions in the settings panel now link to their primary source documents on Sefaria: R' Naeh → Shiurei Torah; R' Moshe Feinstein → Igros Moshe OC 1:136; Rambam → Hilchos Shabbos 18:1; Chazon Ish → OC 39:17. The Bikkurim landowner checkbox now shows a Devarim 26:1 link.

#### Print and Share Button Translations

The 🖨 Print Summary and 🔗 Share My Bill buttons now translate across all 5 languages.

---

### V4.0 — Core Release (April 2026)

**Multi-language support:** Full interface in Hebrew (RTL), Spanish, French, and Russian. All UI elements translated; halachic rationale text remains in English with a note in other languages.

**Currency toggle:** $ / ₪ pill toggle in the header. `fmtC()` routes all price displays. Live NIS/USD exchange rate from Cloudflare Worker.

**Today's Communal Costs tab:** Exact public korbanos for any Hebrew date computed in pure JavaScript (no external calendar library). Day navigation with ‹/› arrows and jump buttons for every Yom Tov. Time-block breakdown: Shacharit Tamid, Omer (16 Nisan), Mussaf (Shabbos/Yom Tov/Rosh Chodesh as applicable), Mincha Tamid. Ketores and Menorah oil listed separately. Three separate Mussaf blocks on 1 Tishrei that falls on Shabbos.

**Population slider:** Range 600K–10M with four presets (Bamidbar census 600K, scholars' estimate 1M, Josephus 3M, modern observant estimate 6M). Per-capita and communal totals update live.

**Print Summary:** Clean black-on-white modal of the annual bill. Itemized by category with totals. Print/Save PDF button.

**Share My Bill:** Base64 URL encoding of all settings. WhatsApp-safe URLs (~450 chars). `useEffect` reads `?bill=` param on mount. Verified round-trip.

**Halachic corrections:**
- Solet repriced NIS 18 → NIS 28/kg as semolina-grade per Menachos 27a, Rashi s.v. Solet=Geres, Avos 5:15
- Shalmei Simcha adjustable with +/− spinner; default 1 per regel; rationale notes the dispute (Rambam Hilchos Yom Tov 6:17)
- Chagigat 14 Nisan adjustable; conditional obligation per Rambam Hilchos Korban Pesach 10:12; defaults to 1 when attending Pesach; note that when 14 Nisan falls on Shabbos it is not brought
- RH Mussaf: three separate blocks on 1 Tishrei (Shabbos Mussaf + RH Mussaf + RC Tishrei Mussaf with note about musafei custom)
- Chatas violation examples revised: removed d'rabbanan examples, added chelev, chametz on Pesach, blood, Yom Kippur melacha; corrected electricity → lit candle (Mav'ir); tightened niddah/arayos with lo yada/ta'us distinction
- Bug fix: EY travel costs no longer included in annual total when "I live in Eretz Yisroel" is checked

---

## Technical Notes

Built with React + TypeScript, deployed on Cloudflare Pages. Live silver spot price from a Cloudflare Worker + KV storage. Live NIS/USD exchange rate from a separate Worker endpoint. Hebrew calendar in pure JavaScript — no external library. Source: `morrismassel/korbanos-site` on GitHub.

Key architectural notes:
- `renderWithLinks(text, withGlossary?)` — parses text at render time, produces array of strings and React elements. First pass: citation links. Second pass (if withGlossary=true): glossary term wrapping with word boundary detection.
- `CITE_LINKS` — 45-entry map of citation strings to Sefaria URLs, sorted longest-first to prevent partial matches.
- `GLOSSARY` — 16-entry map of Hebrew terms to one-line definitions.
- `GlossaryTerm` component — uses `useRef` + `getBoundingClientRect()` for viewport-clamped tooltip positioning with `position:fixed`.
- `SHIURIM` — four shiur opinions each with multiplier, source string, notes, and Sefaria URL.
- Hebrew calendar: `gregToAbs`, `absToHebrew`, `hebrewToAbs` with H_EPOCH = -1373427.
