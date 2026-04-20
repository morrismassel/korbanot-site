import { useState, useMemo, useEffect } from "react";

// ── Shiurim ───────────────────────────────────────────────────────────────────
const SHIURIM = {
  naeh:      { id:"naeh",      labelShort:"R' Naeh",    hebrew:"רַב נָאֶה",    beitzah_ml:50,  log_ml:300, issaron_L:2.4,  issaron_kg:2.4,  multiplier:1.0,  source:"Shi'urei Torah (1947)",   notes:"The widely-used Ashkenazic baseline. Beitzah=50ml; log=300ml; issaron approx 2.4kg flour." },
  moshe:     { id:"moshe",     labelShort:"R' Moshe",   hebrew:"רַב פיינשטיין",beitzah_ml:57,  log_ml:342, issaron_L:2.74, issaron_kg:2.74, multiplier:1.14, source:"Igros Moshe OC IV:109",   notes:"Middle position. Beitzah=57ml; log=342ml; issaron approx 2.74kg." },
  rambam:    { id:"rambam",    labelShort:"Rambam",     hebrew:"רמבם",         beitzah_ml:75,  log_ml:450, issaron_L:3.6,  issaron_kg:3.6,  multiplier:1.5,  source:"R' Kafih reconstruction", notes:"Beitzah=75ml; log=450ml; issaron approx 3.6kg. Approximately 1.5x R' Naeh." },
  chazon_ish:{ id:"chazon_ish",labelShort:"Chazon Ish", hebrew:"חָזוֹן אִישׁ", beitzah_ml:100, log_ml:600, issaron_L:4.8,  issaron_kg:4.8,  multiplier:2.0,  source:"Chazon Ish OC 39:17",    notes:"The largest shiur. Beitzah=100ml; log=600ml; issaron approx 4.8kg. Approximately 2x R' Naeh." },
};

// ── Jerusalem prices (NIS) ────────────────────────────────────────────────────
const JLM_NIS = {
  bull:9000, ram:1200, lamb:700, goat:650, bird:30,
  issaron_flour:18, log_oil:12, log_wine:15, frankincense:25, salt:2, wood:45,
  ketores:1072,
};
const JLM_SOURCES = {
  bull:        { src:"Central Cattle Market, Moshav Beit Dagan", url:"https://www.moag.gov.il", note:"Israeli cattle market average, Q1 2026." },
  ram:         { src:"Central Sheep & Goat Market, Israel",      url:"https://www.moag.gov.il", note:"Domestic production keeps prices lower than comparable US animals." },
  lamb:        { src:"Central Sheep & Goat Market, Israel",      url:"https://www.moag.gov.il", note:"Yearling lamb at Israeli auction. High domestic consumption; robust supply." },
  goat:        { src:"Central Sheep & Goat Market, Israel",      url:"https://www.moag.gov.il", note:"Widely raised domestically." },
  bird:        { src:"Israeli poultry wholesale market",          url:"https://www.moag.gov.il", note:"Squab consumption common in Middle Eastern cuisine; local supply." },
  issaron_flour:{ src:"Osem / Sugat fine wheat flour; Israeli supermarket retail", url:"https://www.osem.co.il", note:"Domestic wheat production subsidized. R' Naeh baseline: approx 2.4kg per issaron." },
  log_oil:     { src:"Domestic Israeli extra-virgin olive oil; Galilee production", url:"https://www.zait.co.il", note:"Significantly cheaper than US kosher imports. Mikdash required first-pressing quality." },
  log_wine:    { src:"Israeli table wine; Golan Heights Winery, Carmel",            url:"https://www.golanwines.co.il", note:"No import markup. Must be aged 40+ days (Menachot 87a)." },
  frankincense:{ src:"Machane Yehuda spice market; imported Omani frankincense",    url:"https://www.mahane-yehuda.com", note:"Boswellia sacra resin. Komatz approx 1-2 oz." },
  ketores:     { src:"Composite calculation — 11 spices per Kerisos 6a", url:"https://www.mahane-yehuda.com", note:"Annual batch: 368 maneh (~184kg) of 11 spices. Dominant costs: saffron (16 maneh × ~NIS 50/g = NIS 400,000), onycha (70 maneh × ~NIS 4/g = NIS 140,000), stacte (70 maneh × ~NIS 3/g = NIS 105,000), galbanum, spikenard, myrrh, cassia, costus, cinnamon, aromatic bark, and frankincense. Annual total ~NIS 782,000 ÷ 730 offerings = NIS 1,072 per offering. Saffron alone accounts for over 50% of the cost. Priced at Jerusalem wholesale; retail substantially higher." },
  wood:        { src:"Jerusalem lumber market", url:"", note:"Nine acceptable species (Tamid 29b). Nominal per-offering estimate." },
  salt:        { src:"Israeli commodity pricing", url:"", note:"Obligatory on all offerings; negligible cost." },
};

const LIBATION = { lamb:{flour:1,oil:3,wine:3}, ram:{flour:2,oil:4,wine:4}, bull:{flour:3,oil:6,wine:6} };

function buildPrices(shiurId, usdPerNis) {
  const m = SHIURIM[shiurId].multiplier;
  const c = v => v * usdPerNis;
  return {
    bull:c(JLM_NIS.bull), ram:c(JLM_NIS.ram), lamb:c(JLM_NIS.lamb),
    goat:c(JLM_NIS.goat), bird:c(JLM_NIS.bird),
    issaron_flour:c(JLM_NIS.issaron_flour*m), log_oil:c(JLM_NIS.log_oil*m),
    log_wine:c(JLM_NIS.log_wine*m), frankincense:c(JLM_NIS.frankincense),
    salt:c(JLM_NIS.salt), wood:c(JLM_NIS.wood),
    ketores:c(JLM_NIS.ketores),
  };
}
function libCost(a,P){const l=LIBATION[a];if(!l)return 0;return l.flour*P.issaron_flour+l.oil*P.log_oil+l.wine*P.log_wine;}
function compCost(key,count,P){
  switch(key){
    case"bull_olah":return count*(P.bull+libCost("bull",P));
    case"ram_olah": return count*(P.ram +libCost("ram", P));
    case"lamb_olah":return count*(P.lamb+libCost("lamb",P));
    case"bull":return count*P.bull; case"ram":return count*P.ram;
    case"lamb":return count*P.lamb; case"goat":return count*P.goat;
    case"bird":return count*P.bird; case"issaron_flour":return count*P.issaron_flour;
    case"log_oil":return count*P.log_oil; case"log_wine":return count*P.log_wine;
    case"frankincense":return count*P.frankincense; case"wood":return count*P.wood;
    case"ketores":return count*P.ketores;
    default:return 0;
  }
}
function offeringTotal(o,P){return o.components.reduce((s,c)=>s+compCost(c.key,c.count,P),0);}
const fmt    = n=>"$"+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtNIS = n=>"NIS "+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});

// ── Catalog ───────────────────────────────────────────────────────────────────
const CATALOG = [
  {id:"tamid",group:"Daily & Weekly",hebrew:"תָּמִיד",name:"Korban Tamid",subtitle:"The twice-daily continual offering",source:"Bamidbar 28:3-8",description:"Two yearling male lambs as olah each day with libations and wood. Ketores and menorah oil are listed separately in the communal budget.",components:[{label:"2 lambs (olah) with nesachim",key:"lamb_olah",count:2},{label:"Altar wood",key:"wood",count:1}]},
  {id:"ketores_daily",group:"Daily & Weekly",hebrew:"קְטֹרֶת",name:"Ketores - Daily Incense",subtitle:"Morning and afternoon incense offering",source:"Shemot 30:7-8; Yoma 26b; Kerisos 6a",description:"The 11-spice incense offered twice daily on the golden altar. One of the most expensive communal obligations. Per Kerisos 6a the annual batch is 368 maneh (~184kg): stacte, onycha, galbanum, and frankincense (70 maneh each); myrrh, cassia, spikenard, and saffron (16 maneh each); costus (12 maneh), aromatic bark (3 maneh), cinnamon (9 maneh). Saffron alone — at ~NIS 50/gram wholesale — accounts for over half the total cost. Price reflects a composite calculation across all 11 spices at Jerusalem wholesale rates; annual total ~NIS 782,000 ÷ 730 offerings.",components:[{label:"11-spice blend (full offering)",key:"ketores",count:1}]},
  {id:"menorah_oil",group:"Daily & Weekly",hebrew:"שֶׁמֶן הַמְּנוֹרָה",name:"Menorah Oil",subtitle:"Pure olive oil for the golden menorah",source:"Shemot 27:20; Menachos 89a",description:"Pure beaten olive oil lit each evening (and replenished each morning) in the seven-branched golden menorah. The Talmud (Menachos 89a) records the precise amount used. Approximately half a log per lamp per day for the six outer lamps; the western lamp burned continuously. Total daily consumption approximately 3.5 log of first-pressing olive oil.",components:[{label:"Olive oil (3.5 log daily)",key:"log_oil",count:3.5}]},
  {id:"shabbat",group:"Daily & Weekly",hebrew:"מוּסַף שַׁבָּת",name:"Musaf Shabbos",subtitle:"Additional offering for the Sabbath",source:"Bamidbar 28:9-10",description:"Two yearling male lambs as olah with nesachim, plus lechem hapanim.",components:[{label:"2 lambs (olah) with nesachim",key:"lamb_olah",count:2},{label:"Lechem hapanim (24 issaron)",key:"issaron_flour",count:24}]},
  {id:"rosh_chodesh",group:"Daily & Weekly",hebrew:"רֹאשׁ חֹדֶשׁ",name:"Musaf Rosh Chodesh",subtitle:"Additional offering for the new month",source:"Bamidbar 28:11-15",description:"Two bulls, one ram, seven lambs as olah with nesachim, plus one goat as chatas.",components:[{label:"2 bulls (olah) with nesachim",key:"bull_olah",count:2},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}]},
  {id:"pesach",group:"Pilgrimage Festivals",hebrew:"פֶּסַח",name:"Korban Pesach",subtitle:"Paschal offering (14 Nisan)",source:"Shemot 12; Bamidbar 9",description:"A yearling lamb or kid, roasted whole, eaten by a registered group on the night of the 15th.",components:[{label:"1 lamb (pesach)",key:"lamb",count:1}]},
  {id:"chagigah_14",group:"Pilgrimage Festivals",hebrew:"חֲגִיגַת י\"ד",name:"Chagigat 14 Nisan",subtitle:"The supplementary festive offering on Erev Pesach",source:"Pesachim 70a-71a; Rambam Hilchos Korban Pesach 10:12",description:"When 14 Nisan falls on a weekday, a shelamim is brought alongside the Korban Pesach to supplement the seder meal, ensuring there is additional meat so that the Korban Pesach is eaten al hasova (on satiety) rather than out of hunger. Brought only on 14 Nisan, unlike the standard chagigah which is brought on the first day of the regel. Eaten on the night of the 15th before the Pesach itself.",components:[{label:"1 ram (shelamim) with nesachim",key:"ram_olah",count:1}]},
  {id:"pesach_musaf_day",group:"Pilgrimage Festivals",hebrew:"מוּסַף פֶּסַח",name:"Musaf of Pesach - one day",subtitle:"Per day, for each of the 7 days",source:"Bamidbar 28:19-24",description:"2 bulls, 1 ram, 7 lambs as olah with nesachim, and 1 goat as chatas.",components:[{label:"2 bulls (olah) with nesachim",key:"bull_olah",count:2},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}]},
  {id:"omer",group:"Pilgrimage Festivals",hebrew:"עֹמֶר",name:"Korban HaOmer",subtitle:"Barley wave-offering (16 Nisan)",source:"Vayikra 23:9-14",description:"One issaron of barley flour with a yearling male lamb as olah and its libation.",components:[{label:"1 issaron barley flour",key:"issaron_flour",count:1},{label:"1 lamb (olah) with nesachim",key:"lamb_olah",count:1}]},
  {id:"shavuot",group:"Pilgrimage Festivals",hebrew:"שָׁבֻעוֹת",name:"Shavuos - Full Day",subtitle:"Including the Two Loaves and peace offerings",source:"Vayikra 23:15-21; Bamidbar 28:26-31",description:"Shtei HaLechem with 2 lambs as shelamim, plus full musaf and chatas.",components:[{label:"Shtei HaLechem (4 issaron)",key:"issaron_flour",count:4},{label:"2 lambs (shelamim)",key:"lamb_olah",count:2},{label:"Musaf: 7 lambs",key:"lamb_olah",count:7},{label:"Musaf: 1 bull",key:"bull_olah",count:1},{label:"Musaf: 2 rams",key:"ram_olah",count:2},{label:"Bamidbar 28: 2 bulls",key:"bull_olah",count:2},{label:"Bamidbar 28: 1 ram",key:"ram_olah",count:1},{label:"Bamidbar 28: 7 lambs",key:"lamb_olah",count:7},{label:"2 goats (chatas)",key:"goat",count:2}]},
  {id:"rosh_hashanah",group:"Pilgrimage Festivals",hebrew:"רֹאשׁ הַשָּׁנָה",name:"Musaf Rosh Hashana",subtitle:"New Year additional offering",source:"Bamidbar 29:1-6",description:"1 bull, 1 ram, 7 lambs as olah with nesachim, plus 1 goat as chatas.",components:[{label:"1 bull (olah) with nesachim",key:"bull_olah",count:1},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}]},
  {id:"yom_kippur",group:"Pilgrimage Festivals",hebrew:"יוֹם הַכִּפּוּרִים",name:"Yom Kippur - Full Service",subtitle:"The avodah of the Kohen Gadol",source:"Vayikra 16; Bamidbar 29:7-11",description:"The high priest's personal bull, two goats, two rams, and communal musaf.",components:[{label:"Kohen Gadol's bull (chatas)",key:"bull",count:1},{label:"2 goats (chatas + Azazel)",key:"goat",count:2},{label:"2 rams (olah) with nesachim",key:"ram_olah",count:2},{label:"Musaf: 1 bull",key:"bull_olah",count:1},{label:"Musaf: 1 ram",key:"ram_olah",count:1},{label:"Musaf: 7 lambs",key:"lamb_olah",count:7},{label:"Musaf goat (chatas)",key:"goat",count:1},{label:"Ketores",key:"frankincense",count:4}]},
  {id:"sukkot_day1",group:"Pilgrimage Festivals",hebrew:"סֻכּוֹת - יוֹם א",name:"Sukkos - Day 1",subtitle:"Largest animal offering of the year",source:"Bamidbar 29:12-16",description:"13 bulls, 2 rams, 14 lambs as olah with nesachim, plus 1 goat as chatas.",components:[{label:"13 bulls (olah) with nesachim",key:"bull_olah",count:13},{label:"2 rams (olah) with nesachim",key:"ram_olah",count:2},{label:"14 lambs (olah) with nesachim",key:"lamb_olah",count:14},{label:"1 goat (chatas)",key:"goat",count:1}]},
  {id:"sukkot_all",group:"Pilgrimage Festivals",hebrew:"סֻכּוֹת - כָּל הַיָּמִים",name:"Sukkos - All 7 Days",subtitle:"70 bulls total, representing 70 nations",source:"Bamidbar 29:12-34",description:"Seven days: 70 bulls, 14 rams, 98 lambs as olah, plus 7 goats as chatas.",components:[{label:"70 bulls (olah) with nesachim",key:"bull_olah",count:70},{label:"14 rams (olah) with nesachim",key:"ram_olah",count:14},{label:"98 lambs (olah) with nesachim",key:"lamb_olah",count:98},{label:"7 goats (chatas)",key:"goat",count:7}]},
  {id:"shemini_atzeret",group:"Pilgrimage Festivals",hebrew:"שְׁמִינִי עֲצֶרֶת",name:"Shemini Atzeres",subtitle:"The eighth-day assembly",source:"Bamidbar 29:35-38",description:"1 bull, 1 ram, 7 lambs as olah with nesachim + 1 goat as chatas.",components:[{label:"1 bull (olah) with nesachim",key:"bull_olah",count:1},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}]},
  {id:"chatat_individual",group:"Individual Offerings",hebrew:"חַטָּאת יָחִיד",name:"Chatas - Individual Sin Offering",subtitle:"For inadvertent transgression of a kareis prohibition",source:"Vayikra 4:27-35",description:"An individual who inadvertently violated a kareis prohibition brings a female goat as chatas.",components:[{label:"1 female goat (chatas)",key:"goat",count:1}]},
  {id:"asham",group:"Individual Offerings",hebrew:"אָשָׁם",name:"Asham - Guilt Offering",subtitle:"Ram for misappropriation or doubt",source:"Vayikra 5:14-26",description:"For misusing sanctified property, certain oaths, or doubt cases: a male ram with nesachim.",components:[{label:"1 ram (asham) with nesachim",key:"ram_olah",count:1}]},
  {id:"olah_animal",group:"Individual Offerings",hebrew:"עוֹלָה",name:"Olah - Voluntary Burnt Offering",subtitle:"Wholly consumed on the altar",source:"Vayikra 1",description:"A voluntary ascent-offering. One male lamb with its libation.",components:[{label:"1 lamb (olah) with nesachim",key:"lamb_olah",count:1}]},
  {id:"olah_bird",group:"Individual Offerings",hebrew:"עוֹלַת הָעוֹף",name:"Olah of the Poor - Bird",subtitle:"For one unable to afford an animal",source:"Vayikra 1:14-17",description:"A turtledove or young pigeon as olah. No nesachim.",components:[{label:"1 bird (olah)",key:"bird",count:1}]},
  {id:"shelamim",group:"Individual Offerings",hebrew:"שְׁלָמִים",name:"Shelamim - Peace Offering",subtitle:"Eaten by owner, priest, and altar",source:"Vayikra 3; 7:11-21",description:"A voluntary peace-offering. One mature ram with libation.",components:[{label:"1 ram (shelamim) with nesachim",key:"ram_olah",count:1}]},
  {id:"shalmei_simcha",group:"Individual Offerings",hebrew:"שַׁלְמֵי שִׂמְחָה",name:"Shalmei Simcha - Festive Peace Offering",subtitle:"Obligatory joy-offering on the three festivals",source:"Devarim 27:7; Rambam Hilchos Chagigah 1:1",description:"The Torah obligation of simcha on the three regalim — eating the meat of a shelamim in Yerushalayim. Distinct from the chagigah: the chagigah is a fixed minimal obligation, while the shalmei simcha scales to financial means and the size of one's household. Both are required; neither fulfills the other.",components:[{label:"1 ram (shelamim) with nesachim",key:"ram_olah",count:1}]},
  {id:"todah",group:"Individual Offerings",hebrew:"תּוֹדָה",name:"Korban Todah - Thanksgiving",subtitle:"Animal + 40 loaves",source:"Vayikra 7:11-15",description:"After surviving danger. Ram + 40 loaves (20 issaron flour + oil).",components:[{label:"1 ram (todah) with nesachim",key:"ram_olah",count:1},{label:"40 loaves (~20 issaron flour)",key:"issaron_flour",count:20},{label:"Oil for loaves (~2 log)",key:"log_oil",count:2}]},
  {id:"chagigah",group:"Individual Offerings",hebrew:"חֲגִיגָה",name:"Chagigah - Festival Peace Offering",subtitle:"Obligatory on the three pilgrimage festivals",source:"Devarim 16:16; Chagigah 1:1",description:"Every adult male at the Temple on each regel brings a shelamim-type offering.",components:[{label:"1 ram (shelamim) with nesachim",key:"ram_olah",count:1}]},
  {id:"reiyah",group:"Individual Offerings",hebrew:"עוֹלַת רְאִיָּה",name:"Olas Re'iyah - Appearance Offering",subtitle:"Obligatory olah on each of the 3 regalim",source:"Devarim 16:16; Chagigah 2a",description:"On each regel, every adult male brings a wholly-consumed olah.",components:[{label:"1 lamb (olah) with nesachim",key:"lamb_olah",count:1}]},
  {id:"reiyah_ram",group:"Individual Offerings",hebrew:"עוֹלַת רְאִיָּה - אַיִל",name:"Olas Re'iyah - Ram (Wealthy)",subtitle:"Premium olas re'iyah for the wealthy",source:"Devarim 16:16",description:"A ram as the olas re'iyah, as brought by those of means.",components:[{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1}]},
  {id:"chagigah_bull",group:"Individual Offerings",hebrew:"חֲגִיגָה - פַּר",name:"Chagigah - Bull (Wealthy)",subtitle:"Premium chagigah for the wealthy",source:"Devarim 16:16; Chagigah 1:1",description:"A bull as the chagigah, as brought by those of means.",components:[{label:"1 bull (olah) with nesachim",key:"bull_olah",count:1}]},
  {id:"yoledet",group:"Individual Offerings",hebrew:"יוֹלֶדֶת",name:"Yoledet - After Childbirth",subtitle:"Purification offering of a new mother",source:"Vayikra 12:6-8",description:"A yearling male lamb as olah + a bird as chatas, after the days of purification.",components:[{label:"1 lamb (olah) with nesachim",key:"lamb_olah",count:1},{label:"1 bird (chatas)",key:"bird",count:1}]},
  {id:"nazir",group:"Individual Offerings",hebrew:"נָזִיר",name:"korbanos Nazir - End of Nazirite Vow",subtitle:"At the completion of the vow",source:"Bamidbar 6:13-20",description:"1 male lamb (olah), 1 ewe-lamb (chatas), 1 ram (shelamim), basket of matzos.",components:[{label:"1 male lamb (olah) with nesachim",key:"lamb_olah",count:1},{label:"1 ewe-lamb (chatas)",key:"lamb",count:1},{label:"1 ram (shelamim) with nesachim",key:"ram_olah",count:1},{label:"Basket of matzos (~6 issaron)",key:"issaron_flour",count:6},{label:"Oil (~2 log)",key:"log_oil",count:2}]},
];
const GROUPS = ["Daily & Weekly","Pilgrimage Festivals","Individual Offerings"];

// ── Communal offerings (funded by chatzi shekel pool) ─────────────────────────
const COMMUNAL_OFFERINGS = [
  { id:"c_tamid",    label:"Korban Tamid",        hebrew:"תָּמִיד",           source:"Bamidbar 28:3-8",   note:"2 lambs daily × 365 days, with full nesachim and wood. Ketores and menorah oil are listed as separate communal line items.",           count:365, catalogId:"tamid" },
  { id:"c_shabbat",  label:"Musaf Shabbos",        hebrew:"מוּסַף שַׁבָּת",   source:"Bamidbar 28:9-10",  note:"52 Shabbosos × (2 lambs with nesachim + lechem hapanim).",                                count:52,  catalogId:"shabbat" },
  { id:"c_rch",      label:"Musaf Rosh Chodesh",   hebrew:"רֹאשׁ חֹדֶשׁ",    source:"Bamidbar 28:11-15", note:"12 Rosh Chodesh months × full musaf (2 bulls, 1 ram, 7 lambs, 1 goat).",                  count:12,  catalogId:"rosh_chodesh" },
  { id:"c_pesach",   label:"Musaf Pesach",         hebrew:"מוּסַף פֶּסַח",    source:"Bamidbar 28:19-24", note:"7 days × full musaf. Does not include the individual Korban Pesach.",                    count:7,   catalogId:"pesach_musaf_day" },
  { id:"c_omer",     label:"Korban HaOmer",        hebrew:"עֹמֶר",            source:"Vayikra 23:9-14",   note:"Brought once on 16 Nisan.",                                                              count:1,   catalogId:"omer" },
  { id:"c_shavuot",  label:"Shavuos Full Musaf",   hebrew:"שָׁבֻעוֹת",        source:"Vayikra 23:15-21",  note:"Includes Shtei HaLechem, shelamim, full musaf.",                                         count:1,   catalogId:"shavuot" },
  { id:"c_rh",       label:"Musaf Rosh Hashana",   hebrew:"רֹאשׁ הַשָּׁנָה",  source:"Bamidbar 29:1-6",   note:"1 bull, 1 ram, 7 lambs, 1 goat.",                                                        count:1,   catalogId:"rosh_hashanah" },
  { id:"c_yk",       label:"Yom Kippur Service",   hebrew:"יוֹם הַכִּפּוּרִים",source:"Vayikra 16",        note:"Communal portion: 2 goats (chatas + Azazel), plus communal musaf. The Kohen Gadol's personal bull is not from the public fund.", count:1, catalogId:"yom_kippur" },
  { id:"c_sukkot",   label:"Musaf Sukkos - All 7", hebrew:"סֻכּוֹת",          source:"Bamidbar 29:12-34", note:"70 bulls, 14 rams, 98 lambs over 7 days. Represents atonement for the 70 nations.",      count:1,   catalogId:"sukkot_all" },
  { id:"c_atzeret",  label:"Shemini Atzeres",      hebrew:"שְׁמִינִי עֲצֶרֶת",source:"Bamidbar 29:35-38", note:"1 bull, 1 ram, 7 lambs, 1 goat. A modest intimate offering after the abundance of Sukkos.", count:1, catalogId:"shemini_atzeret" },
  { id:"c_ketores",  label:"Ketores - Daily Incense",  hebrew:"קְטֹרֶת",            source:"Shemot 30:7-8; Kerisos 6a",  note:"Offered twice daily (morning and afternoon) — 730 offerings per year. The 11-spice formula (368 maneh annually) is fixed by Torah. Saffron alone accounts for over half the cost. Composite price of ~NIS 1,072 per offering based on Jerusalem wholesale rates for all 11 spices.", count:365, catalogId:"ketores_daily" },
  { id:"c_menorah",  label:"Menorah Oil",               hebrew:"שֶׁמֶן הַמְּנוֹרָה", source:"Shemot 27:20; Menachos 89a",  note:"Pure beaten first-pressing olive oil for the seven-branched golden menorah. Approximately 3.5 log per day. Requires exclusively first-pressing quality oil — significantly more expensive than standard olive oil.", count:365, catalogId:"menorah_oil" },
];

// ── Violation examples ────────────────────────────────────────────────────────
const V = {
  chatas_total:{
    kareis:[
      {act:"Pushed a stroller outside the valid eruv boundary",detail:"Eruv route assumed valid; later found posul"},
      {act:"Tore along a perforated line on Shabbos",detail:"Kore'a - a common toladah not widely known"},
      {act:"Squeezed a lemon into a drink on Shabbos",detail:"Sechita - toladah of dash (threshing)"},
      {act:"Wrote a note, forgetting it was Shabbos",detail:"Kotev - shogeg Shabbos, classic case"},
      {act:"Switched on a light momentarily forgetting Shabbos",detail:"Mav'ir - shogeg Shabbos"},
      {act:"Sorted items on Shabbos not knowing borer applies",detail:"Borer - very common unknowing violation"},
      {act:"Smeared ointment on Shabbos not knowing memareiach applies",detail:"Toladah of memachek; often unknown"},
      {act:"Physical contact b'shogeg with a niddah",detail:"Niddah carries kareis; inadvertent contact"},
      {act:"Relations during a period later confirmed as niddah",detail:"Common circumstance; kareis violation b'shogeg"},
      {act:"Ate a dish containing meat cooked with butter b'shogeg",detail:"D'oraisa basar b'chalav; thought it was pareve"},
      {act:"Alone in an elevator with female colleague - door closed",detail:"If the underlying arayos issur was crossed b'shogeg"},
    ],
    nonKareis:[
      {act:"Handled muktzeh on Shabbos",detail:"Rabbinic - no chatas"},
      {act:"Spoke about weekday business on Shabbos",detail:"Uvdin d'chol - rabbinic prohibition only"},
      {act:"Ate chicken with dairy",detail:"Rabbinic extension of basar b'chalav - no chatas"},
      {act:"Did not wait the full time between meat and dairy",detail:"Waiting period is minhag/d'rabbanan - no korban"},
      {act:"Handshake with a woman",detail:"Negiah - rabbinic according to most; no chatas"},
      {act:"Yichud itself",detail:"D'rabbanan - does not trigger a chatas directly"},
    ],
  },
  asham_talui:{
    kareis:[
      {act:"Unsure whether an elevator yichud situation went further",detail:"Classic asham toluy case - genuine doubt about whether the arayos issur was violated"},
      {act:"Ate something at an event - unsure if it was basar b'chalav",detail:"Could not identify ingredients; genuine uncertainty about a kareis prohibition"},
      {act:"Uncertain whether relations with wife occurred during niddah",detail:"Genuine doubt about a kareis violation generates an asham toluy"},
      {act:"Performed a melacha - uncertain of exact mental state at the time",detail:"Doubt about whether it constituted shogeg generates an asham toluy"},
      {act:"Kissed a relative - uncertain whether the relationship falls under arayos",detail:"Some relationships are disputed; genuine doubt triggers an asham toluy"},
    ],
    nonKareis:[
      {act:"Uncertain about a rabbinic Shabbos violation",detail:"Rabbinic doubt does not generate an asham toluy - only d'oraisa kareis doubts qualify"},
      {act:"Unsure if lashon hora caused damage",detail:"No korban mechanism for bein adam l'chaveiro violations"},
      {act:"Uncertain whether a brocha was said correctly",detail:"Brochos l'vatola is serious but carries no korban"},
    ],
  },
};

// ── Categories ────────────────────────────────────────────────────────────────
const CAT = {
  FIXED:    "Fixed Obligations",
  PERSONAL: "Personal Violations",
  TODAH:    "Thanksgiving",
  LIFE:     "Life Events & Voluntary",
  TRAVEL:   "Aliyah L'Regel - Travel",
};
const ANNUAL_ASSUMPTIONS = [
  {id:"pesach_korban", cat:CAT.FIXED,    label:"Korban Pesach",            hebrew:"קָרְבַּן פֶּסַח",      catalogId:"pesach",           defaultQty:1, rationale:"Obligatory. Failure without valid exemption carries kareis."},
  {id:"reiyah",        cat:CAT.FIXED,    label:"Olas Re'iyah x regalim",   hebrew:"עוֹלַת רְאִיָּה",      catalogId:"reiyah",           defaultQty:3, rationale:"Obligatory on Pesach, Shavuos, and Sukkos. Animal type varies by financial standing."},
  {id:"chagigah",      cat:CAT.FIXED,    label:"Chagigah x regalim",       hebrew:"חֲגִיגָה",            catalogId:"chagigah",         defaultQty:3, rationale:"Obligatory on Pesach, Shavuos, and Sukkos. Animal type varies by financial standing."},
  {id:"shalmei_simcha",cat:CAT.FIXED,    label:"Shalmei Simcha x regalim", hebrew:"שַׁלְמֵי שִׂמְחָה",   catalogId:"shalmei_simcha",   defaultQty:3, rationale:"The Torah obligation of simcha on each regel — distinct from the chagigah. Every adult male must eat from the meat of a shelamim in Yerushalayim on each of the three regalim. Scales with regalim attendance."},
  {id:"chagigah_14_nissan",cat:CAT.FIXED, label:"Chagigat 14 Nisan",        hebrew:"חֲגִיגַת י\"ד",        catalogId:"chagigah_14",      defaultQty:1, rationale:"Brought on Erev Pesach (14 Nisan) alongside the Korban Pesach, so that the seder meal is eaten al hasova — on satiety — rather than from hunger. Tied to Pesach attendance. Note: when 14 Nisan falls on Shabbos, this chagigah is not brought (and cannot be made up). In practice, toggle Pesach off to reflect non-attendance; the offering drops to zero automatically."},
  {id:"chatzi_shekel", cat:CAT.FIXED,    label:"Chatzi Shekel",            hebrew:"מַחֲצִית הַשֶּׁקֶל",   catalogId:null,               defaultQty:1, rationale:"Mandatory annual contribution of every adult Jewish male, used to fund all communal korbanos. Fixed at exactly half a shekel of the kodesh — 10 grams of silver. Source: Shemos 30:13; Rambam Hilchos Shekalim 1:5. No one gives more or less — the wealthy and the poor are equal."},
  {id:"chatas_total",  cat:CAT.PERSONAL, label:"Chataos",                  hebrew:"חַטָּאוֹת",            catalogId:"chatat_individual",defaultQty:7, rationale:"Total inadvertent violations of kareis prohibitions: Shabbos melachos, eruv failures, arayos, and basar b'chalav. Set by the scrutiny slider; adjust freely.", violations:V.chatas_total},
  {id:"asham_talui",   cat:CAT.PERSONAL, label:"Asham Toluy",              hebrew:"אָשָׁם תָּלוּי",       catalogId:"asham",            defaultQty:3, rationale:"Brought when genuinely unsure whether a kareis violation occurred.", violations:V.asham_talui},
  {id:"todah",         cat:CAT.TODAH,    label:"Korban Todah",             hebrew:"תּוֹדָה",              catalogId:"todah",            defaultQty:3, rationale:"Each aliyah l'regel round-trip generates 2 todah obligations. Plus a baseline of 2 for illness and other travel. Scales automatically with regalim attendance."},
  {id:"yoledet",       cat:CAT.LIFE,     label:"Yoledet",                  hebrew:"יוֹלֶדֶת",             catalogId:"yoledet",          defaultQty:0, rationale:"Brought by a woman after childbirth, after the days of purification (33 days for a boy, 66 for a girl). One lamb as olah and one bird as chatas. If she cannot afford a lamb, two birds. One of the most common life-event korbanos — every birth triggers this obligation."},
  {id:"olah_vol",      cat:CAT.LIFE,     label:"Olah - Voluntary",         hebrew:"עוֹלָה",               catalogId:"olah_animal",      defaultQty:0, rationale:"A wholly-consumed ascent-offering brought voluntarily — no trigger required. Expresses pure devotion; nothing returns to the owner. Can be brought at any time. The animal may be a bull, ram, or lamb depending on means."},
  {id:"shelamim_vol",  cat:CAT.LIFE,     label:"Shelamim - Peace Offering",hebrew:"שְׁלָמִים",             catalogId:"shelamim",         defaultQty:0, rationale:"Brought voluntarily to celebrate, fulfill a vow, or as a freewill gift. Divided among the altar, the kohanim, and the owner's family — eaten in Yerushalayim. Occasions include births, recoveries, business successes, or simple gratitude."},
  {id:"nazir_vol",     cat:CAT.LIFE,     label:"korbanos Nazir",           hebrew:"נָזִיר",               catalogId:"nazir",            defaultQty:0, rationale:"Brought at the end of a nazirite vow. The Nazir abstains from wine, haircuts, and contact with the dead, then brings a lamb as olah, a ewe as chatas, a ram as shelamim, plus 40 loaves."},
  {id:"metzora_vol",   cat:CAT.LIFE,     label:"Korban Metzora",           hebrew:"מְצֹרָע",              catalogId:"yoledet",          defaultQty:0, rationale:"Brought upon purification from tzara'at. Two lambs (asham and olah), one ewe (chatas), flour and oil, with an elaborate blood-and-oil anointing ritual. This offering marks complete reintegration into the community."},
  {id:"oleh_yored",    cat:CAT.LIFE,     label:"Korban Oleh v'Yored",      hebrew:"עוֹלֶה וְיוֹרֵד",     catalogId:"chatat_individual",defaultQty:0, rationale:"A sliding-scale offering for specific transgressions: false oath, entering the Mikdash while tamei, or eating kodashim while tamei. The wealthy bring a lamb; moderate means bring two birds; the very poor bring a flour offering (Vayikra 5:1-13)."},
  {id:"bikkurim",      cat:CAT.LIFE,     label:"Bikkurim",                 hebrew:"בִּכּוּרִים",           catalogId:null,               defaultQty:0, rationale:"First fruits of the seven species (wheat, barley, grapes, figs, pomegranates, olives, dates) brought to the Mikdash between Shavuos and Sukkos. Only obligatory for landowners in Eretz Yisrael. Accompanied by the Arami oved avi declaration (Devarim 26:5-10). No specific animal — the basket of first fruits goes to the kohen. Set to 0 if you own no qualifying land in Israel."},
  {id:"pidyon_haben",  cat:CAT.LIFE,     label:"Pidyon HaBen",             hebrew:"פִּדְיוֹן הַבֵּן",     catalogId:null,               defaultQty:0, rationale:"Redemption of the firstborn son, paid to a kohen 30 days after birth. Fixed at 5 shekalim of silver = approx 100 grams silver = ~$97 at current silver prices. One-time obligation, not annual — but included here for completeness. Only applies to the firstborn son of a mother who has not previously given birth."},
  {id:"pesach_sheni",  cat:CAT.LIFE,     label:"Korban Pesach Sheni",      hebrew:"פֶּסַח שֵׁנִי",        catalogId:"pesach",           defaultQty:0, rationale:"A second chance to bring the korban Pesach, on 14 Iyar, for those who were tamei or on a distant journey during 14 Nisan. The only case in halacha where the Torah explicitly grants a make-up date for a missed time-bound mitzvah."},
];

const CATEGORY_ORDER  = [CAT.FIXED, CAT.PERSONAL, CAT.TODAH, CAT.LIFE, CAT.TRAVEL];
const CATEGORY_NOTES  = {
  [CAT.FIXED]:    "Non-negotiable. Every adult male owes these every year regardless of conduct. The chatzi shekel is the same for everyone — wealthy and poor alike.",
  [CAT.PERSONAL]: "Inadvertent violations of kareis prohibitions. Set the scrutiny slider, then adjust as needed.",
  [CAT.TODAH]:    "Scales automatically with your regalim attendance — each round-trip flight generates two obligations. Plus a baseline for illness and other travel.",
  [CAT.LIFE]:     "Not obligatory every year — brought as life events occur or as voluntary acts of devotion. All default to zero.",
  [CAT.TRAVEL]:   "Round-trips New York to Jerusalem for the regalim. The true cost of living in the Diaspora.",
};
const CATEGORY_COLORS = {
  [CAT.FIXED]:"#f0c060",[CAT.PERSONAL]:"#d4884a",
  [CAT.TODAH]:"#4ec98a",[CAT.LIFE]:"#c07ad8",[CAT.TRAVEL]:"#5aabdf",
};

const PERSONAL_IDS   = ["chatas_total","asham_talui"];
const REGALIM_LOCKED = ["pesach_korban","reiyah","chagigah","shalmei_simcha","chagigah_14_nissan"];
const LIFE_IDS       = ["yoledet","olah_vol","shelamim_vol","nazir_vol","metzora_vol","oleh_yored","bikkurim","pidyon_haben","pesach_sheni"];
const FIXED_PRICE_IDS= ["chatzi_shekel","bikkurim","pidyon_haben"]; // non-catalog fixed prices

const STRICTNESS_LEVELS = [
  {level:1,label:"Minimally Observant",  desc:"Violations occur but rarely noticed or examined",              qtys:{chatas_total:1,asham_talui:0}},
  {level:2,label:"Average Observant",    desc:"Typical shomer Shabbos professional in a city",                qtys:{chatas_total:7,asham_talui:3}},
  {level:3,label:"Careful",              desc:"Actively reviews conduct; aware of tolados and arayos risks",  qtys:{chatas_total:10,asham_talui:6}},
  {level:4,label:"Yerei Shomayim",       desc:"Scrutinizes behavior; brings asham toluy proactively",          qtys:{chatas_total:13,asham_talui:10}},
  {level:5,label:"Exceptional Scrutiny", desc:"Examines every doubtful situation; Shimon HaTzaddik standard",  qtys:{chatas_total:16,asham_talui:15}},
];
const FINANCIAL_TIERS = {
  poor:    {id:"poor",    label:"Poor (Ani)",     hebrew:"עָנִי",     desc:"Bird substitutions for olas re'iyah and chagigah.",  reiyahId:"olah_bird",  chagigahId:"olah_bird"},
  average: {id:"average", label:"Average",        hebrew:"בֵּינוֹנִי", desc:"Standard animals. Lamb for re'iyah, ram for chagigah.",reiyahId:"reiyah",    chagigahId:"chagigah"},
  wealthy: {id:"wealthy", label:"Wealthy (Ashir)",hebrew:"עָשִׁיר",   desc:"Premium animals. Ram for re'iyah, bull for chagigah.",reiyahId:"reiyah_ram",chagigahId:"chagigah_bull"},
};
const TRAVEL_ITEMS = [
  {id:"travel_pesach",  label:"Pesach",  hebrew:"פֶּסַח",   nightsKey:"pesachNights"},
  {id:"travel_shavuot", label:"Shavuos", hebrew:"שָׁבֻעוֹת", nightsKey:"shavuotNights"},
  {id:"travel_sukkot",  label:"Sukkos",  hebrew:"סֻכּוֹת",  nightsKey:"sukkotNights"},
];
const DEFAULT_TRAVEL = {flightCost:1500,nightlyRate:400,familyMembers:0,pesachNights:4,shavuotNights:0,sukkotNights:4};

// Silver price for chatzi shekel / pidyon haben
const SILVER_GRAMS_PER_USD = 1/0.97; // ~$0.97/gram silver
const CHATZI_SHEKEL_USD     = 10 * 0.97; // 10g silver
const PIDYON_HABEN_USD      = 100 * 0.97; // 100g silver (5 shekalim)
const BIKKURIM_USD          = 150; // nominal basket of first-quality produce

function fixedPriceFor(id){ 
  if(id==="chatzi_shekel") return CHATZI_SHEKEL_USD;
  if(id==="pidyon_haben")  return PIDYON_HABEN_USD;
  if(id==="bikkurim")      return BIKKURIM_USD;
  return 0;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function korbanosCalculator() {
  const [activeTab,        setActiveTab]        = useState("annual");
  const [counts,           setCounts]           = useState({});
  const [expanded,         setExpanded]         = useState({});
  const [activeGroup,      setActiveGroup]      = useState("Daily & Weekly");
  const [profileQtys,      setProfileQtys]      = useState(Object.fromEntries(ANNUAL_ASSUMPTIONS.map(a=>[a.id,a.defaultQty])));
  const [showRationale,    setShowRationale]    = useState({});
  const [showExamples,     setShowExamples]     = useState({});
  const [regalimAttending, setRegalimAttending] = useState({pesach:true,shavuot:true,sukkot:true});
  const [expandedPrice,    setExpandedPrice]    = useState({});
  const [expandedCommune,  setExpandedCommune]  = useState({});
  const [showSettings,     setShowSettings]     = useState(false);
  const [shiurId,          setShiurId]          = useState("naeh");
  const [usdPerNis,        setUsdPerNis]        = useState(1/2.96);
  const [rateStatus,       setRateStatus]       = useState("idle");
  const [travelCfg,        setTravelCfg]        = useState(DEFAULT_TRAVEL);
  const [strictness,       setStrictness]       = useState(2);
  const [financialTier,    setFinancialTier]    = useState("average");
  const [personalQtys,     setPersonalQtys]     = useState({chatas_total:7,asham_talui:3});
  const [includeTravel,    setIncludeTravel]    = useState(true);

  useEffect(()=>{
    setRateStatus("loading");
    (async()=>{
      try{const r=await fetch("https://open.er-api.com/v6/latest/USD");const d=await r.json();if(d?.rates?.ILS){setUsdPerNis(1/d.rates.ILS);setRateStatus("live");return;}}catch(e){}
      try{const r=await fetch("https://api.frankfurter.app/latest?from=USD&to=ILS");const d=await r.json();if(d?.rates?.ILS){setUsdPerNis(1/d.rates.ILS);setRateStatus("live");return;}}catch(e){}
      setRateStatus("error");
    })();
  },[]);

  const fetchRate=async()=>{
    setRateStatus("loading");
    try{const r=await fetch("https://open.er-api.com/v6/latest/USD");const d=await r.json();if(d?.rates?.ILS){setUsdPerNis(1/d.rates.ILS);setRateStatus("live");return;}}catch(e){}
    try{const r=await fetch("https://api.frankfurter.app/latest?from=USD&to=ILS");const d=await r.json();if(d?.rates?.ILS){setUsdPerNis(1/d.rates.ILS);setRateStatus("live");return;}}catch(e){}
    setRateStatus("error");
  };

  const shiur        = SHIURIM[shiurId];
  const tier         = FINANCIAL_TIERS[financialTier];
  const currentLevel = STRICTNESS_LEVELS[strictness-1];
  const nisPerUsd    = usdPerNis>0?(1/usdPerNis).toFixed(2):"–";
  const P            = useMemo(()=>buildPrices(shiurId,usdPerNis),[shiurId,usdPerNis]);

  const setTravel      = (k,v)=>setTravelCfg(c=>({...c,[k]:Math.max(0,v)}));
  const setProfileQty  = (id,n)=>setProfileQtys(q=>({...q,[id]:Math.max(0,Math.min(99,n))}));
  const setCount       = (id,n)=>setCounts(c=>({...c,[id]:Math.max(0,Math.min(365,n))}));
  const setPersonalQty = (id,n)=>setPersonalQtys(q=>({...q,[id]:Math.max(0,Math.min(99,n))}));
  const handleStrictnessChange = v=>{setStrictness(v);setPersonalQtys(STRICTNESS_LEVELS[v-1].qtys);};

  const travelCosts = useMemo(()=>({
    travel_pesach:  travelCfg.flightCost*(1+travelCfg.familyMembers)+travelCfg.pesachNights *travelCfg.nightlyRate,
    travel_shavuot: travelCfg.flightCost*(1+travelCfg.familyMembers)+travelCfg.shavuotNights*travelCfg.nightlyRate,
    travel_sukkot:  travelCfg.flightCost*(1+travelCfg.familyMembers)+travelCfg.sukkotNights *travelCfg.nightlyRate,
  }),[travelCfg]);

  const regalimCount    = Object.values(regalimAttending).filter(Boolean).length;
  const todahFromTravel = regalimCount*2;
  const todahTotal      = 2+todahFromTravel;

  const resolveCatalogId = id=>{
    if(id==="reiyah")   return tier.reiyahId;
    if(id==="chagigah") return tier.chagigahId;
    return ANNUAL_ASSUMPTIONS.find(a=>a.id===id)?.catalogId;
  };
  const resolveUnitCost=(id,P)=>{
    if(FIXED_PRICE_IDS.includes(id)) return fixedPriceFor(id);
    const catId=resolveCatalogId(id);
    const entry=catId?CATALOG.find(c=>c.id===catId):null;
    return entry?offeringTotal(entry,P):0;
  };
  const getQty=id=>{
    if(id==="pesach_korban") return regalimAttending.pesach?1:0;
    if(id==="reiyah")        return regalimCount;
    if(id==="chagigah")      return regalimCount;
    if(id==="shalmei_simcha") return regalimCount;
    if(id==="chagigah_14_nissan") return regalimAttending.pesach?1:0;
    if(id==="chatzi_shekel") return 1;
    if(id==="todah")         return todahTotal;
    if(id==="chatas_total")  return personalQtys.chatas_total??currentLevel.qtys.chatas_total;
    if(id==="asham_talui")   return personalQtys.asham_talui ??currentLevel.qtys.asham_talui;
    return profileQtys[id]??0;
  };

  const travelSubtotal = useMemo(()=>TRAVEL_ITEMS.reduce((s,t)=>{
    const r=t.id.replace("travel_","");
    return s+(regalimAttending[r]?travelCosts[t.id]:0);
  },0),[regalimAttending,travelCosts]);

  const offeringsSubtotal = useMemo(()=>
    ANNUAL_ASSUMPTIONS.reduce((s,a)=>s+getQty(a.id)*resolveUnitCost(a.id,P),0),
    [profileQtys,personalQtys,regalimAttending,P,strictness,financialTier]
  );

  const annualTotal = offeringsSubtotal + (includeTravel?travelSubtotal:0);

  const byCategory = useMemo(()=>CATEGORY_ORDER.map(cat=>{
    if(cat===CAT.TRAVEL){
      return {cat,subtotal:travelSubtotal,isTravel:true,items:[]};
    }
    const items=ANNUAL_ASSUMPTIONS.filter(a=>a.cat===cat);
    const subtotal=items.reduce((s,a)=>s+getQty(a.id)*resolveUnitCost(a.id,P),0);
    return {cat,items,subtotal,isTravel:false};
  }),[profileQtys,personalQtys,regalimAttending,P,travelCosts,strictness,financialTier]);

  // Communal budget
  const communalTotal = useMemo(()=>COMMUNAL_OFFERINGS.reduce((s,o)=>{
    const entry=CATALOG.find(c=>c.id===o.catalogId);
    return s+(entry?o.count*offeringTotal(entry,P):0);
  },0),[P]);
  const ASSUMED_POPULATION = 600000;
  const perCapitaCommunal  = communalTotal/ASSUMED_POPULATION;

  const catalogTotal    = useMemo(()=>CATALOG.reduce((s,c)=>s+(counts[c.id]||0)*offeringTotal(c,P),0),[counts,P]);
  const catalogSelected = useMemo(()=>Object.values(counts).reduce<number>((a,b)=>a+((b as number)||0),0),[counts]);
  const filtered        = CATALOG.filter(s=>s.group===activeGroup);

  const lbl = {fontSize:"0.82rem",color:"#c9a45a",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.5rem"};
  const inp = {width:"100%",padding:"0.5rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center" as const,fontFamily:"inherit",fontSize:"1rem"};

  const doReset=()=>{
    setProfileQtys(Object.fromEntries(ANNUAL_ASSUMPTIONS.map(a=>[a.id,a.defaultQty])));
    setRegalimAttending({pesach:true,shavuot:true,sukkot:true});
    setStrictness(2);setPersonalQtys(STRICTNESS_LEVELS[1].qtys);
    setFinancialTier("average");setTravelCfg(DEFAULT_TRAVEL);setShiurId("naeh");setIncludeTravel(true);
  };

  const disclaimer=(
    <div style={{padding:"1.1rem 1.4rem",background:"rgba(139,0,0,.15)",border:"1px solid #aa3030",borderLeft:"4px solid #e04040",fontSize:"1rem",lineHeight:1.8,color:"#f0c0a0",marginTop:"1.5rem"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",letterSpacing:"0.1em",color:"#e04040",marginBottom:"0.5rem",fontWeight:700}}>For Educational Purposes Only</div>
      <strong style={{color:"#f0ddb0"}}>Do not rely on anything here for any halachic decision whatsoever.</strong> The violation examples, korban obligations, shiur conversions, and price estimates presented here have not been reviewed by any rabbinic authority and may contain errors, oversimplifications, or outright mistakes. All halachic questions must be addressed to a qualified posek.
    </div>
  );

  const TAB=(id,label)=>(
    <button onClick={()=>setActiveTab(id)} style={{padding:"0.75rem 1.1rem",background:activeTab===id?"#daa520":"transparent",color:activeTab===id?"#1a0f08":"#f0c060",border:`1px solid ${activeTab===id?"#daa520":"#7a4f20"}`,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.8rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",flex:"1 1 auto"}}>{label}</button>
  );
  const QtyCtrl=({id})=>{
    const qty=profileQtys[id]||0;
    return(<div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
      <button onClick={()=>setProfileQty(id,qty-1)} style={qBtn(qty>0)}>-</button>
      <input type="number" min="0" value={qty} onChange={e=>setProfileQty(id,parseInt(e.target.value)||0)} style={{width:52,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
      <button onClick={()=>setProfileQty(id,qty+1)} style={qBtn(true)}>+</button>
    </div>);
  };
  const PersonalCtrl=({id})=>{
    const qty=getQty(id);
    return(<div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
      <button onClick={()=>setPersonalQty(id,qty-1)} style={qBtn(qty>0)}>-</button>
      <input type="number" min="0" value={qty} onChange={e=>setPersonalQty(id,parseInt(e.target.value)||0)} style={{width:52,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
      <button onClick={()=>setPersonalQty(id,qty+1)} style={qBtn(true)}>+</button>
    </div>);
  };

  return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at top,#1e0e06 0%,#120a04 50%,#080402 100%)",color:"#f0ddb0",fontFamily:"'EB Garamond',Georgia,serif",padding:"2rem 1rem",fontSize:"17px",lineHeight:1.6}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400&family=Frank+Ruhl+Libre:wght@500;700;900&display=swap');
        .df{font-family:'Cinzel',serif;letter-spacing:0.05em}
        .hf{font-family:'Frank Ruhl Libre',serif;direction:rtl}
        @keyframes flicker{0%,100%{opacity:1}50%{opacity:.85}}
        .fl{animation:flicker 2.5s ease-in-out infinite}
        @keyframes fiu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fiu 0.25s ease-out}
        input[type=number]::-webkit-inner-spin-button{opacity:.4}
        a.sl{color:#c9a45a;font-size:.9rem;text-decoration:underline;text-underline-offset:3px}
        a.sl:hover{color:#f0c060}
        input[type=range]{-webkit-appearance:none;height:6px;border-radius:3px;background:#5a3a1a;outline:none;width:100%}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#c8882a;cursor:pointer;border:2px solid #f0c060}
        button:hover{filter:brightness(1.15)}
      `}</style>
      <div style={{maxWidth:1000,margin:"0 auto"}}>

        {/* HEADER */}
        <header style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"0.75rem",color:"#f0c060",marginBottom:"0.5rem"}} className="fl">
            <div style={{width:40,height:1,background:"#f0c060"}}/>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-1.5.5-2.5 1-3.5C10 8 10 10 11 10c.5 0 1-.5 1-1 0-2-1-4 0-7z"/></svg>
            <div style={{width:40,height:1,background:"#f0c060"}}/>
          </div>
          <h1 className="df" style={{fontSize:"clamp(2rem,4vw,3rem)",fontWeight:700,margin:"0.4rem 0",color:"#f0ddb0",textShadow:"0 2px 20px rgba(240,192,96,.3)"}}>KORBANOS</h1>
          <div className="hf" style={{fontSize:"clamp(1.4rem,3vw,2.2rem)",color:"#f0c060",marginBottom:"0.5rem"}}>קָרְבְּנוֹת בֵּית הַמִּקְדָּשׁ</div>
          <p style={{fontStyle:"italic",color:"#c9a45a",maxWidth:560,margin:"0 auto",fontSize:"1rem",lineHeight:1.6}}>A modern-day price calculator for the sacrifices of the Temple. All prices based on Jerusalem market rates.</p>
        </header>

        {/* TABS */}
        <div style={{display:"flex",gap:"0.4rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
          {TAB("annual","My Annual Bill")}{TAB("communal","Communal Budget")}{TAB("catalog","Full Catalog")}{TAB("prices","Prices & Sources")}
        </div>

        {/* SETTINGS STRIP */}
        <div style={{marginBottom:"1.5rem",background:"rgba(20,10,2,.95)",border:"1px solid #7a4f20"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.5rem",padding:"0.75rem 1.1rem",borderBottom:showSettings?"1px solid #5a3a1a":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem 1.5rem",flexWrap:"wrap",fontSize:"0.9rem",color:"#c9a45a"}}>
              <span><span style={{color:"#8a6030"}}>Rate: </span><span style={{color:"#f0ddb0"}}>$1 = NIS {nisPerUsd}</span>{rateStatus==="live"&&<span style={{color:"#4ec98a",marginLeft:"0.3rem"}}>live</span>}{rateStatus==="error"&&<span style={{color:"#e05050",marginLeft:"0.3rem"}}>manual</span>}</span>
              <span style={{color:"#5a3a1a"}}>|</span>
              <span><span style={{color:"#8a6030"}}>Shiur: </span><span style={{color:"#f0ddb0"}}>{shiur.labelShort}</span>{shiurId!=="naeh"&&<span style={{color:"#b070e0",marginLeft:"0.3rem"}}>x{shiur.multiplier}</span>}</span>
              <span style={{color:"#5a3a1a"}}>|</span>
              <span><span style={{color:"#8a6030"}}>Standing: </span><span style={{color:"#f0ddb0"}}>{tier.label}</span></span>
              <span style={{color:"#5a3a1a"}}>|</span>
              <span><span style={{color:"#8a6030"}}>Travel: </span><span style={{color:"#f0ddb0"}}>${travelCfg.flightCost}/flight</span>{travelCfg.familyMembers>0&&<span style={{color:"#5aabdf",marginLeft:"0.3rem"}}>- {travelCfg.familyMembers+1} travelers</span>}</span>
            </div>
            <button onClick={()=>setShowSettings(s=>!s)} style={{padding:"0.5rem 1rem",background:showSettings?"rgba(240,192,96,.15)":"transparent",border:`1px solid ${showSettings?"#f0c060":"#7a4f20"}`,color:"#f0c060",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
              {showSettings?"Close":"Assumptions"}
            </button>
          </div>
          {showSettings&&(
            <div className="fi" style={{padding:"1.25rem",borderTop:"1px solid #5a3a1a"}}>
              {/* Exchange rate */}
              <div style={{marginBottom:"1.25rem"}}>
                <div style={lbl}>USD / NIS Exchange Rate</div>
                <div style={{fontSize:"0.9rem",color:"#a08050",fontStyle:"italic",marginBottom:"0.5rem"}}>All prices are Jerusalem NIS rates, converted to USD for display.</div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                  <span style={{fontSize:"0.9rem",color:"#f0ddb0"}}>$1 =</span>
                  <input type="number" step="0.01" min="0.1" value={parseFloat(nisPerUsd)} onChange={e=>setUsdPerNis(1/(parseFloat(e.target.value)||2.96))} style={{width:70,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
                  <span style={{fontSize:"0.9rem",color:"#f0ddb0"}}>NIS</span>
                  <button onClick={fetchRate} style={{padding:"0.35rem 0.8rem",background:"transparent",border:"1px solid #7a4f20",color:"#c9a45a",cursor:"pointer",fontSize:"0.85rem",fontFamily:"'Cinzel',serif"}}>Refresh</button>
                  {rateStatus==="live"&&<span style={{fontSize:"0.9rem",color:"#4ec98a"}}>live rate</span>}
                  {rateStatus==="loading"&&<span style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic"}}>fetching...</span>}
                  {rateStatus==="error"&&<span style={{fontSize:"0.9rem",color:"#e05050"}}>fetch failed - using manual rate</span>}
                </div>
              </div>
              {/* Financial Standing */}
              <div style={{marginBottom:"1.25rem",paddingTop:"1rem",borderTop:"1px solid #5a3a1a"}}>
                <div style={lbl}>Financial Standing</div>
                <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.6rem"}}>
                  {Object.values(FINANCIAL_TIERS).map(t=>(
                    <button key={t.id} onClick={()=>setFinancialTier(t.id)} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.55rem 1rem",background:financialTier===t.id?"rgba(240,192,96,.18)":"transparent",color:financialTier===t.id?"#f0c060":"#c9a45a",border:`1px solid ${financialTier===t.id?"#f0c060":"#5a3a1a"}`,cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem"}}>
                      <span style={{fontFamily:"'Cinzel',serif",fontWeight:600}}>{t.label}</span>
                      <span className="hf" style={{fontSize:"1.1rem",color:financialTier===t.id?"#f0c060":"#7a5030"}}>{t.hebrew}</span>
                    </button>
                  ))}
                </div>
                <div style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic",lineHeight:1.6}}>{tier.desc}</div>
              </div>
              {/* Shiur */}
              <div style={{marginBottom:"1.25rem",paddingTop:"1rem",borderTop:"1px solid #5a3a1a"}}>
                <div style={lbl}>Shiur - Halachic Measurement Standard</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginBottom:"0.5rem"}}>
                  {Object.values(SHIURIM).map(s=>(
                    <button key={s.id} onClick={()=>setShiurId(s.id)} style={{padding:"0.45rem 0.9rem",background:shiurId===s.id?"rgba(240,192,96,.15)":"transparent",color:shiurId===s.id?"#f0c060":"#c9a45a",border:`1px solid ${shiurId===s.id?"#f0c060":"#5a3a1a"}`,cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem"}}>
                      <span style={{fontFamily:"'Cinzel',serif",fontWeight:600}}>{s.labelShort}</span>
                      <span style={{marginLeft:"0.4rem",opacity:.75,fontSize:"0.8rem"}}>{s.multiplier===1?"baseline":`x${s.multiplier}`}</span>
                    </button>
                  ))}
                </div>
                <div style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic",lineHeight:1.6}}>{shiur.notes} <span style={{color:"#7a5030"}}>- {shiur.source}</span></div>
              </div>
              {/* Travel */}
              <div style={{paddingTop:"1rem",borderTop:"1px solid #5a3a1a"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.75rem"}}>
                  <div style={{fontSize:"0.82rem",color:"#5aabdf",letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Cinzel',serif"}}>Travel Assumptions</div>
                  <label style={{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",fontSize:"0.9rem",color:"#c9a45a"}}>
                    <input type="checkbox" checked={includeTravel} onChange={e=>setIncludeTravel(e.target.checked)} style={{width:16,height:16,accentColor:"#f0c060",cursor:"pointer"}}/>
                    Include travel in total
                  </label>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"0.75rem",marginBottom:"0.9rem"}}>
                  {[{label:"Flight / person",key:"flightCost",prefix:"$",step:50},{label:"Nightly hotel",key:"nightlyRate",prefix:"$",step:25},{label:"Extra travelers",key:"familyMembers",step:1,suffix:"beyond self"},{label:"Pesach nights",key:"pesachNights",step:1},{label:"Shavuos nights",key:"shavuotNights",step:1},{label:"Sukkos nights",key:"sukkotNights",step:1}].map(({label,key,prefix,step,suffix})=>(
                    <div key={key}>
                      <div style={{...lbl,fontSize:"0.7rem",letterSpacing:"0.06em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</div>
                      <div style={{display:"flex",alignItems:"center",gap:"0.3rem"}}>
                        {prefix&&<span style={{fontSize:"0.9rem",color:"#f0ddb0"}}>{prefix}</span>}
                        <input type="number" min="0" step={step} value={travelCfg[key]} onChange={e=>setTravel(key,parseFloat(e.target.value)||0)} style={{...inp,fontSize:"0.9rem"}}/>
                        {suffix&&<span style={{fontSize:"0.72rem",color:"#7a5030",whiteSpace:"nowrap"}}>{suffix}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",paddingTop:"1rem",marginTop:"0.75rem",borderTop:"1px solid #5a3a1a"}}>
                <button onClick={doReset} style={{padding:"0.5rem 1rem",background:"transparent",border:"1px solid #5a3a1a",color:"#8a6030",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",letterSpacing:"0.1em"}}>Reset Defaults</button>
              </div>
            </div>
          )}
        </div>

        {/* ══ ANNUAL BILL ══ */}
        {activeTab==="annual"&&(
          <div className="fi">
            {/* Regalim selector */}
            <div style={{marginBottom:"1.75rem",padding:"1.25rem",background:"rgba(20,10,2,.8)",border:"1px solid #7a4f20"}}>
              <div style={{fontSize:"0.9rem",color:"#f0c060",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.85rem"}}>Which of the Shalosh Regalim are you ascending to Yerushalayim?</div>
              <div style={{display:"flex",gap:"0.85rem",flexWrap:"wrap",marginBottom:"0.9rem"}}>
                {[{id:"pesach",label:"Pesach",hebrew:"פֶּסַח"},{id:"shavuot",label:"Shavuos",hebrew:"שָׁבֻעוֹת"},{id:"sukkot",label:"Sukkos",hebrew:"סֻכּוֹת"}].map(({id,label,hebrew})=>{
                  const going=regalimAttending[id];
                  return(<button key={id} onClick={()=>setRegalimAttending(r=>({...r,[id]:!r[id]}))} style={{display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.65rem 1.2rem",background:going?"rgba(240,192,96,.15)":"rgba(30,14,6,.8)",border:`2px solid ${going?"#f0c060":"#5a3a1a"}`,color:going?"#f0ddb0":"#7a5030",cursor:"pointer",fontFamily:"inherit"}}>
                    <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${going?"#f0c060":"#5a3a1a"}`,background:going?"#f0c060":"transparent",flexShrink:0}}/>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",letterSpacing:"0.08em",fontWeight:going?700:400}}>{label}</span>
                    <span className="hf" style={{color:going?"#f0c060":"#5a3a1a",fontSize:"1.15rem"}}>{hebrew}</span>
                  </button>);
                })}
              </div>
              {Object.values(regalimAttending).some(v=>!v)&&(
                <div style={{padding:"1rem 1.1rem",background:"rgba(160,40,40,.12)",border:"1px solid #aa3030",borderLeft:"4px solid #e04040",lineHeight:1.75,color:"#f0a0a0"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:"1rem",letterSpacing:"0.08em",color:"#e04040",marginBottom:"0.6rem",fontWeight:700}}>Bitul Aseh — Torah Obligation Not Fulfilled</div>
                  {[{id:"pesach",label:"Pesach"},{id:"shavuot",label:"Shavuos"},{id:"sukkot",label:"Sukkos"}].filter(r=>!regalimAttending[r.id]).map(r=>(
                    <div key={r.id} style={{marginBottom:"0.5rem",fontSize:"1rem"}}>
                      <strong style={{color:"#ffb0b0",fontFamily:"'Cinzel',serif",fontSize:"0.9rem",letterSpacing:"0.05em"}}>{r.label}: </strong>
                      <span style={{color:"#f0c0c0"}}>You have violated the positive commandment of aliyah l'regel (Devarim 16:16). The olas re'iyah and chagigah for this regel are permanently lost. There is no korban to bring. The only recourse is teshuvah.</span>
                    </div>
                  ))}
                  <div style={{marginTop:"0.7rem",fontSize:"0.95rem",color:"#d4a060",fontStyle:"italic",borderTop:"1px dashed #aa3030",paddingTop:"0.6rem",lineHeight:1.7}}>The person who goes, violates an eruv, and brings a chatas has a cleaner ledger at year's end than the person who stayed home and saved the airfare.</div>
                </div>
              )}
              {Object.values(regalimAttending).every(v=>v)&&<div style={{fontSize:"0.9rem",color:"#4ec98a",fontStyle:"italic"}}>All three regalim — travel and korbanos included in your annual total below.</div>}
            </div>

            {byCategory.map(({cat,items,subtotal,isTravel})=>{
              if(isTravel && !includeTravel) return null;
              return(
              <div key={cat} style={{marginBottom:"2rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:`2px solid ${CATEGORY_COLORS[cat]}55`,paddingBottom:"0.5rem",marginBottom:"0.3rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                    <div style={{width:4,height:18,background:CATEGORY_COLORS[cat],borderRadius:2}}/>
                    <h2 className="df" style={{margin:0,fontSize:"0.95rem",color:CATEGORY_COLORS[cat],letterSpacing:"0.15em",textTransform:"uppercase"}}>{cat}</h2>
                  </div>
                  <span className="df" style={{fontSize:"1.1rem",color:CATEGORY_COLORS[cat],fontWeight:700}}>{fmt(subtotal)}</span>
                </div>
                <p style={{fontSize:"0.95rem",color:"#e8d4a0",fontStyle:"italic",margin:"0.3rem 0 0.9rem",lineHeight:1.7}}>{CATEGORY_NOTES[cat]}</p>

                {cat===CAT.PERSONAL&&(
                  <div style={{marginBottom:"1rem",padding:"1rem 1.1rem",background:"rgba(212,136,74,.07)",border:"1px solid #8a5030",borderLeft:"4px solid #d4884a"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"0.5rem"}}>
                      <div style={lbl}>Level of Self-Scrutiny</div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",color:"#d4884a",fontWeight:700}}>{currentLevel.label}</div>
                    </div>
                    <input type="range" min="1" max="5" value={strictness} onChange={e=>handleStrictnessChange(parseInt(e.target.value))} style={{cursor:"pointer",marginBottom:"0.4rem"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.82rem",color:"#c9a45a",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:"0.5rem"}}>
                      <span>Minimal</span><span>Average</span><span>Careful</span><span>Yerei Shomayim</span><span>Exceptional</span>
                    </div>
                    <div style={{fontSize:"1rem",color:"#e8d4a0",fontStyle:"italic",lineHeight:1.6}}>{currentLevel.desc}</div>
                    <div style={{marginTop:"0.4rem",fontSize:"0.92rem",color:"#c9a45a",lineHeight:1.6}}>Slider sets the starting quantities below. Adjust freely with +/- after.</div>
                  </div>
                )}

                {isTravel ? TRAVEL_ITEMS.map(t=>{
                  const regel=t.id.replace("travel_",""); const going=regalimAttending[regel]; const nights=travelCfg[t.nightsKey];
                  return(<div key={t.id} style={{background:going?"rgba(42,24,16,.5)":"rgba(20,10,2,.4)",border:`1px solid ${going?"#5a3a1a":"#2a1a08"}`,borderLeft:`4px solid ${going?"#5aabdf":"#2a1a08"}`,padding:"1rem 1.1rem",marginBottom:"0.7rem",opacity:going?1:0.4}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.5rem"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"baseline",gap:"0.5rem"}}>
                          <span style={{fontWeight:700,fontSize:"1.1rem",color:"#f0ddb0"}}>{t.label}{nights>0?` + ${nights} nights`:""}</span>
                          <span className="hf" style={{color:"#5aabdf",fontSize:"1.2rem"}}>{t.hebrew}</span>
                        </div>
                        <div style={{fontSize:"0.88rem",color:"#a08050",fontStyle:"italic",marginTop:"0.1rem"}}>{1+travelCfg.familyMembers}x ${travelCfg.flightCost}{nights>0?` + ${nights}x $${travelCfg.nightlyRate} lodging`:""}</div>
                      </div>
                      <div className="df" style={{fontSize:"1.3rem",color:going?"#5aabdf":"#4a2a08",fontWeight:700}}>{fmt(travelCosts[t.id])}</div>
                    </div>
                  </div>);
                }) : items.map(item=>{
                  const isPersonal    = PERSONAL_IDS.includes(item.id);
                  const isRegalimLock = REGALIM_LOCKED.includes(item.id);
                  const isLife        = LIFE_IDS.includes(item.id);
                  const isTodah       = item.id==="todah";
                  const isChatziFixed = item.id==="chatzi_shekel";
                  const unitCost      = resolveUnitCost(item.id,P);
                  const qty           = getQty(item.id);
                  const lineCost      = qty*unitCost;
                  const ac            = CATEGORY_COLORS[cat];
                  const showR         = showRationale[item.id];
                  const showEx        = showExamples[item.id];
                  const catId         = resolveCatalogId(item.id);
                  const catEntry      = catId?CATALOG.find(c=>c.id===catId):null;
                  return(
                    <div key={item.id} style={{background:isLife&&qty===0?"rgba(16,8,2,.6)":"rgba(24,12,4,.7)",border:`1px solid ${isLife&&qty===0?"#3a2510":"#5a3a1a"}`,borderLeft:`4px solid ${lineCost>0?ac:isLife?"#5a3060":"#3a2010"}`,padding:"1rem 1.1rem",marginBottom:"0.7rem",opacity:isLife&&qty===0?0.75:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem",flexWrap:"wrap"}}>
                        <div style={{flex:"1 1 260px"}}>
                          <div style={{display:"flex",alignItems:"baseline",gap:"0.6rem",flexWrap:"wrap"}}>
                            <span style={{fontWeight:700,fontSize:"1.15rem",color:qty>0?"#f0ddb0":"#c0a870"}}>{item.label}</span>
                            <span className="hf" style={{color:ac,fontSize:"1.4rem"}}>{item.hebrew}</span>
                            {isRegalimLock&&catEntry&&<span style={{fontSize:"0.85rem",color:"#7a5030",fontStyle:"italic"}}>{catEntry.subtitle}</span>}
                          </div>
                          {isLife||isChatziFixed
                            ? <div style={{marginTop:"0.5rem",fontSize:"0.95rem",color:"#e8d4a0",lineHeight:1.7}}>{item.rationale}</div>
                            : <>
                                <div style={{display:"flex",gap:"0.75rem",marginTop:"0.4rem",flexWrap:"wrap"}}>
                                  <button onClick={()=>setShowRationale(r=>({...r,[item.id]:!r[item.id]}))} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.88rem",fontFamily:"inherit",fontStyle:"italic",padding:0,textDecoration:"underline",textUnderlineOffset:"3px"}}>{showR?"hide rationale":"why this number?"}</button>
                                  {item.violations&&<button onClick={()=>setShowExamples(e=>({...e,[item.id]:!e[item.id]}))} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.88rem",fontFamily:"inherit",fontStyle:"italic",padding:0,textDecoration:"underline",textUnderlineOffset:"3px"}}>{showEx?"hide examples":"sample violations"}</button>}
                                </div>
                                {showR&&<div className="fi" style={{marginTop:"0.5rem",padding:"0.65rem 0.9rem",background:"rgba(240,192,96,.06)",border:"1px dashed #7a4f20",fontSize:"0.92rem",color:"#d4c090",lineHeight:1.7}}>{item.rationale}</div>}
                              </>
                          }
                          {item.violations&&showEx&&(
                            <div className="fi" style={{marginTop:"0.5rem"}}>
                              <div style={{marginBottom:"0.5rem"}}>
                                <div style={{fontSize:"0.82rem",color:"#e05050",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.4rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                                  <div style={{width:7,height:7,borderRadius:"50%",background:"#e05050"}}/>Kareis-bearing
                                </div>
                                {item.violations.kareis.map((v,i)=>(
                                  <div key={i} style={{padding:"0.45rem 0.75rem",marginBottom:"0.3rem",background:"rgba(192,57,43,.06)",border:"1px solid rgba(192,57,43,.2)",borderLeft:"2px solid rgba(192,57,43,.4)",fontSize:"0.9rem"}}>
                                    <div style={{color:"#f0ddb0",fontWeight:600,marginBottom:"0.15rem"}}>{v.act}</div>
                                    <div style={{color:"#a08050",fontStyle:"italic",fontSize:"0.85rem",lineHeight:1.5}}>{v.detail}</div>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div style={{fontSize:"0.82rem",color:"#8a6030",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.4rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                                  <div style={{width:7,height:7,borderRadius:"50%",background:"#8a6030"}}/>Rabbinic / no korban
                                </div>
                                {item.violations.nonKareis.map((v,i)=>(
                                  <div key={i} style={{padding:"0.45rem 0.75rem",marginBottom:"0.3rem",background:"rgba(42,24,16,.4)",border:"1px solid #5a3a1a",borderLeft:"2px solid #8a6030",fontSize:"0.9rem"}}>
                                    <div style={{color:"#c9a45a",fontWeight:600,marginBottom:"0.15rem"}}>{v.act}</div>
                                    <div style={{color:"#7a5030",fontStyle:"italic",fontSize:"0.85rem",lineHeight:1.5}}>{v.detail}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",flexShrink:0}}>
                          <div style={{textAlign:"right",minWidth:110}}>
                            <div style={{fontSize:"0.82rem",color:"#c9a45a",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"0.2rem"}}>{fmt(unitCost)} each</div>
                            <div className="df" style={{fontSize:"1.5rem",color:qty>0?ac:"#5a3a1a",fontWeight:700}}>{fmt(lineCost)}</div>
                          </div>
                          {isRegalimLock
                            ? <div style={{padding:"0.4rem 0.75rem",background:"#1a0c04",border:"1px solid #5a3a1a",color:"#c9a45a",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",whiteSpace:"nowrap"}}>{qty} — set by regalim</div>
                            : isChatziFixed
                              ? <div style={{padding:"0.4rem 0.75rem",background:"#1a0c04",border:"1px solid #5a3a1a",color:"#c9a45a",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",whiteSpace:"nowrap"}}>fixed</div>
                            : isTodah
                              ? <div style={{textAlign:"right"}}>
                                  <div style={{padding:"0.4rem 0.75rem",background:"#1a0c04",border:"1px solid #3a7a50",color:"#4ec98a",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",whiteSpace:"nowrap"}}>{qty} — auto</div>
                                  <div style={{fontSize:"0.8rem",color:"#4ec98a",marginTop:"0.25rem",fontStyle:"italic",maxWidth:160,textAlign:"right",lineHeight:1.4}}>{regalimCount} regel{regalimCount!==1?"im":""} x2 + 2 other</div>
                                </div>
                            : isPersonal
                              ? <PersonalCtrl id={item.id}/>
                              : <QtyCtrl id={item.id}/>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              );
            })}

            {/* Breakdown bar */}
            <div style={{marginBottom:"1.5rem"}}>
              <div style={{fontSize:"0.82rem",color:"#c9a45a",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"0.5rem",fontFamily:"'Cinzel',serif"}}>Cost Breakdown</div>
              <div style={{display:"flex",height:14,borderRadius:3,overflow:"hidden",gap:1}}>
                {byCategory.filter(x=>includeTravel||!x.isTravel).map(({cat,subtotal})=>{const pct=(subtotal/annualTotal)*100;if(pct<0.5||!annualTotal)return null;return <div key={cat} title={`${cat}: ${fmt(subtotal)}`} style={{width:`${pct}%`,background:CATEGORY_COLORS[cat]}}/>;})}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem 1.2rem",marginTop:"0.6rem"}}>
                {byCategory.filter(x=>includeTravel||!x.isTravel).map(({cat,subtotal})=>(
                  <div key={cat} style={{display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.9rem",color:"#c9a45a"}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:CATEGORY_COLORS[cat],flexShrink:0}}/>
                    <span style={{color:"#e8d4a0"}}>{cat}</span>
                    <span style={{color:CATEGORY_COLORS[cat],fontFamily:"'Cinzel',serif",fontWeight:700}}>{fmt(subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand total */}
            <div style={{padding:"1.4rem 1.6rem",background:"linear-gradient(135deg,#6a3010,#4a2008,#2a1004)",border:"2px solid #f0c060",boxShadow:"0 8px 40px rgba(240,192,96,.2)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:"0.9rem",color:"#f0ddb0",letterSpacing:"0.15em",textTransform:"uppercase",opacity:.85,marginBottom:"0.15rem"}}>Estimated Annual Total</div>
                <div className="df" style={{fontSize:"2.8rem",color:"#f0c060",fontWeight:900,textShadow:"0 2px 12px rgba(240,192,96,.4)"}}>{fmt(annualTotal)}</div>
                {!includeTravel&&<div style={{fontSize:"0.9rem",color:"#5aabdf",marginTop:"0.25rem",fontStyle:"italic"}}>Travel costs not included — {fmt(travelSubtotal)} excluded</div>}
              </div>
              <button onClick={doReset} style={{background:"transparent",border:"2px solid #f0ddb0",color:"#f0ddb0",padding:"0.55rem 1.1rem",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.85rem",letterSpacing:"0.1em",fontWeight:600}}>RESET</button>
            </div>
            {disclaimer}
          </div>
        )}

        {/* ══ COMMUNAL BUDGET ══ */}
        {activeTab==="communal"&&(
          <div className="fi">
            <div style={{marginBottom:"1.5rem",padding:"1.25rem",background:"rgba(240,192,96,.06)",border:"1px solid #7a4f20",borderLeft:"4px solid #f0c060"}}>
              <div style={{fontSize:"1rem",color:"#f0c060",fontFamily:"'Cinzel',serif",letterSpacing:"0.08em",marginBottom:"0.75rem",fontWeight:700}}>The Chatzi Shekel Pool</div>
              <p style={{fontSize:"1rem",color:"#e8d4a0",lineHeight:1.8,margin:"0 0 0.75rem"}}>Every adult Jewish male contributed exactly half a shekel annually — no more, no less. These funds paid for every communal korban: the tamid, all musaf offerings, the Yom Kippur service, the Shtei HaLechem, and more. The wealthy and the poor were equal before the altar.</p>
              <p style={{fontSize:"0.95rem",color:"#c9a45a",fontStyle:"italic",lineHeight:1.7,margin:0}}>Source: Shemos 30:13; Rambam Hilchos Shekalim 1:5. Half a shekel of the kodesh = 10 grams silver = <strong style={{color:"#f0ddb0"}}>{fmt(CHATZI_SHEKEL_USD)}</strong> at current silver prices (~$0.97/gram).</p>
            </div>

            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1rem",marginBottom:"2rem"}}>
              {[
                {label:"Total Annual Communal Cost",value:fmt(communalTotal),sub:"all public korbanos combined",color:"#f0c060"},
                {label:"Per Capita Cost",value:fmt(perCapitaCommunal),sub:`assuming ${(ASSUMED_POPULATION/1000).toFixed(0)}k adult males`,color:"#4ec98a"},
                {label:"Actual Chatzi Shekel",value:fmt(CHATZI_SHEKEL_USD),sub:"10g silver • fixed by Torah",color:"#c07ad8"},
                {label:"Subsidy per Person",value:fmt(Math.max(0,CHATZI_SHEKEL_USD-perCapitaCommunal)),sub:"chatzi shekel minus per-capita cost",color:"#5aabdf"},
              ].map(({label,value,sub,color})=>(
                <div key={label} style={{padding:"1.1rem 1.25rem",background:"rgba(24,12,4,.8)",border:`1px solid ${color}44`,borderTop:`3px solid ${color}`}}>
                  <div style={{fontSize:"0.78rem",color:"#a08050",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.4rem"}}>{label}</div>
                  <div className="df" style={{fontSize:"1.8rem",color:color,fontWeight:900}}>{value}</div>
                  <div style={{fontSize:"0.85rem",color:"#c9a45a",fontStyle:"italic",marginTop:"0.2rem"}}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{borderBottom:"2px solid #f0c06044",paddingBottom:"0.5rem",marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <h2 className="df" style={{margin:0,fontSize:"0.95rem",color:"#f0c060",letterSpacing:"0.15em",textTransform:"uppercase"}}>Annual Communal Offerings</h2>
              <span style={{fontSize:"0.9rem",color:"#a08050",fontStyle:"italic"}}>at current Jerusalem prices</span>
            </div>

            {COMMUNAL_OFFERINGS.map(o=>{
              const entry=CATALOG.find(c=>c.id===o.catalogId);
              const unitCost=entry?offeringTotal(entry,P):0;
              const totalCost=o.count*unitCost;
              const isExp=expandedCommune[o.id];
              return(
                <div key={o.id} style={{background:"rgba(24,12,4,.7)",border:"1px solid #5a3a1a",borderLeft:"4px solid #f0c06066",padding:"1rem 1.1rem",marginBottom:"0.7rem"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem",flexWrap:"wrap"}}>
                    <div style={{flex:"1 1 280px"}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:"0.6rem",flexWrap:"wrap"}}>
                        <span style={{fontWeight:700,fontSize:"1.1rem",color:"#f0ddb0"}}>{o.label}</span>
                        <span className="hf" style={{color:"#f0c060",fontSize:"1.25rem"}}>{o.hebrew}</span>
                        {o.count>1&&<span style={{fontSize:"0.85rem",color:"#7a5030",fontStyle:"italic"}}>x{o.count}</span>}
                      </div>
                      <div style={{fontSize:"0.9rem",color:"#c9a45a",marginTop:"0.25rem",lineHeight:1.6}}>{o.note}</div>
                      <button onClick={()=>setExpandedCommune(e=>({...e,[o.id]:!e[o.id]}))} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.85rem",fontFamily:"inherit",fontStyle:"italic",padding:"0.2rem 0 0",textDecoration:"underline",textUnderlineOffset:"3px"}}>{isExp?"hide breakdown":"show components"}</button>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,minWidth:130}}>
                      {o.count>1&&<div style={{fontSize:"0.82rem",color:"#a08050"}}>{fmt(unitCost)} x {o.count}</div>}
                      <div className="df" style={{fontSize:"1.5rem",color:"#f0c060",fontWeight:700}}>{fmt(totalCost)}</div>
                    </div>
                  </div>
                  {isExp&&entry&&(
                    <div className="fi" style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px dashed #5a3a1a"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.92rem"}}>
                        <tbody>{entry.components.map((c,i)=>(
                          <tr key={i} style={{borderBottom:"1px dotted #5a3a1a"}}>
                            <td style={{padding:"0.3rem 0",color:"#e8d4a0"}}>{c.label}</td>
                            <td style={{padding:"0.3rem 0",textAlign:"right",color:"#f0c060",fontFamily:"'Cinzel',serif",fontSize:"0.88rem",whiteSpace:"nowrap"}}>{fmt(compCost(c.key,c.count,P))}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{marginTop:"1.5rem",padding:"1rem 1.25rem",background:"rgba(240,192,96,.04)",border:"1px solid #5a3a1a",fontSize:"0.9rem",color:"#c9a45a",lineHeight:1.7,fontStyle:"italic"}}>
              Note: The Kohen Gadol's personal bull on Yom Kippur was not funded by the communal pool — he brought it at his own expense. The 12 Rosh Chodesh musafim assume a standard year; a leap year adds one additional Rosh Chodesh musaf. Population assumption of 600,000 adult males is a conventional figure; actual Second Temple era population estimates vary considerably.
            </div>
            {disclaimer}
          </div>
        )}

        {/* ══ FULL CATALOG ══ */}
        {activeTab==="catalog"&&(
          <div className="fi">
            <div style={{display:"flex",justifyContent:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1.5rem"}}>
              {GROUPS.map(g=><button key={g} onClick={()=>setActiveGroup(g)} style={{padding:"0.55rem 1.1rem",background:activeGroup===g?"#daa520":"transparent",color:activeGroup===g?"#1a0f08":"#f0c060",border:`1px solid ${activeGroup===g?"#daa520":"#7a4f20"}`,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>{g}</button>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.9rem"}}>
              {filtered.map(s=>{
                const count=counts[s.id]||0,cost=offeringTotal(s,P),isExp=expanded[s.id];
                return(<div key={s.id} style={{background:count>0?"linear-gradient(135deg,rgba(139,69,19,.2),rgba(30,14,6,.7))":"rgba(24,12,4,.7)",border:`1px solid ${count>0?"#f0c060":"#5a3a1a"}`,borderLeft:`4px solid ${count>0?"#f0c060":"#3a2010"}`,padding:"1.1rem"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem",marginBottom:"0.7rem",flexWrap:"wrap"}}>
                    <div style={{flex:"1 1 260px"}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:"0.6rem",flexWrap:"wrap"}}>
                        <h3 className="df" style={{margin:0,fontSize:"1.1rem",color:"#f0ddb0",fontWeight:700}}>{s.name}</h3>
                        <span className="hf" style={{color:"#f0c060",fontSize:"1.25rem"}}>{s.hebrew}</span>
                      </div>
                      <div style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic",marginTop:"0.15rem"}}>{s.subtitle}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"0.78rem",color:"#a08050",letterSpacing:"0.1em",textTransform:"uppercase"}}>Per Offering</div>
                      <div className="df" style={{fontSize:"1.5rem",color:"#f0c060",fontWeight:700}}>{fmt(cost)}</div>
                      <div style={{fontSize:"0.82rem",color:"#7a5030"}}>{fmtNIS(cost/usdPerNis)}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                      <button onClick={()=>setCount(s.id,count-1)} style={qBtn(count>0)}>-</button>
                      <input type="number" min="0" value={count} onChange={e=>setCount(s.id,parseInt(e.target.value)||0)} style={{width:52,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
                      <button onClick={()=>setCount(s.id,count+1)} style={qBtn(true)}>+</button>
                      <button onClick={()=>setExpanded(e=>({...e,[s.id]:!e[s.id]}))} style={{marginLeft:"0.5rem",background:"transparent",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.9rem",fontFamily:"inherit",fontStyle:"italic",textDecoration:"underline",textUnderlineOffset:"3px"}}>{isExp?"hide":"details"}</button>
                    </div>
                    {count>0&&<div className="df" style={{fontSize:"1.1rem",color:"#f0ddb0",fontWeight:700}}>= {fmt(count*cost)}</div>}
                  </div>
                  {isExp&&(<div className="fi" style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px dashed #5a3a1a"}}>
                    <div style={{fontSize:"0.95rem",lineHeight:1.7,color:"#e8d4a0",marginBottom:"0.6rem"}}>{s.description}</div>
                    <div style={{fontSize:"0.85rem",color:"#8a6030",fontStyle:"italic",marginBottom:"0.6rem"}}>{s.source}</div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.92rem"}}>
                      <tbody>{s.components.map((c,i)=>(
                        <tr key={i} style={{borderBottom:"1px dotted #5a3a1a"}}>
                          <td style={{padding:"0.3rem 0",color:"#e8d4a0"}}>{c.label}</td>
                          <td style={{padding:"0.3rem 0",textAlign:"right",color:"#f0c060",fontFamily:"'Cinzel',serif",fontSize:"0.88rem",whiteSpace:"nowrap"}}>{fmt(compCost(c.key,c.count,P))}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>)}
                </div>);
              })}
            </div>
            {catalogSelected>0&&(
              <div className="fi" style={{position:"sticky",bottom:"1rem",marginTop:"1.5rem",background:"linear-gradient(135deg,#6a3010,#4a2008,#2a1004)",border:"2px solid #f0c060",padding:"1rem 1.5rem",boxShadow:"0 8px 32px rgba(240,192,96,.25)",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:10}}>
                <div>
                  <div style={{fontSize:"0.82rem",color:"#f0ddb0",letterSpacing:"0.2em",textTransform:"uppercase",opacity:.8}}>Total — {catalogSelected} {catalogSelected===1?"offering":"offerings"}</div>
                  <div className="df" style={{fontSize:"2rem",color:"#f0c060",fontWeight:900}}>{fmt(catalogTotal)}</div>
                </div>
                <button onClick={()=>setCounts({})} style={{background:"transparent",border:"2px solid #f0ddb0",color:"#f0ddb0",padding:"0.5rem 1rem",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.85rem",letterSpacing:"0.1em",fontWeight:600}}>CLEAR</button>
              </div>
            )}
            {disclaimer}
          </div>
        )}

        {/* ══ PRICES & SOURCES ══ */}
        {activeTab==="prices"&&(
          <div className="fi">
            <div style={{marginBottom:"1.5rem",padding:"1rem 1.25rem",background:"rgba(90,171,223,.07)",border:"1px solid #3a7aaa",borderLeft:"3px solid #5aabdf",fontSize:"1rem",lineHeight:1.7,color:"#e8d4a0"}}>
              <strong style={{color:"#f0ddb0"}}>All prices are Jerusalem market rates.</strong> korbanos are brought in Jerusalem. NIS prices converted to USD at $1 = NIS {nisPerUsd}.
            </div>
            <div style={{marginBottom:"1.5rem",padding:"1rem 1.25rem",background:"rgba(240,192,96,.06)",border:"1px solid #7a4f20",borderLeft:"3px solid #f0c060"}}>
              <div style={{marginBottom:"0.4rem"}}>
                <span className="df" style={{fontSize:"0.85rem",color:"#f0c060",letterSpacing:"0.1em"}}>ACTIVE SHITA: </span>
                <span style={{fontSize:"1rem",color:"#f0ddb0",fontWeight:700}}>{shiur.labelShort}</span>
                <span className="hf" style={{marginLeft:"0.6rem",color:"#f0c060",fontSize:"1.15rem"}}>{shiur.hebrew}</span>
                <span style={{marginLeft:"0.75rem",fontSize:"0.88rem",color:"#a08050",fontStyle:"italic"}}>{shiur.source}</span>
              </div>
              <div style={{fontSize:"0.95rem",color:"#c9a45a",lineHeight:1.65}}>{shiur.notes}</div>
              {shiurId!=="naeh"&&<div style={{marginTop:"0.4rem",fontSize:"0.9rem",color:"#b070e0"}}>Agricultural items (flour, oil, wine) are x{shiur.multiplier} the R' Naeh baseline.</div>}
            </div>

            {[
              {category:"Livestock",   keys:["bull","ram","lamb","goat","bird"],                              isAgr:false},
              {category:"Agricultural",keys:["issaron_flour","log_oil","log_wine","frankincense","ketores","wood","salt"],isAgr:true},
            ].map(({category,keys,isAgr})=>(
              <div key={category} style={{marginBottom:"2rem"}}>
                <div style={{borderBottom:"1px solid #5a3a1a",paddingBottom:"0.5rem",marginBottom:"0.75rem"}}>
                  <h2 className="df" style={{margin:0,fontSize:"0.9rem",color:"#f0c060",letterSpacing:"0.15em",textTransform:"uppercase"}}>{category}</h2>
                </div>
                {keys.map(key=>{
                  const isFixed=key==="ketores"||key==="frankincense"||key==="wood"||key==="salt";
                  const baseNIS=JLM_NIS[key];const m=(isAgr&&!isFixed)?shiur.multiplier:1;const adjNIS=baseNIS*m;const usdPrice=adjNIS*usdPerNis;
                  const isExp=expandedPrice[key];const {src,url,note}=JLM_SOURCES[key];
                  return(<div key={key} style={{background:"rgba(24,12,4,.7)",border:"1px solid #5a3a1a",borderLeft:`4px solid ${isAgr?"#b070e0":"#7a4f20"}`,padding:"0.9rem 1rem",marginBottom:"0.55rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem",flexWrap:"wrap"}}>
                      <div style={{flex:"1 1 200px"}}>
                        <div style={{display:"flex",alignItems:"baseline",gap:"0.5rem",flexWrap:"wrap"}}>
                          <span style={{fontWeight:700,fontSize:"1rem",color:"#f0ddb0",textTransform:"capitalize"}}>{key==="ketores"?"Ketores (per offering)":key.replace(/_/g," ")}</span>
                          {isAgr&&!isFixed&&<span style={{fontSize:"0.72rem",color:"#b070e0",border:"1px solid #b070e0",padding:"0.1rem 0.35rem",letterSpacing:"0.08em"}}>SHIUR-DEPENDENT</span>}
                          {key==="ketores"&&<span style={{fontSize:"0.72rem",color:"#4ec98a",border:"1px solid #4ec98a",padding:"0.1rem 0.35rem",letterSpacing:"0.08em"}}>FIXED FORMULA</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:"1rem",flexShrink:0}}>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:"0.82rem",color:"#a08050"}}>NIS {adjNIS.toFixed(1)}{isAgr&&!isFixed&&shiurId!=="naeh"&&<span style={{color:"#b070e0"}}> x{shiur.multiplier}</span>}</div>
                          <div className="df" style={{fontSize:"1.5rem",color:"#f0c060",fontWeight:700}}>{fmt(usdPrice)}</div>
                        </div>
                        <button onClick={()=>setExpandedPrice(e=>({...e,[key]:!e[key]}))} style={{background:"transparent",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.9rem",fontFamily:"inherit",fontStyle:"italic",textDecoration:"underline",textUnderlineOffset:"3px",whiteSpace:"nowrap"}}>{isExp?"hide":"sources"}</button>
                      </div>
                    </div>
                    {isExp&&(<div className="fi" style={{marginTop:"0.85rem",paddingTop:"0.85rem",borderTop:"1px dashed #5a3a1a",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                      {isAgr&&!isFixed&&shiurId!=="naeh"&&<div style={{padding:"0.4rem 0.75rem",background:"rgba(176,112,224,.08)",border:"1px solid rgba(176,112,224,.27)",fontSize:"0.9rem",color:"#c9a45a",lineHeight:1.6}}><strong style={{color:"#f0ddb0"}}>Shiur impact:</strong> Base (R' Naeh x1.0) = NIS {baseNIS} — {shiur.labelShort} x{shiur.multiplier} = NIS {adjNIS.toFixed(1)} = <strong style={{color:"#f0c060"}}>{fmt(usdPrice)}</strong></div>}
                      <div><div style={{fontSize:"0.78rem",color:"#a08050",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.2rem"}}>Source</div><div style={{fontSize:"0.95rem",color:"#e8d4a0",lineHeight:1.6}}>{src}{url&&<> — <a href={url} target="_blank" rel="noopener noreferrer" className="sl">{url.replace("https://","")}</a></>}</div></div>
                      <div><div style={{fontSize:"0.78rem",color:"#a08050",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.2rem"}}>Notes</div><div style={{fontSize:"0.95rem",color:"#c9a45a",lineHeight:1.6,fontStyle:"italic"}}>{note}</div></div>
                    </div>)}
                  </div>);
                })}
              </div>
            ))}

            <div style={{marginBottom:"2rem"}}>
              <div style={{borderBottom:"1px solid #5a3a1a",paddingBottom:"0.5rem",marginBottom:"0.75rem",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <h2 className="df" style={{margin:0,fontSize:"0.9rem",color:"#f0c060",letterSpacing:"0.15em",textTransform:"uppercase"}}>Halachic Measurement Conversions</h2>
                <span style={{fontSize:"0.88rem",color:"#a08050",fontStyle:"italic"}}>per {shiur.labelShort}</span>
              </div>
              {[
                {unit:"Ephah",   equiv:`${(shiur.issaron_L*10).toFixed(1)}L`,        basis:`10 x issaron. ${shiur.labelShort}: ${shiur.issaron_L}L per issaron.`},
                {unit:"Issaron", equiv:`${shiur.issaron_L}L / ~${shiur.issaron_kg}kg flour`,basis:`1/10 ephah. (${shiur.source})`},
                {unit:"Hin",     equiv:`${(shiur.log_ml*12/1000).toFixed(2)}L`,       basis:`12 log. log=${shiur.log_ml}ml.`},
                {unit:"Log",     equiv:`${shiur.log_ml}ml (~${(shiur.log_ml/29.57).toFixed(1)} fl oz)`,basis:`6 beitzim. beitzah=${shiur.beitzah_ml}ml.`},
                {unit:"Beitzah", equiv:`${shiur.beitzah_ml}ml`,                       basis:shiur.source},
                {unit:"Komatz",  equiv:"~1-2 oz resin",                                basis:"Three-finger pinch. Unaffected by volume shiurim."},
              ].map(m=>(
                <div key={m.unit} style={{display:"flex",gap:"1rem",padding:"0.6rem 0",borderBottom:"1px dotted #5a3a1a",flexWrap:"wrap"}}>
                  <div style={{minWidth:100,fontWeight:700,color:"#f0ddb0",fontSize:"0.95rem"}}>{m.unit}</div>
                  <div style={{flex:1}}>
                    <div style={{color:"#f0c060",fontFamily:"'Cinzel',serif",fontSize:"0.9rem",marginBottom:"0.2rem"}}>{m.equiv}</div>
                    <div style={{color:"#a08050",fontSize:"0.85rem",fontStyle:"italic"}}>{m.basis}</div>
                  </div>
                </div>
              ))}
            </div>
            {disclaimer}
          </div>
        )}
      </div>
      <div style={{textAlign:"center",marginTop:"2.5rem",paddingTop:"1.5rem",borderTop:"1px solid #3a2010",color:"#ffffff",fontSize:"0.82rem",opacity:0.7}}>
        Created by Jeremy Spier and Morris Massel with help from AI. Send questions and comments to info@korbancalculator.com
      </div>
      <div style={{textAlign:"center",marginTop:"0.5rem",color:"#ffffff",fontSize:"0.82rem",opacity:0.7}}>
  Code available at <a href="https://github.com/morrismassel/korbanos-site" target="_blank" rel="noopener noreferrer" style={{color:"#c9a45a",textDecoration:"underline",textUnderlineOffset:"3px"}}>github.com/morrismassel/korbanos-site</a>
</div>
    </div>
  );
}

function qBtn(e){return{width:38,height:38,background:e?"#7a4f20":"#2a1a08",border:`1px solid ${e?"#c9a45a":"#5a3a1a"}`,color:e?"#f0ddb0":"#5a3a1a",cursor:e?"pointer":"not-allowed",fontSize:"1.2rem",fontFamily:"inherit",opacity:e?1:0.4};}
