// Korbanos Calculator — V4
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
  issaron_flour:28, log_oil:12, log_wine:15, frankincense:25, salt:2, wood:45,
  ketores:1072,
};
const JLM_SOURCES = {
  bull:        { src:"Central Cattle Market, Moshav Beit Dagan", url:"https://www.moag.gov.il", note:"Israeli cattle market average, Q1 2026." },
  ram:         { src:"Central Sheep & Goat Market, Israel",      url:"https://www.moag.gov.il", note:"Domestic production keeps prices lower than comparable US animals." },
  lamb:        { src:"Central Sheep & Goat Market, Israel",      url:"https://www.moag.gov.il", note:"Yearling lamb at Israeli auction. High domestic consumption; robust supply." },
  goat:        { src:"Central Sheep & Goat Market, Israel",      url:"https://www.moag.gov.il", note:"Widely raised domestically." },
  bird:        { src:"Israeli poultry wholesale market",          url:"https://www.moag.gov.il", note:"Squab consumption common in Middle Eastern cuisine; local supply." },
  issaron_flour:{ src:"Solet — semolina-grade wheat flour; Israeli supermarket retail (Sugat/Osem semolina)", url:"https://www.osem.co.il", note:"Solet is properly semolina-grade wheat, coarsely ground and sifted — not fine flour (Menachos 27a, Rashi s.v. Solet=Geres; Avos 5:15). Priced at Jerusalem semolina market rates (~NIS 28/kg). R' Naeh baseline: approx 2.4kg per issaron." },
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
const fmtNIS = n=>"₪"+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});

// ── Catalog ───────────────────────────────────────────────────────────────────
const CATALOG = [
  {id:"tamid",group:"Daily & Weekly",hebrew:"תָּמִיד",name:"Korban Tamid",subtitle:"The twice-daily continual offering",source:"Bamidbar 28:3-8",description:"Two yearling male lambs as olah each day with libations and wood. Ketores and menorah oil are listed separately in the communal budget.",components:[{label:"2 lambs (olah) with nesachim",key:"lamb_olah",count:2},{label:"Altar wood",key:"wood",count:1}]},
  {id:"ketores_daily",group:"Daily & Weekly",hebrew:"קְטֹרֶת",name:"Ketores - Daily Incense",subtitle:"Morning and afternoon incense offering",source:"Shemot 30:7-8; Yoma 26b; Kerisos 6a",description:"The 11-spice incense offered twice daily on the golden altar. One of the most expensive communal obligations. Per Kerisos 6a the annual batch is 368 maneh (~184kg): stacte, onycha, galbanum, and frankincense (70 maneh each); myrrh, cassia, spikenard, and saffron (16 maneh each); costus (12 maneh), aromatic bark (3 maneh), cinnamon (9 maneh). Saffron alone — at ~NIS 50/gram wholesale — accounts for over half the total cost. Price reflects a composite calculation across all 11 spices at Jerusalem wholesale rates; annual total ~NIS 782,000 ÷ 730 offerings.",components:[{label:"11-spice blend (full offering)",key:"ketores",count:1}]},
  {id:"menorah_oil",group:"Daily & Weekly",hebrew:"שֶׁמֶן הַמְּנוֹרָה",name:"Menorah Oil",subtitle:"Pure olive oil for the golden menorah",source:"Shemot 27:20; Menachos 89a",description:"Pure beaten olive oil lit each evening (and replenished each morning) in the seven-branched golden menorah. The Talmud (Menachos 89a) records the precise amount used. Approximately half a log per lamp per day for the six outer lamps; the western lamp burned continuously. Total daily consumption approximately 3.5 log of first-pressing olive oil.",components:[{label:"Olive oil (3.5 log daily)",key:"log_oil",count:3.5}]},
  {id:"shabbat",group:"Daily & Weekly",hebrew:"מוּסַף שַׁבָּת",name:"Mussaf Shabbos",subtitle:"Additional offering for the Sabbath",source:"Bamidbar 28:9-10",description:"Two yearling male lambs as olah with nesachim, plus lechem hapanim.",components:[{label:"2 lambs (olah) with nesachim",key:"lamb_olah",count:2},{label:"Lechem hapanim (24 issaron)",key:"issaron_flour",count:24}]},
  {id:"rosh_chodesh",group:"Daily & Weekly",hebrew:"רֹאשׁ חֹדֶשׁ",name:"Mussaf Rosh Chodesh",subtitle:"Additional offering for the new month",source:"Bamidbar 28:11-15",description:"Two bulls, one ram, seven lambs as olah with nesachim, plus one goat as chatas.",components:[{label:"2 bulls (olah) with nesachim",key:"bull_olah",count:2},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}]},
  {id:"pesach",group:"Pilgrimage Festivals",hebrew:"פֶּסַח",name:"Korban Pesach",subtitle:"Paschal offering (14 Nisan)",source:"Shemot 12; Bamidbar 9",description:"A yearling lamb or kid, roasted whole, eaten by a registered group on the night of the 15th.",components:[{label:"1 lamb (pesach)",key:"lamb",count:1}]},
  {id:"chagigah_14",group:"Pilgrimage Festivals",hebrew:"חֲגִיגַת י\"ד",name:"Chagigat 14 Nisan",subtitle:"The supplementary festive offering on Erev Pesach",source:"Pesachim 70a-71a; Rambam Hilchos Korban Pesach 10:12",description:"When 14 Nisan falls on a weekday, a shelamim is brought alongside the Korban Pesach to supplement the seder meal, ensuring there is additional meat so that the Korban Pesach is eaten al hasova (on satiety) rather than out of hunger. Brought only on 14 Nisan, unlike the standard chagigah which is brought on the first day of the regel. Eaten on the night of the 15th before the Pesach itself.",components:[{label:"1 ram (shelamim) with nesachim",key:"ram_olah",count:1}]},
  {id:"pesach_mussaf_day",group:"Pilgrimage Festivals",hebrew:"מוּסַף פֶּסַח",name:"Mussaf of Pesach - one day",subtitle:"Per day, for each of the 7 days",source:"Bamidbar 28:19-24",description:"2 bulls, 1 ram, 7 lambs as olah with nesachim, and 1 goat as chatas.",components:[{label:"2 bulls (olah) with nesachim",key:"bull_olah",count:2},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}]},
  {id:"omer",group:"Pilgrimage Festivals",hebrew:"עֹמֶר",name:"Korban HaOmer",subtitle:"Barley wave-offering (16 Nisan)",source:"Vayikra 23:9-14",description:"One issaron of barley flour with a yearling male lamb as olah and its libation.",components:[{label:"1 issaron barley flour",key:"issaron_flour",count:1},{label:"1 lamb (olah) with nesachim",key:"lamb_olah",count:1}]},
  {id:"shavuot",group:"Pilgrimage Festivals",hebrew:"שָׁבֻעוֹת",name:"Shavuos - Full Day",subtitle:"Including the Two Loaves and peace offerings",source:"Vayikra 23:15-21; Bamidbar 28:26-31",description:"Shtei HaLechem with 2 lambs as shelamim, plus full mussaf and chatas.",components:[{label:"Shtei HaLechem (4 issaron)",key:"issaron_flour",count:4},{label:"2 lambs (shelamim)",key:"lamb_olah",count:2},{label:"Mussaf: 7 lambs",key:"lamb_olah",count:7},{label:"Mussaf: 1 bull",key:"bull_olah",count:1},{label:"Mussaf: 2 rams",key:"ram_olah",count:2},{label:"Bamidbar 28: 2 bulls",key:"bull_olah",count:2},{label:"Bamidbar 28: 1 ram",key:"ram_olah",count:1},{label:"Bamidbar 28: 7 lambs",key:"lamb_olah",count:7},{label:"2 goats (chatas)",key:"goat",count:2}]},
  {id:"rosh_hashanah",group:"Pilgrimage Festivals",hebrew:"רֹאשׁ הַשָּׁנָה",name:"Mussaf Rosh Hashana",subtitle:"New Year additional offering",source:"Bamidbar 29:1-6",description:"1 bull, 1 ram, 7 lambs as olah with nesachim, plus 1 goat as chatas.",components:[{label:"1 bull (olah) with nesachim",key:"bull_olah",count:1},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}]},
  {id:"yom_kippur",group:"Pilgrimage Festivals",hebrew:"יוֹם הַכִּפּוּרִים",name:"Yom Kippur - Full Service",subtitle:"The avodah of the Kohen Gadol",source:"Vayikra 16; Bamidbar 29:7-11",description:"The high priest's personal bull, two goats, two rams, and communal mussaf.",components:[{label:"Kohen Gadol's bull (chatas)",key:"bull",count:1},{label:"2 goats (chatas + Azazel)",key:"goat",count:2},{label:"2 rams (olah) with nesachim",key:"ram_olah",count:2},{label:"Mussaf: 1 bull",key:"bull_olah",count:1},{label:"Mussaf: 1 ram",key:"ram_olah",count:1},{label:"Mussaf: 7 lambs",key:"lamb_olah",count:7},{label:"Mussaf goat (chatas)",key:"goat",count:1},{label:"Ketores",key:"frankincense",count:4}]},
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
  {id:"nazir",group:"Individual Offerings",hebrew:"נָזִיר",name:"Korbanos Nazir - End of Nazirite Vow",subtitle:"At the completion of the vow",source:"Bamidbar 6:13-20",description:"1 male lamb (olah), 1 ewe-lamb (chatas), 1 ram (shelamim), basket of matzos.",components:[{label:"1 male lamb (olah) with nesachim",key:"lamb_olah",count:1},{label:"1 ewe-lamb (chatas)",key:"lamb",count:1},{label:"1 ram (shelamim) with nesachim",key:"ram_olah",count:1},{label:"Basket of matzos (~6 issaron)",key:"issaron_flour",count:6},{label:"Oil (~2 log)",key:"log_oil",count:2}]},
];
const GROUPS = [{id:"Daily & Weekly",tkey:"grp_daily"},{id:"Pilgrimage Festivals",tkey:"grp_pilgrimage"},{id:"Individual Offerings",tkey:"grp_individual"}];

// ── Communal offerings (funded by chatzi shekel pool) ─────────────────────────
const COMMUNAL_OFFERINGS = [
  { id:"c_tamid",    label:"Korban Tamid",        hebrew:"תָּמִיד",           source:"Bamidbar 28:3-8",   note:"2 lambs daily × 365 days, with full nesachim and wood. Ketores and menorah oil are listed as separate communal line items.",           count:365, catalogId:"tamid" },
  { id:"c_shabbat",  label:"Mussaf Shabbos",        hebrew:"מוּסַף שַׁבָּת",   source:"Bamidbar 28:9-10",  note:"52 Shabbosos × (2 lambs with nesachim + lechem hapanim).",                                count:52,  catalogId:"shabbat" },
  { id:"c_rch",      label:"Mussaf Rosh Chodesh",   hebrew:"רֹאשׁ חֹדֶשׁ",    source:"Bamidbar 28:11-15", note:"12 Rosh Chodesh months × full mussaf (2 bulls, 1 ram, 7 lambs, 1 goat).",                  count:12,  catalogId:"rosh_chodesh" },
  { id:"c_pesach",   label:"Mussaf Pesach",         hebrew:"מוּסַף פֶּסַח",    source:"Bamidbar 28:19-24", note:"7 days × full mussaf. Does not include the individual Korban Pesach.",                    count:7,   catalogId:"pesach_mussaf_day" },
  { id:"c_omer",     label:"Korban HaOmer",        hebrew:"עֹמֶר",            source:"Vayikra 23:9-14",   note:"Brought once on 16 Nisan.",                                                              count:1,   catalogId:"omer" },
  { id:"c_shavuot",  label:"Shavuos Full Mussaf",   hebrew:"שָׁבֻעוֹת",        source:"Vayikra 23:15-21",  note:"Includes Shtei HaLechem, shelamim, full mussaf.",                                         count:1,   catalogId:"shavuot" },
  { id:"c_rh",       label:"Mussaf Rosh Hashana",   hebrew:"רֹאשׁ הַשָּׁנָה",  source:"Bamidbar 29:1-6",   note:"1 bull, 1 ram, 7 lambs, 1 goat.",                                                        count:1,   catalogId:"rosh_hashanah" },
  { id:"c_yk",       label:"Yom Kippur Service",   hebrew:"יוֹם הַכִּפּוּרִים",source:"Vayikra 16",        note:"Communal portion: 2 goats (chatas + Azazel), plus communal mussaf. The Kohen Gadol's personal bull is not from the public fund.", count:1, catalogId:"yom_kippur" },
  { id:"c_sukkot",   label:"Mussaf Sukkos - All 7", hebrew:"סֻכּוֹת",          source:"Bamidbar 29:12-34", note:"70 bulls, 14 rams, 98 lambs over 7 days. Represents atonement for the 70 nations.",      count:1,   catalogId:"sukkot_all" },
  { id:"c_atzeret",  label:"Shemini Atzeres",      hebrew:"שְׁמִינִי עֲצֶרֶת",source:"Bamidbar 29:35-38", note:"1 bull, 1 ram, 7 lambs, 1 goat. A modest intimate offering after the abundance of Sukkos.", count:1, catalogId:"shemini_atzeret" },
  { id:"c_ketores",  label:"Ketores - Daily Incense",  hebrew:"קְטֹרֶת",            source:"Shemot 30:7-8; Kerisos 6a",  note:"Offered twice daily (morning and afternoon) — 730 offerings per year. The 11-spice formula (368 maneh annually) is fixed by Torah. Saffron alone accounts for over half the cost. Composite price of ~NIS 1,072 per offering based on Jerusalem wholesale rates for all 11 spices.", count:365, catalogId:"ketores_daily" },
  { id:"c_menorah",  label:"Menorah Oil",               hebrew:"שֶׁמֶן הַמְּנוֹרָה", source:"Shemot 27:20; Menachos 89a",  note:"Pure beaten first-pressing olive oil for the seven-branched golden menorah. Approximately 3.5 log per day. Requires exclusively first-pressing quality oil — significantly more expensive than standard olive oil.", count:365, catalogId:"menorah_oil" },
];

// ── Violation examples ────────────────────────────────────────────────────────
const V = {
  chatas_total:{
    kareis:[
      {act:"Pushed a stroller outside the valid eruv boundary on Shabbos",detail:"Hotzaah — carrying in a public domain; d'oraisa melacha carrying kareis"},
      {act:"Picked an apple from a tree on Shabbos b'shogeg",detail:"Tolesh — detaching a fruit from its source is a toladah of Kotzer (reaping), a d'oraisa melacha carrying kareis"},
      {act:"Wrote a note, forgetting it was Shabbos",detail:"Kotev — shogeg Shabbos, classic kareis case"},
      {act:"Lit a candle on Shabbos, momentarily forgetting the day",detail:"Mav'ir — kindling fire; d'oraisa melacha carrying kareis. No electricity controversy — this is the classic case."},
      {act:"Sorted items on Shabbos not knowing borer applies",detail:"Borer — taking pesoles from ochel without immediate use; d'oraisa, commonly unknown"},
      {act:"Smeared ointment on Shabbos not knowing memareiach applies",detail:"Toladah of memachek; d'oraisa, often unknown"},
      {act:"Relations with wife not knowing she had become niddah",detail:"Niddah carries kareis; lo yada — didn't know her status had changed"},
      {act:"Ate a dish of meat cooked in butter b'shogeg, thinking it was pareve",detail:"D'oraisa basar b'chalav. Whether eating (as opposed to cooking) carries kareis is disputed among Rishonim — the Rambam holds it does (Hilchos Maachalos Asuros 9:1); others disagree. Included here per the Rambam's position."},
      {act:"Had relations mistaking a woman for his wife who was in fact an ervah",detail:"Ta'us — mistaken identity; arayos carries kareis (Kerisus 2a)"},
      {act:"Ate chelev (forbidden fat) thinking it was permitted",detail:"Chelev carries kareis; confused it with permitted fat (Vayikra 4:27)"},
      {act:"Ate chametz on Pesach thinking it was kosher l'Pesach",detail:"Chametz on Pesach carries kareis (Shemos 12:15); common inadvertent violation"},
      {act:"Ate blood in a dish unknowingly",detail:"Dam carries kareis (Vayikra 7:27); often concealed in cooked dishes"},
      {act:"Cooked a meal on Yom Kippur genuinely forgetting the date",detail:"Bishul on Yom Kippur carries kareis (Vayikra 23:30); distinct from Shabbos context"},
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

// ── Hebrew Calendar (pure JS, no external library) ───────────────────────────
function gregToAbs(date){
  const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();
  const lp=(y%4===0&&y%100!==0)||y%400===0;
  const ml=[0,31,lp?29:28,31,30,31,30,31,31,30,31,30,31];
  let n=365*(y-1)+Math.floor((y-1)/4)-Math.floor((y-1)/100)+Math.floor((y-1)/400);
  for(let i=1;i<m;i++) n+=ml[i];
  return n+d;
}
function absToGreg(abs){
  let y=Math.floor(abs/365.2425)+1;
  const ga=(y)=>{const lp=(y%4===0&&y%100!==0)||y%400===0;return 365*(y-1)+Math.floor((y-1)/4)-Math.floor((y-1)/100)+Math.floor((y-1)/400)+(lp?366:365)+1;};
  const gb=(y)=>{return 365*(y-1)+Math.floor((y-1)/4)-Math.floor((y-1)/100)+Math.floor((y-1)/400)+1;};
  while(gb(y+1)<=abs)y++;while(gb(y)>abs)y--;
  const lp=(y%4===0&&y%100!==0)||y%400===0;
  const ml=[0,31,lp?29:28,31,30,31,30,31,31,30,31,30,31];
  let rem=abs-gb(y);let mo=1;
  while(mo<=12&&rem>=ml[mo]){rem-=ml[mo];mo++;}
  return new Date(y,mo-1,rem+1);
}
function hElapsed(y){const m=Math.floor((235*y-234)/19);const p=12084+13753*m;let d=m*29+Math.floor(p/25920);if((3*(d+1))%7<3)d++;return d;}
const H_EPOCH=-1373427;
function hNewYear(y){return hElapsed(y)+H_EPOCH;}
function isHLeap(y){return(7*y+1)%19<7;}
function hYearLen(y){return hNewYear(y+1)-hNewYear(y);}
function hMonthInfo(y){
  const yl=hYearLen(y);const il=isHLeap(y);const lc=yl%10===5;const sk=yl%10===3;
  return il
    ?[{m:7,d:30},{m:8,d:lc?30:29},{m:9,d:sk?29:30},{m:10,d:29},{m:11,d:30},{m:12,d:30},{m:13,d:29},{m:1,d:30},{m:2,d:29},{m:3,d:30},{m:4,d:29},{m:5,d:30},{m:6,d:29}]
    :[{m:7,d:30},{m:8,d:lc?30:29},{m:9,d:sk?29:30},{m:10,d:29},{m:11,d:30},{m:12,d:29},{m:1,d:30},{m:2,d:29},{m:3,d:30},{m:4,d:29},{m:5,d:30},{m:6,d:29}];
}
function hebrewToAbs(y,m,d){
  const ny=hNewYear(y);const mi=hMonthInfo(y);let dbm=0;
  for(const e of mi){if(e.m===m)break;dbm+=e.d;}
  return ny+dbm+(d-1);
}
function absToHebrew(abs){
  let year=Math.floor((abs-H_EPOCH)/365.2468)+1;
  while(hNewYear(year+1)<=abs)year++;while(hNewYear(year)>abs)year--;
  const ny=hNewYear(year);const mi=hMonthInfo(year);
  let dayOfYear=abs-ny;let hm=7,hd=1;
  for(const{m,d}of mi){if(dayOfYear<d){hm=m;hd=dayOfYear+1;break;}dayOfYear-=d;}
  return{year,month:hm,day:hd,dow:abs%7,isLeap:isHLeap(year)};
}
// Nisan-first month number to name
const LANG_LOCALE={en:"en-US",he:"he-IL",es:"es-ES",fr:"fr-FR",ru:"ru-RU"};
const H_MONTH_NAMES_EN=['','Nisan','Iyyar','Sivan','Tammuz','Av','Elul','Tishrei','Cheshvan','Kislev','Tevet','Shevat','Adar','Adar II'];
const H_MONTH_NAMES_HE=['','ניסן','אייר','סיון','תמוז','אב','אלול','תשרי','חשון','כסלו','טבת','שבט','אדר','אדר ב'];
const H_MONTH_NAMES_ES=['','Nisán','Iyar','Siván','Tamuz','Av','Elul','Tishrei','Jeshván','Kislev','Tevet','Shvat','Adar','Adar II'];
const H_MONTH_NAMES_FR=['','Nissan','Iyar','Sivane','Tamouz','Av','Eloul','Tichri','Hechvane','Kislev','Tevet','Chevat','Adar','Adar II'];
const H_MONTH_NAMES_RU=['','Нисан','Ияр','Сиван','Тамуз','Ав','Элул','Тишрей','Хешван','Кислев','Тевет','Шват','Адар','Адар II'];
// Month constants (Nisan=1)
const HM={NISAN:1,IYYAR:2,SIVAN:3,TAMMUZ:4,AV:5,ELUL:6,TISHREI:7,CHESHVAN:8,KISLEV:9,TEVET:10,SHEVAT:11,ADAR:12,ADAR_II:13};

// ── Categories ────────────────────────────────────────────────────────────────

// ── Translations ──────────────────────────────────────────────────────────────
const TR = {
  header_sub:    {en:"A modern-day price calculator for the sacrifices of the Temple. All prices based on Jerusalem market rates.", he:"מחשבון מחירים עדכני לקרבנות בית המקדש. כל המחירים על פי שערי השוק בירושלים.", es:"Una calculadora de precios moderna para los sacrificios del Templo. Precios basados en tarifas de mercado de Jerusalén.", fr:"Un calculateur de prix moderne pour les sacrifices du Temple. Tous les prix basés sur les tarifs du marché de Jérusalem.", ru:"Современный калькулятор цен жертвоприношений Храма. Все цены основаны на рыночных ценах Иерусалима."},
  tab_annual:    {en:"My Annual Bill",           he:"החשבון השנתי שלי",      es:"Mi Presupuesto Anual",       fr:"Mon Budget Annuel",          ru:"Мой Годовой Счёт"},
  tab_communal:  {en:"Annual Communal Budget",   he:"תקציב הציבור השנתי",    es:"Presupuesto Comunal Anual",  fr:"Budget Communautaire Annuel", ru:"Годовой Общественный Бюджет"},
  tab_today:     {en:"Today's Communal Costs",   he:"עלות הקרבנות היום",     es:"Costos Comunales de Hoy",    fr:"Coûts Communautaires Aujourd'hui", ru:"Сегодняшние Общественные Расходы"},
  tab_catalog:   {en:"Full Catalog",             he:"קטלוג מלא",             es:"Catálogo Completo",          fr:"Catalogue Complet",          ru:"Полный Каталог"},
  tab_prices:    {en:"Prices & Sources",         he:"מחירים ומקורות",        es:"Precios y Fuentes",          fr:"Prix et Sources",             ru:"Цены и Источники"},
  strip_live:    {en:"Live:",    he:"מיקום:",      es:"En vivo:",   fr:"En direct:",  ru:"Онлайн:"},
  strip_ey:      {en:"Eretz Yisroel", he:"ארץ ישראל",  es:"Eretz Yisroel", fr:"Eretz Yisroel", ru:"Эрец Исраэль"},
  strip_cla:     {en:"Chutz L'Aretz", he:"חוץ לארץ",  es:"Diáspora",       fr:"Diaspora",       ru:"Диаспора"},
  strip_standing:{en:"Standing:", he:"מעמד:",    es:"Nivel:",     fr:"Niveau:",     ru:"Уровень:"},
  strip_shiur:   {en:"Shiur:",   he:"שיעור:",    es:"Shiur:",     fr:"Shiur:",      ru:"Шиур:"},
  strip_silver:  {en:"Silver:",  he:"כסף:",      es:"Plata:",     fr:"Argent:",     ru:"Серебро:"},
  strip_rate:    {en:"Rate:",    he:"שע׳׳ח:",    es:"Cambio:",    fr:"Taux:",       ru:"Курс:"},
  strip_close:   {en:"Close",   he:"סגור",       es:"Cerrar",     fr:"Fermer",      ru:"Закрыть"},
  strip_assumptions:{en:"Assumptions", he:"הגדרות",  es:"Supuestos",  fr:"Hypothèses",  ru:"Настройки"},
  set_location:  {en:"Location",      he:"מיקום",    es:"Ubicación",  fr:"Localisation",ru:"Местоположение"},
  set_ey_check:  {en:"I live in Eretz Yisroel", he:"אני גר בארץ ישראל", es:"Vivo en Eretz Yisroel", fr:"Je vis en Eretz Yisroel", ru:"Я живу в Эрец Исраэль"},
  set_ey_note:   {en:"Travel costs and travel-related todaos removed.", he:"עלויות נסיעה ותודות הוסרו.", es:"Costos de viaje eliminados.", fr:"Frais de voyage supprimés.", ru:"Транспортные расходы удалены."},
  set_landowner: {en:"I own agricultural land (obligated in Bikkurim)", he:"יש לי שדות חקלאיים (חייב בביכורים)", es:"Tengo tierras agrícolas (obligado en Bikkurim)", fr:"Je possède des terres agricoles (Bikkourim)", ru:"Я владею сельскохозяйственными землями (Бикурим)"},
  set_standing:  {en:"Financial Standing", he:"מעמד כלכלי",   es:"Situación Económica", fr:"Situation Financière", ru:"Финансовое Положение"},
  set_shiur:     {en:"Shiur - Halachic Measurement Standard", he:"שיעור — מידות הלכתיות", es:"Shiur - Medida Halachica", fr:"Shiur - Mesure Halakhique", ru:"Шиур — Алахический Стандарт"},
  set_silver:    {en:"Silver Price (Chatzi Shekel & Pidyon HaBen)", he:"מחיר הכסף (מחצית השקל ופדיון הבן)", es:"Precio de la Plata", fr:"Prix de l'Argent", ru:"Цена Серебра"},
  set_rate:      {en:"USD / NIS Exchange Rate", he:"שער דולר / שקל", es:"Tipo de Cambio USD/NIS", fr:"Taux de Change USD/NIS", ru:"Курс USD/NIS"},
  set_travel:    {en:"Travel Assumptions", he:"הגדרות נסיעה", es:"Supuestos de Viaje", fr:"Hypothèses de Voyage", ru:"Настройки Поездки"},
  set_include_travel:{en:"Include travel in total", he:"כלול נסיעות בסכום", es:"Incluir viaje en total", fr:"Inclure le voyage", ru:"Включить поездку"},
  set_reset:     {en:"Reset Defaults", he:"אפס",  es:"Restablecer",  fr:"Réinitialiser", ru:"Сбросить"},
  regalim_q:     {en:"Which of the Shalosh Regalim are you ascending to Yerushalayim?", he:"לאילו מן השלוש רגלים אתה עולה לירושלים?", es:"¿A cuáles de los tres regalim asciende a Jerusalén?", fr:"Auxquels des trois Regalim montez-vous à Jérusalem?", ru:"На какие из трёх Регалим вы восходите в Иерусалим?"},
  regalim_all:   {en:"All three regalim — travel and korbanos included.", he:"שלושת הרגלים — נסיעות וקרבנות כלולים.", es:"Los tres regalim — viaje y korbanot incluidos.", fr:"Les trois regalim — voyages et korbanot inclus.", ru:"Все три Регалим — поездки и корбанот включены."},
  bitul_title:   {en:"Bitul Aseh — Torah Obligation Not Fulfilled", he:"ביטול עשה", es:"Bitul Aseh — Obligación No Cumplida", fr:"Bitul Aseh — Obligation Non Accomplie", ru:"Битул Асэ — Невыполненная Обязанность"},
  cat_fixed:     {en:"Non-negotiable obligations. Every adult male owes the chatzi shekel and regalim offerings annually.", he:"חובות קבועות. כל גבר בוגר חייב במחצית השקל ובקרבנות הרגלים.", es:"Obligaciones fijas. Todo hombre adulto debe el chatzi shekel y las ofrendas de los regalim.", fr:"Obligations fixes. Tout homme adulte doit le chatzi shekel et les offrandes des regalim.", ru:"Постоянные обязанности. Каждый взрослый мужчина обязан чаци-шекелем и жертвами рагалим."},
  cat_personal:  {en:"Inadvertent violations of kareis prohibitions. Set the scrutiny slider, then adjust as needed.", he:"עבירות שגגה של איסורי כרת.", es:"Violaciones inadvertidas de prohibiciones de kareis.", fr:"Violations involontaires des interdits passibles de kareis.", ru:"Непреднамеренные нарушения запретов карет."},
  cat_todah:     {en:"Baseline of 2 for illness and other travel. Optionally add 2 per regel.", he:"בסיס של 2 למחלה ונסיעות.", es:"Base de 2 por enfermedad y viaje.", fr:"Base de 2 pour maladie et voyage.", ru:"Базово 2 за болезнь и поездку."},
  cat_life:      {en:"Not obligatory every year — brought as life events occur. All default to zero.", he:"אינן חובה כל שנה — מובאות עם אירועי חיים.", es:"No obligatorio cada año — según eventos de vida.", fr:"Pas obligatoire chaque année — selon les événements.", ru:"Необязательно каждый год — по жизненным событиям."},
  cat_travel:    {en:"Round-trips New York to Jerusalem for the regalim.", he:"נסיעות הלוך-חזור מניו יורק לירושלים.", es:"Viajes de ida y vuelta Nueva York-Jerusalén.", fr:"Allers-retours New York-Jérusalem pour les regalim.", ru:"Перелёты Нью-Йорк — Иерусалим туда и обратно."},
  estimated_total:{en:"Estimated Annual Total", he:"סכום שנתי משוער", es:"Total Anual Estimado", fr:"Total Annuel Estimé", ru:"Расчётный Годовой Итог"},
  cost_breakdown: {en:"Cost Breakdown",          he:"פירוט עלויות",   es:"Desglose de Costos", fr:"Ventilation des Coûts", ru:"Разбивка по Расходам"},
  reset:         {en:"RESET",  he:"אפס",  es:"REINICIAR", fr:"RÉINITIALISER", ru:"СБРОСИТЬ"},
  why_number:    {en:"why this number?", he:"למה המספר הזה?", es:"¿por qué este número?", fr:"pourquoi ce nombre?", ru:"почему это число?"},
  hide_rationale:{en:"hide rationale",  he:"הסתר הסבר",     es:"ocultar explicación", fr:"masquer l'explication", ru:"скрыть объяснение"},
  sample_violations:{en:"sample violations", he:"דוגמאות לעבירות", es:"ejemplos de violaciones", fr:"exemples de violations", ru:"примеры нарушений"},
  hide_examples: {en:"hide examples",   he:"הסתר דוגמאות",  es:"ocultar ejemplos",   fr:"masquer les exemples",  ru:"скрыть примеры"},
  set_by_regalim:{en:"set by regalim",  he:"נקבע לפי הרגל", es:"según los regalim",  fr:"selon les regalim",     ru:"по регалим"},
  scrutiny_lbl:  {en:"Level of Self-Scrutiny", he:"רמת בדיקה עצמית", es:"Nivel de Autoexamen", fr:"Niveau d'Examen", ru:"Уровень Самопроверки"},
  scrutiny_min:  {en:"Minimal",   he:"מינימלי", es:"Mínimo",    fr:"Minimal",    ru:"Минимальный"},
  scrutiny_avg:  {en:"Average",   he:"ממוצע",   es:"Promedio",  fr:"Moyen",      ru:"Средний"},
  scrutiny_careful:{en:"Careful", he:"זהיר",    es:"Cuidadoso", fr:"Prudent",    ru:"Осторожный"},
  scrutiny_yerei:{en:"Yerei Shomayim", he:"ירא שמים", es:"Yerei Shomayim", fr:"Yerei Shomayim", ru:"Йерей Шамаим"},
  scrutiny_exc:  {en:"Exceptional", he:"יוצא מן הכלל", es:"Excepcional", fr:"Exceptionnel", ru:"Исключительный"},
  today_total:   {en:"Total —",  he:"סך הכל —", es:"Total —",  fr:"Total —",   ru:"Итого —"},
  today_public:  {en:"Public korbanos only · current Jerusalem prices", he:"קרבנות ציבוריים בלבד · מחירי ירושלים", es:"Solo korbanot públicos · precios de Jerusalén", fr:"Korbanot publics uniquement · prix de Jérusalem", ru:"Только общественные корбанот · цены Иерусалима"},
  jump_to:       {en:"Jump to next", he:"קפוץ ל", es:"Ir a", fr:"Aller au", ru:"Перейти к"},
  today_btn:     {en:"Today",    he:"היום",     es:"Hoy",     fr:"Aujourd'hui", ru:"Сегодня"},
  maarachah:     {en:"Ma'arachah — overnight fire:", he:"מערכה — אש הלילה:", es:"Ma'arachah — fuego nocturno:", fr:"Ma'arachah — feu de nuit:", ru:"Маарахá — ночной огонь:"},
  chatzi_pool:   {en:"The Chatzi Shekel Pool", he:"קופת מחצית השקל", es:"El Fondo del Chatzi Shekel", fr:"Le Fonds du Chatzi Shekel", ru:"Фонд Чаци-Шекеля"},
  annual_offerings:{en:"Annual Communal Offerings", he:"קרבנות ציבוריים שנתיים", es:"Ofrendas Comunales Anuales", fr:"Offrandes Communautaires Annuelles", ru:"Ежегодные Общественные Жертвоприношения"},
  total_annual:  {en:"Total Annual Communal Cost", he:"עלות ציבורית שנתית כוללת", es:"Costo Comunal Anual Total", fr:"Coût Communautaire Annuel Total", ru:"Общий Годовой Общественный Расход"},
  per_capita:    {en:"Per Capita Cost",   he:"עלות לנפש",         es:"Costo Per Cápita",   fr:"Coût Par Personne",   ru:"На душу населения"},
  actual_chatzi: {en:"Actual Chatzi Shekel", he:"מחצית השקל בפועל", es:"Chatzi Shekel Real",  fr:"Chatzi Shekel Réel",  ru:"Реальный Чаци-Шекель"},
  subsidy:       {en:"Subsidy per Person", he:"סובסידיה לנפש",    es:"Subsidio por Persona",fr:"Subvention par Personne", ru:"Субсидия на Человека"},
  show_components:{en:"show components", he:"הצג רכיבים",  es:"mostrar componentes", fr:"voir les composants", ru:"показать компоненты"},
  hide_breakdown:{en:"hide breakdown",   he:"הסתר פירוט",  es:"ocultar desglose",    fr:"masquer le détail",   ru:"скрыть разбивку"},

  // Catalog tab

  // Jump group headers
  jmp_regular:   {en:"Regular",       he:"רגיל",          es:"Regular",         fr:"Régulier",        ru:"Обычные"},
  jmp_yamim:     {en:"Yamim Noraim",  he:"ימים נוראים",   es:"Yamim Noraim",    fr:"Yamim Noraïm",    ru:"Ямим Нораим"},
  jmp_next_wkdy: {en:"Next Weekday",  he:"יום חול הבא",   es:"Próximo día hábil",fr:"Prochain jour ouvrable",ru:"Следующий будний день"},
  jmp_next_shab: {en:"Next Shabbos",  he:"שבת הבאה",      es:"Próximo Shabat",   fr:"Prochain Chabbat", ru:"Следующий Шаббат"},
  jmp_next_rc:   {en:"Next Rosh Chodesh",he:"ראש חודש הבא",es:"Próximo Rosh Jodesh",fr:"Prochain Roch Hachôdech",ru:"Следующий Рош Ходеш"},
  jmp_14nisan:   {en:"14 Nisan",      he:"י״ד ניסן",      es:"14 Nisán",         fr:"14 Nissan",        ru:"14 Нисана"},
  jmp_omer:      {en:"Day 2 / Omer",  he:"יום ב / עומר",  es:"Día 2 / Omer",     fr:"Jour 2 / Omer",    ru:"День 2 / Омер"},
  jmp_day:       {en:"Day",           he:"יום",            es:"Día",              fr:"Jour",             ru:"День"},
  // Avodah offering labels
  off_tamid_am:  {en:"Tamid (morning) — 1 lamb + nesachim",   he:"תמיד (שחרית) — כבש + נסכים",  es:"Tamid (mañana) — 1 cordero + nesajim",   fr:"Tamid (matin) — 1 agneau + nesakhim",    ru:"Тамид (утро) — 1 ягнёнок + несахим"},
  off_tamid_pm:  {en:"Tamid (afternoon) — 1 lamb + nesachim", he:"תמיד (מנחה) — כבש + נסכים",   es:"Tamid (tarde) — 1 cordero + nesajim",    fr:"Tamid (après-midi) — 1 agneau + nesakhim",ru:"Тамид (день) — 1 ягнёнок + несахим"},
  off_ketores_am:{en:"Ketores (morning)",   he:"קטורת (שחרית)",   es:"Ketores (mañana)",   fr:"Ketores (matin)",   ru:"Кторет (утро)"},
  off_ketores_pm:{en:"Ketores (afternoon)", he:"קטורת (מנחה)",    es:"Ketores (tarde)",    fr:"Ketores (après-midi)",ru:"Кторет (день)"},
  off_menorah:   {en:"Menorah oil — 3.5 log",he:"שמן המנורה — 3.5 לוג",es:"Aceite de la Menorá — 3.5 log",fr:"Huile de la Ménorah — 3.5 log",ru:"Масло меноры — 3.5 лог"},
  off_lechem:    {en:"Lechem HaPanim placed — 24 issaron flour",he:"לחם הפנים — 24 עשרון קמח",es:"Lechem HaPanim — 24 isarón harina",fr:"Lechem HaPanim — 24 issaron farine",ru:"Лехем а-Паним — 24 иссарона муки"},
  off_omer_bar:  {en:"1 issaron barley flour (wave offering)", he:"עשרון קמח שעורים (תנופה)",es:"1 isarón de harina de cebada",fr:"1 issaron de farine d'orge",ru:"1 иссарон ячменной муки"},
  off_lamb_olah: {en:"1 lamb (olah) with nesachim",  he:"כבש עולה + נסכים",  es:"1 cordero (olá) con nesajim",  fr:"1 agneau (ola) avec nesakhim",  ru:"1 ягнёнок (ола) с несахим"},
  off_bull_olah: {en:"bulls (olah) with nesachim",   he:"פרים עולה + נסכים", es:"toros (olá) con nesajim",      fr:"taureaux (ola) avec nesakhim",  ru:"быков (ола) с несахим"},
  off_ram_olah:  {en:"rams (olah) with nesachim",    he:"אילים עולה + נסכים",es:"carneros (olá) con nesajim",   fr:"béliers (ola) avec nesakhim",   ru:"баранов (ола) с несахим"},
  off_lambs_olah:{en:"lambs (olah) with nesachim",   he:"כבשים עולה + נסכים",es:"corderos (olá) con nesajim",   fr:"agneaux (ola) avec nesakhim",   ru:"ягнят (ола) с несахим"},
  off_goat:      {en:"1 goat (chatas)",              he:"שעיר חטאת",         es:"1 cabra (jatát)",              fr:"1 chèvre (hatat)",              ru:"1 козёл (хатат)"},
  off_goats2:    {en:"2 goats — chatas & Azazel",    he:"שני שעירים — חטאת ועזאזל",es:"2 cabras — jatát y Azazel", fr:"2 chèvres — hatat et Azazel",  ru:"2 козла — хатат и Азазель"},
  off_ketores2:  {en:"Ketores — special machta offering (×2)", he:"קטורת — מחתה מיוחדת (×2)", es:"Ketores — ofrenda especial (×2)", fr:"Ketores — offrande spéciale (×2)", ru:"Кторет — особое приношение (×2)"},
  off_shtei_lech:{en:"Shtei HaLechem — 2 wheat loaves (4 issaron)",he:"שתי הלחם — 4 עשרון חיטה",es:"Shtei HaLechem — 4 isarón trigo",fr:"Shtei HaLechem — 4 issaron blé",ru:"Штей а-Лехем — 4 иссарона пшеницы"},
  off_lambs_sht: {en:"2 lambs (shelamim, accompany Shtei HaLechem)",he:"2 כבשים שלמים עם שתי הלחם",es:"2 corderos (shelamim) con Shtei HaLechem",fr:"2 agneaux (shelamim) avec Shtei HaLechem",ru:"2 ягнёнка (шеламим) с Штей а-Лехем"},
  off_rams_olah: {en:"rams (olah) with nesachim",he:"אילים עולה + נסכים",es:"carneros (olá) con nesajim",fr:"béliers (ola) avec nesakhim",ru:"баранов (ола) с несахим"},
  off_goats2_cht:{en:"2 goats (chatas)",he:"שני שעירי חטאת",es:"2 cabras (jatát)",fr:"2 chèvres (hatat)",ru:"2 козла (хатат)"},
  grp_daily:     {en:"Daily & Weekly",         he:"יומי ושבועי",       es:"Diario y Semanal",        fr:"Quotidien et Hebdomadaire", ru:"Ежедневные и Еженедельные"},
  grp_pilgrimage:{en:"Pilgrimage Festivals",   he:"שלוש רגלים",        es:"Festividades de Peregrinación", fr:"Fêtes de Pèlerinage",  ru:"Праздники Паломничества"},
  grp_individual:{en:"Individual Offerings",   he:"קרבנות יחיד",       es:"Ofrendas Individuales",   fr:"Offrandes Individuelles",   ru:"Индивидуальные Жертвы"},


  chatzi_lbl:    {en:"Chatzi shekel:", he:"מחצית השקל:", es:"Chatzi shekel:", fr:"Chatzi shekel:", ru:"Чаци-шекель:"},
  pidyon_lbl:    {en:"Pidyon haben:",  he:"פדיון הבן:",  es:"Pidyon haben:",  fr:"Pidyon haben:",  ru:"Пидьон а-бен:"},



  live_rate:     {en:"live rate",   he:"מחיר חי",   es:"tasa en vivo",  fr:"taux en direct", ru:"онлайн курс"},
  fetching:      {en:"fetching...", he:"טוען...",    es:"cargando...",   fr:"chargement...",  ru:"загрузка..."},
  at_jlm_prices: {en:"at current Jerusalem prices", he:"במחירי ירושלים עדכניים", es:"a precios actuales de Jerusalén", fr:"aux prix actuels de Jérusalem", ru:"по текущим ценам Иерусалима"},
  refresh_lbl:   {en:"Refresh",      he:"רענן",          es:"Actualizar",   fr:"Actualiser",    ru:"Обновить"},
  live_lbl:      {en:"live",         he:"חי",             es:"en vivo",      fr:"en direct",     ru:"онлайн"},
  est_lbl:       {en:"est.",         he:"משוער",          es:"est.",         fr:"est.",           ru:"приблиз."},
  manual_lbl:    {en:"manual",       he:"ידני",           es:"manual",       fr:"manuel",         ru:"вручную"},
  fetch_fail:    {en:"fetch failed — using manual rate", he:"הבאה נכשלה — משתמש בשיעור ידני", es:"error al obtener — usando tasa manual", fr:"échec — taux manuel utilisé", ru:"ошибка загрузки — используется ручной курс"},
  edit_override: {en:"Edit above to override.", he:"ערוך למעלה לשינוי.", es:"Edite arriba para anular.", fr:"Modifiez ci-dessus pour remplacer.", ru:"Отредактируйте выше для замены."},
  bikkurim_auto: {en:"Bikkurim set automatically", he:"ביכורים מוגדרים אוטומטית", es:"Bikkurim configurados automáticamente", fr:"Bikkourim définis automatiquement", ru:"Бикурим установлены автоматически"},
  bikkurim_based:{en:"based on your financial standing:", he:"על פי מעמדך הכלכלי:", es:"según su situación económica:", fr:"selon votre situation financière:", ru:"на основе вашего финансового положения:"},
  at_current:    {en:"at current silver prices", he:"במחירי כסף עדכניים", es:"a precios actuales de plata", fr:"aux prix actuels de l'argent", ru:"по текущим ценам серебра"},
  bitul_note:    {en:"The person who violated a Shabbos prohibition and brings a chatas has a cleaner ledger at year's end than the person who stayed home and saved the airfare, which generally cannot be fixed.", he:"מי שעבר על איסור שבת ומביא חטאת, חשבונו נקי יותר בסוף השנה ממי שנשאר בבית וחסך בדמי הטיסה, שבדרך כלל לא ניתן לתקנם.", es:"La persona que violó una prohibición de Shabat y trae una chatas tiene un registro más limpio al final del año que la persona que se quedó en casa y ahorró el pasaje aéreo, que generalmente no se puede corregir.", fr:"La personne qui a violé une interdiction de Chabbat et apporte une 'hatat a un registre plus propre en fin d'année que celle qui est restée chez elle et a économisé le billet d'avion, ce qui en général ne peut être réparé.", ru:"Человек, нарушивший запрет Шаббата и принёсший хатат, имеет более чистый счёт в конце года, чем тот, кто остался дома и сэкономил на билете, — ведь это, как правило, нельзя исправить."},
  lodging_lbl:   {en:"lodging", he:"לינה", es:"alojamiento", fr:"hébergement", ru:"проживание"},
  nights_lbl:    {en:"nights",  he:"לילות", es:"noches",     fr:"nuits",        ru:"ночей"},
  slider_desc:   {en:"Slider sets the starting quantities below. Adjust freely with +/- after.", he:"המחוון קובע את הכמויות ההתחלתיות למטה. ניתן לשנות בחופשיות עם +/-.", es:"El control deslizante establece las cantidades iniciales. Ajuste libremente con +/-.", fr:"Le curseur définit les quantités initiales. Ajustez librement avec +/-.", ru:"Ползунок задаёт начальные количества. Корректируйте свободно с помощью +/-."},
  travel_excl:   {en:"Travel costs not included —", he:"עלויות נסיעה לא כלולות —", es:"Costos de viaje no incluidos —", fr:"Frais de voyage non inclus —", ru:"Расходы на поездку не включены —"},
  excl_suffix:   {en:"excluded", he:"לא כלול", es:"excluidos", fr:"exclus", ru:"исключено"},
  set_in_assumptions: {en:"set in assumptions", he:"מוגדר בהנחות",    es:"definido en supuestos",   fr:"défini dans les hypothèses", ru:"задано в настройках"},
  auto_lbl:           {en:"auto",               he:"אוטומטי",         es:"auto",                    fr:"auto",                       ru:"авто"},
  baseline_lbl:       {en:"baseline",           he:"בסיס",             es:"base",                    fr:"base",                       ru:"базовый"},
  travel_todah_lbl:   {en:"for", he:"עבור", es:"para", fr:"pour", ru:"за"},
  travel_todah_suf:   {en:"travel", he:"נסיעות", es:"viaje", fr:"voyage", ru:"поездку"},
  offering_lbl:  {en:"offering",               he:"קרבן",              es:"ofrenda",                 fr:"offrande",                  ru:"жертва"},
  offerings_lbl: {en:"offerings",              he:"קרבנות",            es:"ofrendas",                fr:"offrandes",                 ru:"жертвы"},
  cat_total_lbl: {en:"Total —",                he:"סך הכל —",          es:"Total —",                 fr:"Total —",                   ru:"Итого —"},
  per_offering:  {en:"Per Offering",     he:"לקרבן",        es:"Por Ofrenda",         fr:"Par Offrande",        ru:"За Жертву"},
  details:       {en:"details",          he:"פרטים",        es:"detalles",            fr:"détails",             ru:"детали"},
  hide:          {en:"hide",             he:"הסתר",         es:"ocultar",             fr:"masquer",             ru:"скрыть"},
  clear:         {en:"CLEAR",            he:"נקה",           es:"LIMPIAR",             fr:"EFFACER",             ru:"ОЧИСТИТЬ"},

  // Prices tab
  prices_intro:  {en:"All prices are Jerusalem market rates.", he:"כל המחירים על פי שערי השוק בירושלים.", es:"Todos los precios son precios de mercado de Jerusalén.", fr:"Tous les prix sont des prix du marché de Jérusalem.", ru:"Все цены основаны на рыночных ценах Иерусалима."},
  prices_conv:   {en:"korbanos are brought in Jerusalem. NIS prices converted to USD at $1 = NIS", he:"קרבנות מובאים בירושלים. מחירים בשקל מומרים לדולר בשיעור $1 = שקל", es:"Los korbanot se traen en Jerusalén. Precios en NIS convertidos a USD a $1 = NIS", fr:"Les korbanot sont apportés à Jérusalem. Prix en NIS convertis en USD à $1 = NIS", ru:"Корбанот приносятся в Иерусалиме. Цены в NIS конвертированы в USD по курсу $1 = NIS"},
  shiur_impact:  {en:"Shiur impact:", he:"השפעת השיעור:", es:"Impacto del Shiur:", fr:"Impact du Shiur:", ru:"Влияние Шиура:"},
  agr_mult:      {en:"Agricultural items (flour, oil, wine) are x", he:"פריטים חקלאיים (קמח, שמן, יין) הם x", es:"Los artículos agrícolas (harina, aceite, vino) son x", fr:"Les articles agricoles (farine, huile, vin) sont x", ru:"Сельскохозяйственные товары (мука, масло, вино) — x"},
  agr_baseline:  {en:"the R' Naeh baseline.", he:"הבסיס של רב נאה.", es:"la línea de base de R' Naeh.", fr:"la base de référence de R' Naeh.", ru:"относительно базового значения р. Наэ."},
  source_lbl:    {en:"Source", he:"מקור", es:"Fuente", fr:"Source", ru:"Источник"},
  notes_lbl:     {en:"Notes",  he:"הערות", es:"Notas", fr:"Notes",  ru:"Примечания"},
  per_lbl:       {en:"per",    he:"לפי",   es:"por",   fr:"par",    ru:"по"},
  active_shita:  {en:"ACTIVE SHITA:",    he:"שיטה פעילה:",   es:"SHITA ACTIVA:",       fr:"SHITA ACTIVE:",       ru:"АКТИВНАЯ ШИТА:"},
  livestock:     {en:"Livestock",        he:"בהמות",          es:"Ganado",              fr:"Bétail",              ru:"Скот"},
  agricultural:  {en:"Agricultural",     he:"חקלאי",          es:"Agrícola",            fr:"Agricole",            ru:"Сельскохозяйственное"},
  shiur_dep:     {en:"SHIUR-DEPENDENT",  he:"תלוי בשיעור",    es:"DEPENDE DEL SHIUR",   fr:"DÉPEND DU SHIUR",     ru:"ЗАВИСИТ ОТ ШИУРА"},
  fixed_formula: {en:"FIXED FORMULA",    he:"נוסחה קבועה",    es:"FÓRMULA FIJA",        fr:"FORMULE FIXE",        ru:"ФИКСИРОВАННАЯ ФОРМУЛА"},
  halachic_meas: {en:"Halachic Measurement Conversions", he:"המרות מידות הלכתיות", es:"Conversiones de Medidas Halájicas", fr:"Conversions de Mesures Halakhiques", ru:"Перевод Алахических Мер"},
  sources_btn:   {en:"sources",          he:"מקורות",         es:"fuentes",             fr:"sources",             ru:"источники"},
  disclaimer_body:  {en:"Do not rely on anything here for any halachic decision whatsoever. The violation examples, korban obligations, shiur conversions, and price estimates presented here have not been reviewed by any rabbinic authority and may contain errors, oversimplifications, or outright mistakes. All halachic questions must be addressed to a qualified posek.", he:"אין להסתמך על כל מה שמופיע כאן לכל פסיקה הלכתית. הדוגמאות, החיובים, המידות והמחירים לא נבדקו על ידי כל רשות רבנית ועלולים להכיל טעויות. כל שאלה הלכתית יש להפנות לפוסק מוסמך.", es:"No se base en nada aquí para ninguna decisión halájica. Los ejemplos, obligaciones, conversiones de medidas y estimaciones de precios no han sido revisados por ninguna autoridad rabínica y pueden contener errores. Todas las preguntas halájicas deben dirigirse a un posek calificado.", fr:"Ne vous fiez à rien ici pour toute décision halakhique. Les exemples, obligations, conversions de mesures et estimations de prix n'ont pas été examinés par une autorité rabbinique et peuvent contenir des erreurs. Toutes les questions halakhiques doivent être adressées à un posek qualifié.", ru:"Не полагайтесь ни на что здесь для каких-либо алахических решений. Примеры, обязанности, единицы измерения и оценки цен не проверялись раввинскими авторитетами и могут содержать ошибки. Все алахические вопросы следует адресовать квалифицированному поску."},
  disclaimer_title:{en:"For Educational Purposes Only", he:"למטרות חינוכיות בלבד", es:"Solo con Fines Educativos", fr:"À des Fins Éducatives Uniquement", ru:"Только в Образовательных Целях"},

  // Category names (short, for summary bar and headings)
  cat_name_fixed:    {en:"Fixed Obligations",       he:"חובות קבועות",   es:"Obligaciones Fijas",       fr:"Obligations Fixes",          ru:"Постоянные Обязанности"},
  cat_name_personal: {en:"Personal Violations",     he:"עבירות אישיות",  es:"Violaciones Personales",   fr:"Violations Personnelles",    ru:"Личные Нарушения"},
  cat_name_todah:    {en:"Thanksgiving",             he:"תודה",           es:"Acción de Gracias",        fr:"Action de Grâce",            ru:"Благодарность"},
  cat_name_life:     {en:"Life Events & Voluntary",  he:"אירועי חיים",   es:"Eventos de Vida",          fr:"Événements de Vie",          ru:"Жизненные События"},
  cat_name_travel:   {en:"Aliyah L'Regel - Travel",  he:"עלייה לרגל",    es:"Aliyá LaRéguel - Viaje",   fr:"Aliya LaRegel - Voyage",     ru:"Алия Ле-Регель - Поездка"},
  each_lbl:      {en:"each",     he:"כל אחד",  es:"cada uno",  fr:"chaque",  ru:"каждый"},

  // Regalim buttons
  rgl_pesach:    {en:"Pesach",    he:"פֶּסַח",       es:"Pesaj",     fr:"Pessa'h",    ru:"Песах"},
  rgl_shavuos:   {en:"Shavuos",  he:"שָׁבֻעוֹת",     es:"Shavuot",   fr:"Chavouot",   ru:"Шавуот"},
  rgl_sukkos:    {en:"Sukkos",   he:"סֻכּוֹת",        es:"Sucot",     fr:"Soukot",     ru:"Суккот"},
  // Travel settings
  trav_flight:   {en:"Flight / person",  he:"טיסה / אדם",     es:"Vuelo / persona",  fr:"Vol / personne",    ru:"Перелёт / чел."},
  trav_hotel:    {en:"Nightly hotel",    he:"לינה ללילה",     es:"Hotel por noche",   fr:"Hôtel par nuit",    ru:"Отель / ночь"},
  trav_extra:    {en:"Extra travelers",  he:"מטיילים נוספים", es:"Viajeros extra",    fr:"Voyageurs supp.",   ru:"Доп. путешественники"},
  trav_beyond:   {en:"beyond self",      he:"מעבר לעצמך",     es:"aparte de uno mismo",fr:"en plus de soi",   ru:"кроме себя"},
  trav_pesach_n: {en:"Pesach nights",    he:"לילות פסח",      es:"Noches de Pesaj",  fr:"Nuits de Pessa'h",  ru:"Ночи Песаха"},
  trav_shavuos_n:{en:"Shavuos nights",   he:"לילות שבועות",   es:"Noches de Shavuot",fr:"Nuits de Chavouot", ru:"Ночи Шавуота"},
  trav_sukkos_n: {en:"Sukkos nights",    he:"לילות סוכות",    es:"Noches de Sucot",  fr:"Nuits de Soukot",   ru:"Ночи Суккота"},
  // Financial tiers
  tier_average:  {en:"Average",          he:"בינוני",          es:"Promedio",          fr:"Moyen",             ru:"Средний"},
  tier_poor:     {en:"Poor (Ani)",       he:"עני",             es:"Pobre (Ani)",       fr:"Pauvre (Ani)",      ru:"Бедный (Ани)"},
  tier_avg:      {en:"Average",          he:"בינוני",          es:"Promedio",          fr:"Moyen",             ru:"Средний"},
  tier_wealthy:  {en:"Wealthy (Ashir)",  he:"עשיר",            es:"Rico (Ashir)",      fr:"Riche (Ashir)",     ru:"Богатый (Ашир)"},
  // Today tab day labels
  day_weekday:   {en:"Weekday",          he:"יום חול",         es:"Día de semana",     fr:"Jour de semaine",   ru:"Будний день"},
  day_shabbos:   {en:"Shabbos",          he:"שַׁבָּת",          es:"Shabat",            fr:"Chabbat",           ru:"Шаббат"},
  day_rc:        {en:"Rosh Chodesh",     he:"רֹאשׁ חֹדֶשׁ",   es:"Rosh Jodesh",       fr:"Roch Hachôdech",    ru:"Рош Ходеш"},
  day_shabbos_rc:{en:"Shabbos Rosh Chodesh", he:"שבת ראש חודש", es:"Shabat Rosh Jodesh",fr:"Chabbat Roch Hachôdech",ru:"Шаббат Рош Ходеш"},
  day_14nisan:   {en:"14 Nisan — Erev Pesach", he:"י׳׳ד ניסן — ערב פסח", es:"14 Nisán — Erev Pesaj",fr:"14 Nissan — Erev Pessa'h",ru:"14 Нисана — Канун Песаха"},
  day_yomkippur: {en:"Yom Kippur",       he:"יוֹם כִּפּוּר",  es:"Yom Kipur",         fr:"Yom Kippour",       ru:"Йом Кипур"},
  day_shemini:   {en:"Shemini Atzeres",  he:"שְׁמִינִי עֲצֶרֶת",es:"Shemini Atzeret", fr:"Chemini Atseret",   ru:"Шмини Ацерет"},
  day_rh:        {en:"Rosh Hashana",     he:"רֹאשׁ הַשָּׁנָה", es:"Rosh Hashaná",     fr:"Roch Hachana",      ru:"Рош а-Шана"},
  day_rh_shab:   {en:"Rosh Hashana & Shabbos", he:"ראש השנה ושבת", es:"Rosh Hashaná y Shabat",fr:"Roch Hachana et Chabbat",ru:"Рош а-Шана и Шаббат"},
  day_shavuos:   {en:"Shavuos",          he:"שָׁבֻעוֹת",       es:"Shavuot",           fr:"Chavouot",          ru:"Шавуот"},
  // Today block titles
  blk_shacharit: {en:"Shacharit",        he:"שַׁחֲרִית",        es:"Shajarit",          fr:"Chaharit",          ru:"Шахарит"},
  blk_omer:      {en:"Korban HaOmer",    he:"קָרְבַּן הָעֹמֶר", es:"Korban HaOmer",    fr:"Korban HaOmer",     ru:"Корбан а-Омер"},
  blk_mussaf:    {en:"Mussaf",   he:"מוסף",  es:"Mussaf",   fr:"Moussaf",  ru:"Мусаф"},
  blk_mincha:    {en:"Mincha / Afternoon",he:"מִנְחָה",         es:"Minjá / Tarde",     fr:"Minha / Après-midi",ru:"Минха / Послеполуденная"},
  // Bikkurim basket types
  bik_straw:     {en:"straw basket",     he:"סל קש",           es:"cesta de paja",     fr:"panier de paille",  ru:"соломенная корзина"},
  bik_silver:    {en:"silver basket",    he:"סל כסף",          es:"cesta de plata",    fr:"panier en argent",  ru:"серебряная корзина"},
  bik_gold:      {en:"gold basket + doves",he:"סל זהב + יונים",es:"cesta de oro + palomas",fr:"panier en or + colombes",ru:"золотая корзина + голуби"},
  // Shalmei / todah auto notes
  auto_regalim:  {en:"auto:",            he:"אוטומטי:",        es:"auto:",              fr:"auto:",              ru:"авто:"},
  reset_auto:    {en:"reset to auto",    he:"אפס לאוטומטי",   es:"restablecer a auto",fr:"réinitialiser auto", ru:"сбросить на авто"},
  regalim_word:  {en:"regel",            he:"רגל",             es:"regalim",           fr:"règle",              ru:"регель"},
  regalim_pl:    {en:"regalim",          he:"רגלים",           es:"regalim",           fr:"regalim",            ru:"регалим"},
  overridden:    {en:"You have overridden one or more values above.", he:"שינית ערכים אחדים.", es:"Ha anulado uno o más valores.", fr:"Vous avez remplacé certaines valeurs.", ru:"Вы изменили одно или несколько значений."},
  ashir_note:    {en:"ASHIR DEFAULTS — Business class flights and luxury hotel set automatically.", he:"הגדרות עשיר — טיסות מחלקת עסקים ומלון יוקרה.", es:"VALORES ASHIR — Vuelos en clase ejecutiva y hotel de lujo.", fr:"VALEURS ASHIR — Vols en classe affaires et hôtel de luxe.", ru:"НАСТРОЙКИ АШИРА — Бизнес-класс и люкс-отель."},
};

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
  {id:"shalmei_simcha",cat:CAT.FIXED,    label:"Shalmei Simcha x regalim", hebrew:"שַׁלמֵי שִׂמְחָה",   catalogId:"shalmei_simcha",   defaultQty:3, rationale:"The Torah mitzvah of simcha on the regalim is fulfilled for adult males through shelamim specifically (Rambam Hilchos Yom Tov 6:17) — distinct from the chagigah, neither fulfills the other. However, some hold that if the chagigah and re'iyah already provide sufficient meat for the household to rejoice, a separate shalmei simcha is not required. The matter is disputed; this is a considered halachic question. Default is 1 per regel; adjust to 0 if your other korbanos suffice. Consult your posek."},
  {id:"chagigah_14_nissan",cat:CAT.FIXED, label:"Chagigat 14 Nisan",        hebrew:"חֲגִיגַת י\"ד",        catalogId:"chagigah_14",      defaultQty:1, rationale:"Brought on Erev Pesach (14 Nisan) alongside the Korban Pesach so the seder is eaten al hasova (on satiety). However this offering is not unconditional — it is only required if you lack sufficient other meat for the household to eat their fill. If other shelamim or food provides enough satiety, this chagigah is not needed (Rambam Hilchos Korban Pesach 10:12). It is therefore adjustable. Note: when 14 Nisan falls on Shabbos, this chagigah is not brought and cannot be made up. Defaults to 1 when attending Pesach; set to 0 if not needed."},
  {id:"chatzi_shekel", cat:CAT.FIXED,    label:"Chatzi Shekel",            hebrew:"מַחֲצִית הַשֶּׁקֶל",   catalogId:null,               defaultQty:1, rationale:"Mandatory annual contribution of every adult Jewish male, used to fund all communal korbanos. Fixed at exactly half a shekel hakodesh — 9.6 grams of silver per R' Naeh (shekel = 19.2g = 320 barley grains; Rambam Hilchos Shekalim 1:2). Source: Shemos 30:13; Rambam Hilchos Shekalim 1:5. No one gives more or less — the wealthy and the poor are equal. Price updates with live silver spot price."},
  {id:"bikkurim",      cat:CAT.FIXED,    label:"Bikkurim",                 hebrew:"בִּכּוּרִים",           catalogId:null,               defaultQty:0, rationale:"First fruits of the seven species brought to the Mikdash between Shavuos and Sukkos. Only obligatory for landowners in Eretz Yisroel. Check the EY and landowner boxes in Assumptions to set automatically. Basket type scales with financial standing — poor: straw (~$150); average: silver basket returned after use (~$450); wealthy: gold basket kept by the Kohen with doves (~$1,200). Source: Devarim 26:1-11; Mishnah Bikkurim 3:8."},
  {id:"chatas_total",  cat:CAT.PERSONAL, label:"Chataos",                  hebrew:"חַטָּאוֹת",            catalogId:"chatat_individual",defaultQty:7, rationale:"Total inadvertent violations of kareis prohibitions: Shabbos melachos, eruv failures, arayos, and basar b'chalav. Set by the scrutiny slider; adjust freely.", violations:V.chatas_total},
  {id:"asham_talui",   cat:CAT.PERSONAL, label:"Asham Toluy",              hebrew:"אָשָׁם תָּלוּי",       catalogId:"asham",            defaultQty:3, rationale:"Brought when genuinely unsure whether a kareis violation occurred.", violations:V.asham_talui},
  {id:"todah",         cat:CAT.TODAH,    label:"Korban Todah",             hebrew:"תּוֹדָה",              catalogId:"todah",            defaultQty:2, rationale:"Baseline of 2 for illness, other travel, and general hashgacha pratis during the year. Check the box below to add 2 more per regel attended (each round-trip to Yerushalayim generates a todah obligation — departure and return). Adjust the total freely with +/-."},
  {id:"yoledet",       cat:CAT.LIFE,     label:"Yoledet",                  hebrew:"יוֹלֶדֶת",             catalogId:"yoledet",          defaultQty:0, rationale:"Brought by a woman after childbirth, after the days of purification (33 days for a boy, 66 for a girl). One lamb as olah and one bird as chatas. If she cannot afford a lamb, two birds. One of the most common life-event korbanos — every birth triggers this obligation."},
  {id:"olah_vol",      cat:CAT.LIFE,     label:"Olah - Voluntary",         hebrew:"עוֹלָה",               catalogId:"olah_animal",      defaultQty:0, rationale:"A wholly-consumed ascent-offering brought voluntarily — no trigger required. Expresses pure devotion; nothing returns to the owner. Can be brought at any time. The animal may be a bull, ram, or lamb depending on means."},
  {id:"shelamim_vol",  cat:CAT.LIFE,     label:"Shelamim - Peace Offering",hebrew:"שְׁלָמִים",             catalogId:"shelamim",         defaultQty:0, rationale:"Brought voluntarily to celebrate, fulfill a vow, or as a freewill gift. Divided among the altar, the kohanim, and the owner's family — eaten in Yerushalayim. Occasions include births, recoveries, business successes, or simple gratitude."},
  {id:"nazir_vol",     cat:CAT.LIFE,     label:"Korbanos Nazir",           hebrew:"נָזִיר",               catalogId:"nazir",            defaultQty:0, rationale:"Brought at the end of a nazirite vow. The Nazir abstains from wine, haircuts, and contact with the dead, then brings a lamb as olah, a ewe as chatas, a ram as shelamim, plus 40 loaves."},
  {id:"metzora_vol",   cat:CAT.LIFE,     label:"Korban Metzora",           hebrew:"מְצֹרָע",              catalogId:"yoledet",          defaultQty:0, rationale:"Brought upon purification from tzara'at. Two lambs (asham and olah), one ewe (chatas), flour and oil, with an elaborate blood-and-oil anointing ritual. This offering marks complete reintegration into the community."},
  {id:"oleh_yored",    cat:CAT.LIFE,     label:"Korban Oleh v'Yored",      hebrew:"עוֹלֶה וְיוֹרֵד",     catalogId:"chatat_individual",defaultQty:0, rationale:"A sliding-scale offering for specific transgressions: false oath, entering the Mikdash while tamei, or eating kodashim while tamei. The wealthy bring a lamb; moderate means bring two birds; the very poor bring a flour offering (Vayikra 5:1-13)."},
  {id:"pidyon_haben",  cat:CAT.LIFE,     label:"Pidyon HaBen",             hebrew:"פִּדְיוֹן הַבֵּן",     catalogId:null,               defaultQty:0, rationale:"Redemption of the firstborn son, paid to a kohen 30 days after birth. Fixed at 5 shekalim hakodesh = 96 grams silver (per R' Naeh: 5 × 19.2g). Price updates with live silver spot price. One-time obligation, not annual — but included here for completeness. Only applies to the firstborn son of a mother who has not previously given birth."},
  {id:"pesach_sheni",  cat:CAT.LIFE,     label:"Korban Pesach Sheni",      hebrew:"פֶּסַח שֵׁנִי",        catalogId:"pesach",           defaultQty:0, rationale:"A second chance to bring the korban Pesach, on 14 Iyar, for those who were tamei or on a distant journey during 14 Nisan. The only case in halacha where the Torah explicitly grants a make-up date for a missed time-bound mitzvah."},
];

const CATEGORY_ORDER  = [CAT.FIXED, CAT.PERSONAL, CAT.TODAH, CAT.LIFE, CAT.TRAVEL];
const CATEGORY_NOTES  = {
  [CAT.FIXED]:    "Non-negotiable obligations. Every adult male owes the chatzi shekel and regalim offerings annually. Bikkurim applies to landowners in Eretz Yisroel — set in Assumptions.",
  [CAT.PERSONAL]: "Inadvertent violations of kareis prohibitions. Set the scrutiny slider, then adjust as needed.",
  [CAT.TODAH]:    "Baseline of 2 for illness and other travel. Optionally add 2 per regel attended — each round-trip flight to Yerushalayim generates two todah obligations. Adjust the total freely.",
  [CAT.LIFE]:     "Not obligatory every year — brought as life events occur or as voluntary acts of devotion. All default to zero.",
  [CAT.TRAVEL]:   "Round-trips New York to Jerusalem for the regalim. The true cost of living in the Diaspora.",
};
const CATEGORY_COLORS = {
  [CAT.FIXED]:"#f0c060",[CAT.PERSONAL]:"#d4884a",
  [CAT.TODAH]:"#4ec98a",[CAT.LIFE]:"#c07ad8",[CAT.TRAVEL]:"#5aabdf",
};

const PERSONAL_IDS   = ["chatas_total","asham_talui"];
const REGALIM_LOCKED = ["pesach_korban","reiyah","chagigah"];
const LIFE_IDS       = ["yoledet","olah_vol","shelamim_vol","nazir_vol","metzora_vol","oleh_yored","pidyon_haben","pesach_sheni"];
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
// Shekel hakodesh = 320 barley grains. R' Naeh baseline = 19.2g.
// Other shiurim scale by the same multiplier as flour/oil/wine.
// R' Naeh 1.0×: chatzi shekel = 9.6g,  pidyon haben = 96g
// R' Moshe 1.14×: chatzi shekel = 10.9g, pidyon haben = 109.2g
// Rambam  1.5×:  chatzi shekel = 14.4g, pidyon haben = 144g
// Chazon Ish 2×: chatzi shekel = 19.2g, pidyon haben = 192g
const SILVER_USD_PER_GRAM_FALLBACK = 1.06;
const SHEKEL_HAKODESH_NAEH_G = 19.2; // baseline R' Naeh; multiply by shiur.multiplier
// Bikkurim pricing by financial tier (Mishnah Bikkurim 3:8; Rambam Hilchos Bikkurim 4:15)
// Poor (Ani): simple wicker/straw basket, basic seven-species fruits only
// Average: silver basket returned to kohen after use; additional fruits and decorations
// Wealthy (Ashir): gold basket kept by kohen; doves tied to handles as olah/shelamim; elaborate procession
const BIKKURIM_POOR_USD    = 150;   // straw basket + produce
const BIKKURIM_AVERAGE_USD = 450;   // silver basket (~$200 silver) + produce + decorations
const BIKKURIM_WEALTHY_USD = 1200;  // gold basket (~$600 gold) + doves + elaborate produce display

function fixedPriceFor(id, silverUsdPerGram=SILVER_USD_PER_GRAM_FALLBACK, financialTier="average", shiurMultiplier=1.0){ 
  const shekelG   = SHEKEL_HAKODESH_NAEH_G * shiurMultiplier;
  const chatziG   = shekelG / 2;
  const pidyonG   = shekelG * 5;
  if(id==="chatzi_shekel") return chatziG * silverUsdPerGram;
  if(id==="pidyon_haben")  return pidyonG * silverUsdPerGram;
  if(id==="bikkurim"){
    if(financialTier==="wealthy") return BIKKURIM_WEALTHY_USD;
    if(financialTier==="poor")    return BIKKURIM_POOR_USD;
    return BIKKURIM_AVERAGE_USD;
  }
  return 0;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function korbanosCalculator() {
  const [activeTab,        setActiveTab]        = useState("annual");
  const [lang,             setLang]             = useState("en");
  const [langOpen,         setLangOpen]         = useState(false);
  const [currency,         setCurrency]         = useState("usd");
  const [todayAbs,         setTodayAbs]         = useState(()=>gregToAbs(new Date()));
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
  const [silverUsdPerGram, setSilverUsdPerGram] = useState(SILVER_USD_PER_GRAM_FALLBACK);
  const [silverStatus,     setSilverStatus]     = useState("idle");
  const [silverInputVal,   setSilverInputVal]   = useState((SILVER_USD_PER_GRAM_FALLBACK*31.1035).toFixed(2));
  const [travelCfg,        setTravelCfg]        = useState(DEFAULT_TRAVEL);
  const [travelUserEdited, setTravelUserEdited] = useState({});
  const [strictness,       setStrictness]       = useState(2);
  const [financialTier,    setFinancialTier]    = useState("average");
  const [personalQtys,     setPersonalQtys]     = useState({chatas_total:7,asham_talui:3});
  const [includeTravel,    setIncludeTravel]    = useState(true);
  const [includeTravelTodah, setIncludeTravelTodah] = useState(true);
  const [livesInEY,        setLivesInEY]        = useState(false);
  const [isLandowner,      setIsLandowner]      = useState(false);
  const [todahOverride,    setTodahOverride]    = useState(null);
  const [shalmeiOverride,  setShalmeiOverride]  = useState(null);
  const [chagigah14Override, setChagigah14Override] = useState(null);
  const [population,       setPopulation]       = useState(600000);
  const [showPrint,        setShowPrint]        = useState(false);

  // Helper: fetch silver from fawazahmed0 metals API
  // Response: { xag: { usd: <USD_per_troy_oz> } }
  // Primary: jsdelivr CDN; Fallback: Cloudflare Pages mirror
  const fetchSilverPrice=async()=>{
    const applyPrice=(usdPerTroyOz)=>{
      setSilverUsdPerGram(usdPerTroyOz/31.1035);
      setSilverInputVal(usdPerTroyOz.toFixed(2));
      setSilverStatus("live");
    };
    try{
      const r=await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xag.json");
      const d=await r.json();
      if(d&&d.xag&&d.xag.usd&&d.xag.usd>0){applyPrice(d.xag.usd);return true;}
    }catch(e){}
    try{
      const r=await fetch("https://latest.currency-api.pages.dev/v1/currencies/xag.json");
      const d=await r.json();
      if(d&&d.xag&&d.xag.usd&&d.xag.usd>0){applyPrice(d.xag.usd);return true;}
    }catch(e){}
    return false;
  };

  useEffect(()=>{
    // Fetch NIS rate
    setRateStatus("loading");
    (async()=>{
      try{const r=await fetch("https://open.er-api.com/v6/latest/USD");const d=await r.json();if(d&&d.rates&&d.rates.ILS){setUsdPerNis(1/d.rates.ILS);setRateStatus("live");return;}}catch(e){}
      try{const r=await fetch("https://api.frankfurter.app/latest?from=USD&to=ILS");const d=await r.json();if(d&&d.rates&&d.rates.ILS){setUsdPerNis(1/d.rates.ILS);setRateStatus("live");return;}}catch(e){}
      setRateStatus("error");
    })();
    // Fetch silver price independently
    setSilverStatus("loading");
    fetchSilverPrice().then(ok=>{ if(!ok) setSilverStatus("error"); });
  },[]);

  // Close language dropdown on outside click
  useEffect(()=>{
    if(!langOpen) return;
    const handler=(e)=>{
      if(!e.target.closest("#lang-dropdown")) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return ()=>document.removeEventListener("mousedown", handler);
  },[langOpen]);

  // Load shared bill from URL on mount
  useEffect(()=>{
    try{
      const params=new URLSearchParams(window.location.search);
      const bill=params.get("bill");
      if(!bill) return;
      const cfg=JSON.parse(atob(decodeURIComponent(bill)));
      if(cfg.s) setShiurId(cfg.s);
      if(cfg.t) setFinancialTier(cfg.t);
      if(cfg.st) setStrictness(cfg.st);
      if(cfg.r) setRegalimAttending(cfg.r);
      if(cfg.ey!=null) setLivesInEY(cfg.ey);
      if(cfg.lo!=null) setIsLandowner(cfg.lo);
      if(cfg.it!=null) setIncludeTravel(cfg.it);
      if(cfg.itt!=null) setIncludeTravelTodah(cfg.itt);
      if(cfg.tc) setTravelCfg(cfg.tc);
      if(cfg.pq) setPersonalQtys(cfg.pq);
      if(cfg.to!=null) setTodahOverride(cfg.to);
      if(cfg.so!=null) setShalmeiOverride(cfg.so);
      if(cfg.co!=null) setChagigah14Override(cfg.co);
    }catch(e){}
  },[]);

  // Refresh NIS rate only
  const fetchRate=async()=>{
    setRateStatus("loading");
    try{const r=await fetch("https://open.er-api.com/v6/latest/USD");const d=await r.json();if(d&&d.rates&&d.rates.ILS){setUsdPerNis(1/d.rates.ILS);setRateStatus("live");return;}}catch(e){}
    try{const r=await fetch("https://api.frankfurter.app/latest?from=USD&to=ILS");const d=await r.json();if(d&&d.rates&&d.rates.ILS){setUsdPerNis(1/d.rates.ILS);setRateStatus("live");return;}}catch(e){}
    setRateStatus("error");
  };

  // Refresh silver price only
  const fetchSilver=async()=>{
    setSilverStatus("loading");
    const ok=await fetchSilverPrice();
    if(!ok) setSilverStatus("error");
  };

  const silverPerTroyOz = (silverUsdPerGram*31.1035).toFixed(2);

  const shiur        = SHIURIM[shiurId];
  const isHe         = lang==="he";
  const H_MONTH_NAMES = lang==="he"?H_MONTH_NAMES_HE:lang==="es"?H_MONTH_NAMES_ES:lang==="fr"?H_MONTH_NAMES_FR:lang==="ru"?H_MONTH_NAMES_RU:H_MONTH_NAMES_EN;
  const T            = (key) => (TR[key]&&TR[key][lang]) || (TR[key]&&TR[key]["en"]) || key;
  const LANGS = [{code:"en",label:"English"},{code:"he",label:"עברית"},{code:"es",label:"Español"},{code:"fr",label:"Français"},{code:"ru",label:"Русский"}];
  const fmtC = (usdVal) => currency==="nis" ? fmtNIS(usdVal/usdPerNis) : fmt(usdVal);
  const dir          = isHe ? "rtl" : "ltr";
  const CAT_NAMES    = {
    [CAT.FIXED]:    T("cat_name_fixed"),
    [CAT.PERSONAL]: T("cat_name_personal"),
    [CAT.TODAH]:    T("cat_name_todah"),
    [CAT.LIFE]:     T("cat_name_life"),
    [CAT.TRAVEL]:   T("cat_name_travel"),
  };
  const CAT_NOTES_L  = {
    [CAT.FIXED]:    T("cat_fixed"),
    [CAT.PERSONAL]: T("cat_personal"),
    [CAT.TODAH]:    T("cat_todah"),
    [CAT.LIFE]:     T("cat_life"),
    [CAT.TRAVEL]:   T("cat_travel"),
  };
  const tier         = FINANCIAL_TIERS[financialTier];
  const currentLevel = STRICTNESS_LEVELS[strictness-1];
  const nisPerUsd    = usdPerNis>0?(1/usdPerNis).toFixed(2):"–";
  const P            = useMemo(()=>buildPrices(shiurId,usdPerNis),[shiurId,usdPerNis]);

  // Dynamic rationale for shiur-sensitive items
  const getRationale=(item)=>{
    if(item.id==="chatzi_shekel"){
      const shekelG=(SHEKEL_HAKODESH_NAEH_G*shiur.multiplier).toFixed(1);
      const chatziG=(SHEKEL_HAKODESH_NAEH_G*shiur.multiplier/2).toFixed(1);
      return "Mandatory annual contribution of every adult Jewish male, used to fund all communal korbanos. Fixed at exactly half a shekel hakodesh — "+(chatziG)+" grams of silver per "+(shiur.labelShort)+" (shekel = "+(shekelG)+"g = 320 barley grains; Rambam Hilchos Shekalim 1:2). Source: Shemos 30:13; Rambam Hilchos Shekalim 1:5. No one gives more or less — the wealthy and the poor are equal. Price updates with live silver spot price.";
    }
    return item.rationale;
  };

  const setTravel      = (k,v)=>{
    setTravelCfg(c=>({...c,[k]:Math.max(0,v)}));
    if(k==="flightCost"||k==="nightlyRate") setTravelUserEdited(e=>({...e,[k]:true}));
  };
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
  const todahFromTravel = (!livesInEY && includeTravelTodah) ? regalimCount*2 : 0;
  const todahAuto       = 2 + todahFromTravel;
  const todahTotal      = todahOverride !== null ? todahOverride : todahAuto;
  const resetTodah      = ()=>setTodahOverride(null);

  const resolveCatalogId = id=>{
    if(id==="reiyah")   return tier.reiyahId;
    if(id==="chagigah") return tier.chagigahId;
    return (ANNUAL_ASSUMPTIONS.find(a=>a.id===id)||{}).catalogId;
  };
  const resolveUnitCost=(id,P)=>{
    if(FIXED_PRICE_IDS.includes(id)) return fixedPriceFor(id, silverUsdPerGram, financialTier, shiur.multiplier);
    const catId=resolveCatalogId(id);
    const entry=catId?CATALOG.find(c=>c.id===catId):null;
    return entry?offeringTotal(entry,P):0;
  };
  const getQty=id=>{
    if(id==="pesach_korban") return regalimAttending.pesach?1:0;
    if(id==="reiyah")        return regalimCount;
    if(id==="chagigah")      return regalimCount;
    if(id==="shalmei_simcha") return shalmeiOverride !== null ? shalmeiOverride : regalimCount;
    if(id==="chagigah_14_nissan") return chagigah14Override !== null ? chagigah14Override : (regalimAttending.pesach?1:0);
    if(id==="chatzi_shekel") return 1;
    if(id==="todah")         return todahTotal;
    if(id==="bikkurim")      return isLandowner?1:0;
    if(id==="chatas_total")  return personalQtys.chatas_total!=null?personalQtys.chatas_total:currentLevel.qtys.chatas_total;
    if(id==="asham_talui")   return personalQtys.asham_talui!=null?personalQtys.asham_talui:currentLevel.qtys.asham_talui;
    return profileQtys[id]!=null?profileQtys[id]:0;
  };

  const travelSubtotal = useMemo(()=>TRAVEL_ITEMS.reduce((s,t)=>{
    const r=t.id.replace("travel_","");
    return s+(regalimAttending[r]?travelCosts[t.id]:0);
  },0),[regalimAttending,travelCosts]);

  const offeringsSubtotal = useMemo(()=>
    ANNUAL_ASSUMPTIONS.reduce((s,a)=>s+getQty(a.id)*resolveUnitCost(a.id,P),0),
    [profileQtys,personalQtys,regalimAttending,P,strictness,financialTier]
  );

  const annualTotal = offeringsSubtotal + (!livesInEY && includeTravel ? travelSubtotal : 0);

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
  const perCapitaCommunal  = communalTotal/population;

  const catalogTotal    = useMemo(()=>CATALOG.reduce((s,c)=>s+(counts[c.id]||0)*offeringTotal(c,P),0),[counts,P]);
  const catalogSelected = useMemo(()=>Object.values(counts).reduce((a,b)=>a+(b||0),0),[counts]);
  const filtered        = CATALOG.filter(s=>s.group===activeGroup);

  const lbl = {fontSize:"0.82rem",color:"#c9a45a",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.5rem"};
  const inp = {width:"100%",padding:"0.5rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"};

  const doReset=()=>{
    setProfileQtys(Object.fromEntries(ANNUAL_ASSUMPTIONS.map(a=>[a.id,a.defaultQty])));
    setRegalimAttending({pesach:true,shavuot:true,sukkot:true});
    setStrictness(2);setPersonalQtys(STRICTNESS_LEVELS[1].qtys);
    setFinancialTier("average");setTravelCfg(DEFAULT_TRAVEL);setTravelUserEdited({});setShiurId("naeh");setIncludeTravel(true);
    setIncludeTravelTodah(true);setTodahOverride(null);setShalmeiOverride(null);setChagigah14Override(null);
    setLivesInEY(false);setIsLandowner(false);
    setSilverUsdPerGram(SILVER_USD_PER_GRAM_FALLBACK);setSilverInputVal((SILVER_USD_PER_GRAM_FALLBACK*31.1035).toFixed(2));setSilverStatus("idle");
  };

  const disclaimer=(
    <div style={{padding:"1.1rem 1.4rem",background:"rgba(139,0,0,.15)",border:"1px solid #aa3030",borderLeft:"4px solid #e04040",fontSize:"1rem",lineHeight:1.8,color:"#f0c0a0",marginTop:"1.5rem"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",letterSpacing:"0.1em",color:"#e04040",marginBottom:"0.5rem",fontWeight:700}}>{T("disclaimer_title")}</div>
      <strong style={{color:"#f0ddb0"}}>{T("disclaimer_body")}</strong>
    </div>
  );

  const TAB=(id,label)=>(
    <button onClick={()=>setActiveTab(id)} style={{padding:"0.75rem 1.1rem",background:activeTab===id?"#daa520":"transparent",color:activeTab===id?"#1a0f08":"#f0c060",border:"1px solid "+(activeTab===id?"#daa520":"#7a4f20"),cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.8rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",flex:"1 1 auto"}}>{label}</button>
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
    <div dir={dir} style={{minHeight:"100vh",background:"radial-gradient(ellipse at top,#1e0e06 0%,#120a04 50%,#080402 100%)",color:"#f0ddb0",fontFamily:"'EB Garamond',Georgia,serif",padding:"2rem 1rem",fontSize:"17px",lineHeight:1.6}}>
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
        <header style={{textAlign:"center",marginBottom:"2rem",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,display:"flex",gap:"0.25rem"}}><button onClick={()=>setCurrency("usd")} style={{padding:"0.28rem 0.6rem",background:currency==="usd"?"rgba(240,192,96,.18)":"transparent",border:"1px solid "+(currency==="usd"?"#f0c060":"#3a2010"),color:currency==="usd"?"#f0c060":"#5a3a1a",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.78rem",letterSpacing:"0.06em",borderRadius:2}}>$</button><button onClick={()=>setCurrency("nis")} style={{padding:"0.28rem 0.6rem",background:currency==="nis"?"rgba(240,192,96,.18)":"transparent",border:"1px solid "+(currency==="nis"?"#f0c060":"#3a2010"),color:currency==="nis"?"#f0c060":"#5a3a1a",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.78rem",letterSpacing:"0.06em",borderRadius:2}}>₪</button></div>
          <div id="lang-dropdown" style={{position:"absolute",top:0,right:0,zIndex:100}}>
            <button onClick={()=>setLangOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.35rem 0.75rem",background:langOpen?"rgba(240,192,96,.15)":"transparent",border:"1px solid "+(langOpen?"#f0c060":"#5a3a1a"),color:langOpen?"#f0c060":"#7a5030",cursor:"pointer",fontFamily:lang==="he"?"'Frank Ruhl Libre',serif":"'Cinzel',serif",fontSize:"0.8rem",letterSpacing:lang==="he"?"0":"0.08em",borderRadius:2}}>
              {LANGS.find(l=>l.code===lang).label}
              <span style={{fontSize:"0.6rem",opacity:0.7,marginLeft:2}}>{langOpen?"▲":"▼"}</span>
            </button>
            {langOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,minWidth:140,background:"#1a0a02",border:"1px solid #7a4f20",boxShadow:"0 8px 32px rgba(0,0,0,.7)",overflow:"hidden"}}>
                {LANGS.map((l,i)=>(
                  <button key={l.code} onClick={()=>{setLang(l.code);setLangOpen(false);}} style={{display:"block",width:"100%",padding:"0.55rem 1rem",background:lang===l.code?"rgba(240,192,96,.12)":"transparent",border:"none",borderBottom:i<LANGS.length-1?"1px solid #2a1404":"none",color:lang===l.code?"#f0c060":"#a08050",cursor:"pointer",fontFamily:l.code==="he"?"'Frank Ruhl Libre',serif":l.code==="ru"?"Georgia,serif":"'Cinzel',serif",fontSize:"0.85rem",letterSpacing:l.code==="he"||l.code==="ru"?"0":"0.06em",textAlign:"left"}}>
                    {lang===l.code&&<span style={{color:"#f0c060",marginRight:6,fontSize:"0.65rem"}}>✦</span>}{l.label}
                  </button>
                ))}
                <div style={{padding:"0.6rem 1rem",borderTop:"1px solid #2a1404",fontSize:"0.72rem",color:"#a08050",lineHeight:1.5,fontStyle:"italic",fontFamily:"'EB Garamond',serif"}}>
                  Interface translated by AI. Halachic content and detailed notes remain in English.
                </div>
              </div>
            )}
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:"0.75rem",color:"#f0c060",marginBottom:"0.5rem"}} className="fl">
            <div style={{width:40,height:1,background:"#f0c060"}}/>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-1.5.5-2.5 1-3.5C10 8 10 10 11 10c.5 0 1-.5 1-1 0-2-1-4 0-7z"/></svg>
            <div style={{width:40,height:1,background:"#f0c060"}}/>
          </div>
          <h1 className="df" style={{fontSize:"clamp(2rem,4vw,3rem)",fontWeight:700,margin:"0.4rem 0",color:"#f0ddb0",textShadow:"0 2px 20px rgba(240,192,96,.3)"}}>KORBANOS</h1>
          <div className="hf" style={{fontSize:"clamp(1.4rem,3vw,2.2rem)",color:"#f0c060",marginBottom:"0.5rem"}}>קָרְבְּנוֹת בֵּית הַמִּקְדָּשׁ</div>
          <p style={{fontStyle:"italic",color:"#c9a45a",maxWidth:560,margin:"0 auto",fontSize:"1rem",lineHeight:1.6}}>{T("header_sub")}</p>
        </header>

        {/* TABS */}
        <div style={{display:"flex",gap:"0.4rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
          {TAB("annual",T("tab_annual"))}{TAB("communal",T("tab_communal"))}{TAB("today",T("tab_today"))}{TAB("catalog",T("tab_catalog"))}{TAB("prices",T("tab_prices"))}
        </div>

        {/* SETTINGS STRIP */}
        <div style={{marginBottom:"1.5rem",background:"rgba(20,10,2,.95)",border:"1px solid #7a4f20"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.5rem",padding:"0.75rem 1.1rem",borderBottom:showSettings?"1px solid #5a3a1a":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem 1.5rem",flexWrap:"wrap",fontSize:"0.9rem",color:"#c9a45a"}}>
              <span><span style={{color:"#8a6030"}}>{T("strip_live")} </span><span style={{color:"#f0ddb0"}}>{livesInEY?T("strip_ey"):T("strip_cla")}</span></span>
              <span style={{color:"#5a3a1a"}}>|</span>
              <span><span style={{color:"#8a6030"}}>{T("strip_standing")} </span><span style={{color:"#f0ddb0"}}>{T("tier_"+financialTier)}</span></span>
              <span style={{color:"#5a3a1a"}}>|</span>
              <span><span style={{color:"#8a6030"}}>{T("strip_shiur")} </span><span style={{color:"#f0ddb0"}}>{shiur.labelShort}</span>{shiurId!=="naeh"&&<span style={{color:"#b070e0",marginLeft:"0.3rem"}}>x{shiur.multiplier}</span>}</span>
              <span style={{color:"#5a3a1a"}}>|</span>
              <span><span style={{color:"#8a6030"}}>{T("strip_silver")} </span><span style={{color:"#f0ddb0"}}>${silverInputVal}/oz</span>{silverStatus==="live"&&<span style={{color:"#4ec98a",marginLeft:"0.3rem"}}>{T("live_lbl")}</span>}{silverStatus==="error"&&<span style={{color:"#e05050",marginLeft:"0.3rem"}}>{T("manual_lbl")}</span>}</span>
              <span style={{color:"#5a3a1a"}}>|</span>
              <span><span style={{color:"#8a6030"}}>{T("strip_rate")} </span><span style={{color:"#f0ddb0"}}>{currency==="usd"?"$1 = NIS "+nisPerUsd:"₪1 = $"+(usdPerNis).toFixed(3)}</span>{rateStatus==="live"&&<span style={{color:"#4ec98a",marginLeft:"0.3rem"}}>{T("live_lbl")}</span>}{rateStatus==="error"&&<span style={{color:"#e05050",marginLeft:"0.3rem"}}>{T("manual_lbl")}</span>}</span>
            </div>
            <button onClick={()=>setShowSettings(s=>!s)} style={{padding:"0.5rem 1rem",background:showSettings?"rgba(240,192,96,.15)":"transparent",border:"1px solid "+(showSettings?"#f0c060":"#7a4f20"),color:"#f0c060",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
              {showSettings?T("strip_close"):T("strip_assumptions")}
            </button>
          </div>
          {showSettings&&(
            <div className="fi" style={{padding:"1.25rem",borderTop:"1px solid #5a3a1a"}}>
              {/* Location / Eretz Yisroel */}
              <div style={{marginBottom:"1.25rem"}}>
                <div style={lbl}>{T("set_location")}</div>
                <label style={{display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer",fontSize:"0.95rem",color:"#f0ddb0",marginBottom:"0.6rem"}}>
                  <input type="checkbox" checked={livesInEY} onChange={e=>{setLivesInEY(e.target.checked);if(!e.target.checked) setIsLandowner(false);}} style={{width:16,height:16,accentColor:"#f0c060",cursor:"pointer"}}/>
                  {T("set_ey_check")}
                </label>
                {livesInEY&&(
                  <div className="fi">
                    <div style={{fontSize:"0.9rem",color:"#4ec98a",fontStyle:"italic",marginBottom:"0.75rem",lineHeight:1.6}}>{T("set_ey_note")}</div>
                    <label style={{display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer",fontSize:"0.95rem",color:"#f0ddb0",marginBottom:"0.4rem"}}>
                      <input type="checkbox" checked={isLandowner} onChange={e=>setIsLandowner(e.target.checked)} style={{width:16,height:16,accentColor:"#f0c060",cursor:"pointer"}}/>
                      {T("set_landowner")}
                    </label>
                    {isLandowner&&(
                      <div style={{marginTop:"0.4rem",padding:"0.5rem 0.75rem",background:"rgba(192,122,216,.07)",border:"1px solid #7a4090",borderLeft:"3px solid #c07ad8",fontSize:"0.88rem",color:"#c9a45a",lineHeight:1.6}}>
                        <strong style={{color:"#f0ddb0"}}>{T("bikkurim_auto")}</strong> {T("bikkurim_based")}{" "}
                        {financialTier==="poor"&&"straw basket with produce (~$150)"}
                        {financialTier==="average"&&"silver basket with produce and decorations (~$450)"}
                        {financialTier==="wealthy"&&"gold basket kept by the Kohen, doves tied to handles, elaborate produce display (~$1,200)"}
                        {" "}— <strong style={{color:"#f0ddb0"}}>{fmtC(fixedPriceFor("bikkurim",silverUsdPerGram,financialTier,shiur.multiplier))}</strong>.{" "}
                        Change your financial standing above to update.
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Financial Standing */}
              <div style={{marginBottom:"1.25rem",paddingTop:"1rem",borderTop:"1px solid #5a3a1a"}}>
                <div style={lbl}>{T("set_standing")}</div>
                <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.6rem"}}>
                  {Object.values(FINANCIAL_TIERS).map(t=>(
                    <button key={t.id} onClick={()=>{
                      setFinancialTier(t.id);
                      if(t.id==="wealthy"){
                        if(!travelUserEdited.flightCost) setTravelCfg(c=>({...c,flightCost:5000}));
                        if(!travelUserEdited.nightlyRate) setTravelCfg(c=>({...c,nightlyRate:1000}));
                      } else if(t.id!=="wealthy" && financialTier==="wealthy"){
                        if(!travelUserEdited.flightCost) setTravelCfg(c=>({...c,flightCost:DEFAULT_TRAVEL.flightCost}));
                        if(!travelUserEdited.nightlyRate) setTravelCfg(c=>({...c,nightlyRate:DEFAULT_TRAVEL.nightlyRate}));
                      }
                    }} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.55rem 1rem",background:financialTier===t.id?"rgba(240,192,96,.18)":"transparent",color:financialTier===t.id?"#f0c060":"#c9a45a",border:"1px solid "+(financialTier===t.id?"#f0c060":"#5a3a1a"),cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem"}}>
                      <span style={{fontFamily:isHe?"'Frank Ruhl Libre',serif":"'Cinzel',serif",fontWeight:600}}>{T("tier_"+t.id)}</span>
                    </button>
                  ))}
                </div>
                <div style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic",lineHeight:1.6}}>{tier.desc}</div>
              </div>
              {/* Shiur */}
              <div style={{marginBottom:"1.25rem",paddingTop:"1rem",borderTop:"1px solid #5a3a1a"}}>
                <div style={lbl}>{T("set_shiur")}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginBottom:"0.5rem"}}>
                  {Object.values(SHIURIM).map(s=>(
                    <button key={s.id} onClick={()=>setShiurId(s.id)} style={{padding:"0.45rem 0.9rem",background:shiurId===s.id?"rgba(240,192,96,.15)":"transparent",color:shiurId===s.id?"#f0c060":"#c9a45a",border:"1px solid "+(shiurId===s.id?"#f0c060":"#5a3a1a"),cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem"}}>
                      <span style={{fontFamily:"'Cinzel',serif",fontWeight:600}}>{s.labelShort}</span>
                      <span style={{marginLeft:"0.4rem",opacity:.75,fontSize:"0.8rem"}}>{s.multiplier===1?T("baseline_lbl"):"x"+(s.multiplier)}</span>
                    </button>
                  ))}
                </div>
                <div style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic",lineHeight:1.6}}>{shiur.notes} <span style={{color:"#7a5030"}}>- {shiur.source}</span></div>
              </div>
              {/* Silver price */}
              <div style={{marginBottom:"1.25rem",paddingTop:"1rem",borderTop:"1px solid #5a3a1a"}}>
                <div style={lbl}>{T("set_silver")}</div>
                <div style={{fontSize:"0.9rem",color:"#a08050",fontStyle:"italic",marginBottom:"0.5rem"}}>Used to price silver-weight obligations. Weight scales with shiur — chatzi shekel = {(SHEKEL_HAKODESH_NAEH_G*shiur.multiplier/2).toFixed(1)}g ({shiur.labelShort}); pidyon haben = {(SHEKEL_HAKODESH_NAEH_G*shiur.multiplier*5/2).toFixed(1)}g.</div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                  <span style={{fontSize:"0.9rem",color:"#f0ddb0"}}>$</span>
                  <input
                    type="number" step="0.50" min="0.01"
                    value={silverInputVal}
                    onChange={e=>{
                      setSilverInputVal(e.target.value);
                      const v=parseFloat(e.target.value);
                      if(!isNaN(v)&&v>0) setSilverUsdPerGram(v/31.1035);
                    }}
                    onBlur={e=>{
                      const v=parseFloat(e.target.value);
                      if(isNaN(v)||v<=0){setSilverInputVal((silverUsdPerGram*31.1035).toFixed(2));}
                      else{setSilverInputVal(v.toFixed(2));setSilverUsdPerGram(v/31.1035);}
                    }}
                    style={{width:90,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}
                  />
                  <span style={{fontSize:"0.9rem",color:"#f0ddb0"}}>/troy oz</span>
                  <span style={{fontSize:"0.85rem",color:"#7a5030"}}>(= ${silverUsdPerGram.toFixed(4)}/g)</span>
                  <button onClick={fetchSilver} style={{padding:"0.35rem 0.8rem",background:"transparent",border:"1px solid #7a4f20",color:"#c9a45a",cursor:"pointer",fontSize:"0.85rem",fontFamily:"'Cinzel',serif"}}>{T("refresh_lbl")}</button>
                  {silverStatus==="live"&&<span style={{fontSize:"0.9rem",color:"#4ec98a"}}>{T("live_rate")}</span>}
                  {silverStatus==="loading"&&<span style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic"}}>{T("fetching")}</span>}
                  {silverStatus==="error"&&<span style={{fontSize:"0.9rem",color:"#e05050"}}>{T("fetch_fail")}</span>}
                  {silverStatus==="idle"&&<span style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic"}}>{T("est_lbl")}</span>}
                </div>
                <div style={{marginTop:"0.6rem",fontSize:"0.88rem",color:"#c9a45a",lineHeight:1.6}}>
                  {T("chatzi_lbl")} <strong style={{color:"#f0ddb0"}}>{fmtC(fixedPriceFor("chatzi_shekel",silverUsdPerGram,financialTier,shiur.multiplier))}</strong>
                  <span style={{margin:"0 0.5rem",color:"#5a3a1a"}}>·</span>
                  {T("pidyon_lbl")} <strong style={{color:"#f0ddb0"}}>{fmtC(fixedPriceFor("pidyon_haben",silverUsdPerGram,financialTier,shiur.multiplier))}</strong>
                </div>
              </div>
              {/* Exchange rate */}
              <div style={{marginBottom:"1.25rem",paddingTop:"1rem",borderTop:"1px solid #5a3a1a"}}>
                <div style={lbl}>{T("set_rate")}</div>
                <div style={{fontSize:"0.9rem",color:"#a08050",fontStyle:"italic",marginBottom:"0.5rem"}}>All prices are Jerusalem NIS rates, converted to USD for display.</div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                  <span style={{fontSize:"0.9rem",color:"#f0ddb0"}}>$1 =</span>
                  <input type="number" step="0.01" min="0.1" value={parseFloat(nisPerUsd)} onChange={e=>setUsdPerNis(1/(parseFloat(e.target.value)||2.96))} style={{width:70,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
                  <span style={{fontSize:"0.9rem",color:"#f0ddb0"}}>NIS</span>
                  <button onClick={fetchRate} style={{padding:"0.35rem 0.8rem",background:"transparent",border:"1px solid #7a4f20",color:"#c9a45a",cursor:"pointer",fontSize:"0.85rem",fontFamily:"'Cinzel',serif"}}>{T("refresh_lbl")}</button>
                  {rateStatus==="live"&&<span style={{fontSize:"0.9rem",color:"#4ec98a"}}>{T("live_rate")}</span>}
                  {rateStatus==="loading"&&<span style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic"}}>{T("fetching")}</span>}
                  {rateStatus==="error"&&<span style={{fontSize:"0.9rem",color:"#e05050"}}>{T("fetch_fail")}</span>}
                </div>
              </div>
              {/* Travel — hidden for EY residents */}
              {!livesInEY&&(
              <div style={{paddingTop:"1rem",borderTop:"1px solid #5a3a1a"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.75rem"}}>
                  <div style={{fontSize:"0.82rem",color:"#5aabdf",letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Cinzel',serif"}}>{T("set_travel")}</div>
                  <label style={{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",fontSize:"0.9rem",color:"#c9a45a"}}>
                    <input type="checkbox" checked={includeTravel} onChange={e=>setIncludeTravel(e.target.checked)} style={{width:16,height:16,accentColor:"#f0c060",cursor:"pointer"}}/>
                    Include travel in total
                  </label>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"0.75rem",marginBottom:"0.9rem"}}>
                  {[{tkey:"trav_flight",key:"flightCost",prefix:"$",step:50},{tkey:"trav_hotel",key:"nightlyRate",prefix:"$",step:25},{tkey:"trav_extra",key:"familyMembers",step:1,suffix:"trav_beyond"},{tkey:"trav_pesach_n",key:"pesachNights",step:1},{tkey:"trav_shavuos_n",key:"shavuotNights",step:1},{tkey:"trav_sukkos_n",key:"sukkotNights",step:1}].map(({tkey,key,prefix,step,suffix})=>(
                    <div key={key}>
                      <div style={{...lbl,fontSize:"0.7rem",letterSpacing:"0.06em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{T(tkey)}</div>
                      <div style={{display:"flex",alignItems:"center",gap:"0.3rem"}}>
                        {prefix&&<span style={{fontSize:"0.9rem",color:"#f0ddb0"}}>{prefix}</span>}
                        <input type="number" min="0" step={step} value={travelCfg[key]} onChange={e=>setTravel(key,parseFloat(e.target.value)||0)} style={{...inp,fontSize:"0.9rem"}}/>
                        {suffix&&<span style={{fontSize:"0.72rem",color:"#7a5030",whiteSpace:"nowrap"}}>{suffix?T(suffix):""}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {financialTier==="wealthy"&&(
                  <div style={{marginBottom:"0.75rem",padding:"0.6rem 0.9rem",background:"rgba(240,192,96,.06)",border:"1px solid #7a4f20",borderLeft:"3px solid #f0c060",fontSize:"0.88rem",color:"#c9a45a",lineHeight:1.6}}>
                    <span style={{color:"#f0ddb0",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",letterSpacing:"0.06em"}}>{T("ashir_note")}</span>{" "}
                    {(travelUserEdited.flightCost||travelUserEdited.nightlyRate)&&<span style={{color:"#4ec98a"}}>{T("overridden")||"You have overridden one or more values above."}</span>}
                    {(!travelUserEdited.flightCost&&!travelUserEdited.nightlyRate)&&<span style={{color:"#a08050",fontStyle:"italic"}}>{T("edit_override")}</span>}
                  </div>
                )}
              </div>
              )}
              <div style={{display:"flex",justifyContent:"flex-end",paddingTop:"1rem",marginTop:"0.75rem",borderTop:"1px solid #5a3a1a"}}>
                <button onClick={doReset} style={{padding:"0.5rem 1rem",background:"transparent",border:"1px solid #5a3a1a",color:"#8a6030",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",letterSpacing:"0.1em"}}>{T("set_reset")}</button>
              </div>
            </div>
          )}
        </div>

        {/* ══ ANNUAL BILL ══ */}
        {activeTab==="annual"&&(
          <div className="fi">
            {/* Regalim selector */}
            <div style={{marginBottom:"1.75rem",padding:"1.25rem",background:"rgba(20,10,2,.8)",border:"1px solid #7a4f20"}}>
              <div style={{fontSize:"0.9rem",color:"#f0c060",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.85rem"}}>{T("regalim_q")}</div>
              <div style={{display:"flex",gap:"0.85rem",flexWrap:"wrap",marginBottom:"0.9rem"}}>
                {[{id:"pesach",tkey:"rgl_pesach"},{id:"shavuot",tkey:"rgl_shavuos"},{id:"sukkot",tkey:"rgl_sukkos"}].map(({id,tkey})=>{
                  const going=regalimAttending[id];
                  return(<button key={id} onClick={()=>setRegalimAttending(r=>({...r,[id]:!r[id]}))} style={{display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.65rem 1.2rem",background:going?"rgba(240,192,96,.15)":"rgba(30,14,6,.8)",border:"2px solid "+(going?"#f0c060":"#5a3a1a"),color:going?"#f0ddb0":"#7a5030",cursor:"pointer",fontFamily:"inherit"}}>
                    <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid "+(going?"#f0c060":"#5a3a1a"),background:going?"#f0c060":"transparent",flexShrink:0}}/>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",letterSpacing:"0.08em",fontWeight:going?700:400,fontFamily:isHe?"'Frank Ruhl Libre',serif":"'Cinzel',serif"}}>{T(tkey)}</span>
                  </button>);
                })}
              </div>
              {Object.values(regalimAttending).some(v=>!v)&&(
                <div style={{padding:"1rem 1.1rem",background:"rgba(160,40,40,.12)",border:"1px solid #aa3030",borderLeft:"4px solid #e04040",lineHeight:1.75,color:"#f0a0a0"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:"1rem",letterSpacing:"0.08em",color:"#e04040",marginBottom:"0.6rem",fontWeight:700}}>{T("bitul_title")}</div>
                  {[{id:"pesach",tkey:"rgl_pesach"},{id:"shavuot",tkey:"rgl_shavuos"},{id:"sukkot",tkey:"rgl_sukkos"}].filter(r=>!regalimAttending[r.id]).map(r=>(
                    <div key={r.id} style={{marginBottom:"0.5rem",fontSize:"1rem"}}>
                      <strong style={{color:"#ffb0b0",fontFamily:"'Cinzel',serif",fontSize:"0.9rem",letterSpacing:"0.05em"}}>{T(r.tkey)}: </strong>
                      <span style={{color:"#f0c0c0"}}>You have violated the positive commandment of aliyah l'regel (Devarim 16:16). The olas re'iyah and chagigah for this regel are permanently lost. There is no korban to bring. The only recourse is teshuvah.</span>
                    </div>
                  ))}
                  <div style={{marginTop:"0.7rem",fontSize:"0.95rem",color:"#d4a060",fontStyle:"italic",borderTop:"1px dashed #aa3030",paddingTop:"0.6rem",lineHeight:1.7}}>{T("bitul_note")}</div>
                </div>
              )}
              {Object.values(regalimAttending).every(v=>v)&&<div style={{fontSize:"0.9rem",color:"#4ec98a",fontStyle:"italic"}}>{T("regalim_all")}</div>}
            </div>

            {byCategory.map(({cat,items,subtotal,isTravel})=>{
              if(isTravel && (!includeTravel || livesInEY)) return null;
              return(
              <div key={cat} style={{marginBottom:"2rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:"2px solid "+(CATEGORY_COLORS[cat])+"55",paddingBottom:"0.5rem",marginBottom:"0.3rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                    <div style={{width:4,height:18,background:CATEGORY_COLORS[cat],borderRadius:2}}/>
                    <h2 className="df" style={{margin:0,fontSize:"0.95rem",color:CATEGORY_COLORS[cat],letterSpacing:"0.15em",textTransform:"uppercase"}}>{CAT_NAMES[cat]||cat}</h2>
                  </div>
                  <span className="df" style={{fontSize:"1.1rem",color:CATEGORY_COLORS[cat],fontWeight:700}}>{fmtC(subtotal)}</span>
                </div>
                <p style={{fontSize:"0.95rem",color:"#e8d4a0",fontStyle:"italic",margin:"0.3rem 0 0.9rem",lineHeight:1.7}}>{CAT_NOTES_L[cat]||CATEGORY_NOTES[cat]}</p>

                {cat===CAT.PERSONAL&&(
                  <div style={{marginBottom:"1rem",padding:"1rem 1.1rem",background:"rgba(212,136,74,.07)",border:"1px solid #8a5030",borderLeft:"4px solid #d4884a"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"0.5rem"}}>
                      <div style={lbl}>{T("scrutiny_lbl")}</div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",color:"#d4884a",fontWeight:700}}>{currentLevel.label}</div>
                    </div>
                    <input type="range" min="1" max="5" value={strictness} onChange={e=>handleStrictnessChange(parseInt(e.target.value))} style={{cursor:"pointer",marginBottom:"0.4rem",width:"100%"}}/>
                    <div style={{position:"relative",height:"1.2rem",marginBottom:"0.5rem"}}>
                      {[T("scrutiny_min"),T("scrutiny_avg"),T("scrutiny_careful"),T("scrutiny_yerei"),T("scrutiny_exc")].map((label,i)=>{
                        const pct = i / 4; // 0, 0.25, 0.5, 0.75, 1
                        const thumbW = 40;
                        const offset = thumbW * (0.5 - pct);
                        return(
                          <span key={i} style={{
                            position:"absolute",
                            left:"calc("+( pct*100)+"% + "+(offset)+"px)",
                            transform:"translateX(-50%)",
                            fontSize:"0.82rem",
                            color: strictness===i+1 ? "#d4884a" : "#c9a45a",
                            fontFamily:"'EB Garamond',Georgia,serif",
                            whiteSpace:"nowrap",
                            fontWeight: strictness===i+1 ? 700 : 400,
                          }}>{label}</span>
                        );
                      })}
                    </div>
                    <div style={{fontSize:"1rem",color:"#e8d4a0",fontStyle:"italic",lineHeight:1.6}}>{currentLevel.desc}</div>
                    <div style={{marginTop:"0.4rem",fontSize:"0.92rem",color:"#c9a45a",lineHeight:1.6}}>{T("slider_desc")}</div>
                  </div>
                )}

                {isTravel ? TRAVEL_ITEMS.map(t=>{
                  const regel=t.id.replace("travel_",""); const going=regalimAttending[regel]; const nights=travelCfg[t.nightsKey];
                  return(<div key={t.id} style={{background:going?"rgba(42,24,16,.5)":"rgba(20,10,2,.4)",border:"1px solid "+(going?"#5a3a1a":"#2a1a08"),borderLeft:"4px solid "+(going?"#5aabdf":"#2a1a08"),padding:"1rem 1.1rem",marginBottom:"0.7rem",opacity:going?1:0.4}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.5rem"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"baseline",gap:"0.5rem"}}>
                          <span style={{fontWeight:700,fontSize:"1.1rem",color:"#f0ddb0",fontFamily:isHe?"'Frank Ruhl Libre',serif":"inherit"}}>{isHe?t.hebrew:t.label}{nights>0?" + "+(nights)+" "+T("nights_lbl"):""}</span>
                        </div>
                        <div style={{fontSize:"0.88rem",color:"#a08050",fontStyle:"italic",marginTop:"0.1rem"}}>{1+travelCfg.familyMembers}x ${travelCfg.flightCost}{nights>0?" + "+(nights)+"x $"+(travelCfg.nightlyRate)+" "+T("lodging_lbl"):""}</div>
                      </div>
                      <div className="df" style={{fontSize:"1.3rem",color:going?"#5aabdf":"#4a2a08",fontWeight:700}}>{fmtC(travelCosts[t.id])}</div>
                    </div>
                  </div>);
                }) : items.map(item=>{
                  const isPersonal    = PERSONAL_IDS.includes(item.id);
                  const isRegalimLock = REGALIM_LOCKED.includes(item.id);
                  const isLife        = LIFE_IDS.includes(item.id);
                  const isTodah       = item.id==="todah";
                  const isChatziFixed = item.id==="chatzi_shekel";
                  const isBikkurim    = item.id==="bikkurim";
                  const isShalmei     = item.id==="shalmei_simcha";
                  const isChagigah14  = item.id==="chagigah_14_nissan";
                  const unitCost      = resolveUnitCost(item.id,P);
                  const qty           = getQty(item.id);
                  const lineCost      = qty*unitCost;
                  const ac            = CATEGORY_COLORS[cat];
                  const showR         = showRationale[item.id];
                  const showEx        = showExamples[item.id];
                  const catId         = resolveCatalogId(item.id);
                  const catEntry      = catId?CATALOG.find(c=>c.id===catId):null;
                  return(
                    <div key={item.id} style={{background:isLife&&qty===0?"rgba(16,8,2,.6)":"rgba(24,12,4,.7)",border:"1px solid "+(isLife&&qty===0?"#3a2510":"#5a3a1a"),borderLeft:"4px solid "+(lineCost>0?ac:isLife?"#5a3060":"#3a2010"),padding:"1rem 1.1rem",marginBottom:"0.7rem",opacity:isLife&&qty===0?0.75:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem",flexWrap:"wrap"}}>
                        <div style={{flex:"1 1 260px"}}>
                          <div style={{display:"flex",alignItems:"baseline",gap:"0.6rem",flexWrap:"wrap"}}>
                            <span style={{fontWeight:700,fontSize:"1.15rem",color:qty>0?"#f0ddb0":"#c0a870",fontFamily:isHe?"'Frank Ruhl Libre',serif":"inherit"}}>{isHe?(item.hebrew||item.label):item.label}</span>
                            {isRegalimLock&&catEntry&&<span style={{fontSize:"0.85rem",color:"#7a5030",fontStyle:"italic"}}>{catEntry.subtitle}</span>}
                          </div>
                          {isLife||isChatziFixed
                            ? <div style={{marginTop:"0.5rem",fontSize:"0.95rem",color:"#e8d4a0",lineHeight:1.7}}>{getRationale(item)}{lang!=="en"&&<span style={{display:"block",marginTop:"0.3rem",fontSize:"0.8rem",color:"#5a3a1a",fontStyle:"italic"}}>{lang==="he"?"הסברים מפורטים זמינים באנגלית בלבד.":lang==="es"?"Notas detalladas disponibles solo en inglés.":lang==="fr"?"Notes détaillées disponibles en anglais uniquement.":"Подробные примечания доступны только на английском."}</span>}</div>
                            : <>
                                <div style={{display:"flex",gap:"0.75rem",marginTop:"0.4rem",flexWrap:"wrap"}}>
                                  <button onClick={()=>setShowRationale(r=>({...r,[item.id]:!r[item.id]}))} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.88rem",fontFamily:"inherit",fontStyle:"italic",padding:0,textDecoration:"underline",textUnderlineOffset:"3px"}}>{showR?T("hide_rationale"):T("why_number")}</button>
                                  {item.violations&&<button onClick={()=>setShowExamples(e=>({...e,[item.id]:!e[item.id]}))} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.88rem",fontFamily:"inherit",fontStyle:"italic",padding:0,textDecoration:"underline",textUnderlineOffset:"3px"}}>{showEx?T("hide_examples"):T("sample_violations")}</button>}
                                </div>
                                {showR&&<div className="fi" style={{marginTop:"0.5rem",padding:"0.65rem 0.9rem",background:"rgba(240,192,96,.06)",border:"1px dashed #7a4f20",fontSize:"0.92rem",color:"#d4c090",lineHeight:1.7}}>{getRationale(item)}{lang!=="en"&&<span style={{display:"block",marginTop:"0.3rem",fontSize:"0.8rem",color:"#5a3a1a",fontStyle:"italic"}}>{lang==="he"?"הסברים מפורטים זמינים באנגלית בלבד.":lang==="es"?"Notas detalladas disponibles solo en inglés.":lang==="fr"?"Notes détaillées disponibles en anglais uniquement.":"Подробные примечания доступны только на английском."}</span>}</div>}
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
                            <div style={{fontSize:"0.82rem",color:"#c9a45a",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:"0.2rem"}}>{fmtC(unitCost)} {T("each_lbl")}</div>
                            <div className="df" style={{fontSize:"1.5rem",color:qty>0?ac:"#5a3a1a",fontWeight:700}}>{fmtC(lineCost)}</div>
                          </div>
                          {isRegalimLock
                            ? <div style={{padding:"0.4rem 0.75rem",background:"#1a0c04",border:"1px solid #5a3a1a",color:"#c9a45a",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",whiteSpace:"nowrap"}}>{qty+" — "+T("set_by_regalim")}</div>
                            : isChatziFixed
                              ? <div style={{padding:"0.4rem 0.75rem",background:"#1a0c04",border:"1px solid #5a3a1a",color:"#c9a45a",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",whiteSpace:"nowrap"}}>fixed</div>
                            : isBikkurim
                              ? <div style={{textAlign:"right"}}>
                                  <div style={{padding:"0.4rem 0.75rem",background:"#1a0c04",border:"1px solid "+(isLandowner?"#7a4090":"#5a3a1a"),color:isLandowner?"#c07ad8":"#5a3a1a",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",whiteSpace:"nowrap"}}>
                                    {isLandowner?"1 — "+T("auto_lbl"):("0 — "+T("set_in_assumptions"))}
                                  </div>
                                  {isLandowner&&<div style={{fontSize:"0.8rem",color:"#c07ad8",marginTop:"0.25rem",fontStyle:"italic",maxWidth:160,textAlign:"right",lineHeight:1.4}}>
                                    {financialTier==="poor"?T("bik_straw"):financialTier==="wealthy"?T("bik_gold"):T("bik_silver")}
                                  </div>}
                                </div>
                            : isChagigah14
                              ? <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.4rem",minWidth:160}}>
                                  <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                                    <button onClick={()=>setChagigah14Override(Math.max(0,(chagigah14Override!=null?chagigah14Override:(regalimAttending.pesach?1:0))-1))} style={qBtn(qty>0)}>-</button>
                                    <input type="number" min="0" value={qty} onChange={e=>{const v=parseInt(e.target.value);setChagigah14Override(isNaN(v)?0:Math.max(0,v));}} style={{width:52,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
                                    <button onClick={()=>setChagigah14Override((chagigah14Override!=null?chagigah14Override:(regalimAttending.pesach?1:0))+1)} style={qBtn(true)}>+</button>
                                  </div>
                                  {chagigah14Override!==null&&<button onClick={()=>setChagigah14Override(null)} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.82rem",fontFamily:"inherit",fontStyle:"italic",padding:0,textDecoration:"underline",textUnderlineOffset:"3px"}}>{T("reset_auto")+" ("+(regalimAttending.pesach?1:0)+")"}</button>}
                                  {chagigah14Override===null&&<div style={{fontSize:"0.8rem",color:"#f0c060",fontStyle:"italic"}}>{T("auto_lbl")+": "+(regalimAttending.pesach?"1":"0")}</div>}
                                </div>
                            : isShalmei
                              ? <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.4rem",minWidth:160}}>
                                  <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                                    <button onClick={()=>setShalmeiOverride(Math.max(0,(shalmeiOverride!=null?shalmeiOverride:regalimCount)-1))} style={qBtn(qty>0)}>-</button>
                                    <input type="number" min="0" value={qty} onChange={e=>{const v=parseInt(e.target.value);setShalmeiOverride(isNaN(v)?0:Math.max(0,v));}} style={{width:52,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
                                    <button onClick={()=>setShalmeiOverride((shalmeiOverride!=null?shalmeiOverride:regalimCount)+1)} style={qBtn(true)}>+</button>
                                  </div>
                                  {shalmeiOverride!==null&&<button onClick={()=>setShalmeiOverride(null)} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.82rem",fontFamily:"inherit",fontStyle:"italic",padding:0,textDecoration:"underline",textUnderlineOffset:"3px"}}>{T("reset_auto")+" ("+(regalimCount)+")"}</button>}
                                  {shalmeiOverride===null&&<div style={{fontSize:"0.8rem",color:"#f0c060",fontStyle:"italic"}}>{T("auto_regalim")+" "+(regalimCount)+" "+(regalimCount!==1?T("regalim_pl"):T("regalim_word"))}</div>}
                                </div>
                            : isTodah
                              ? <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.4rem",minWidth:200}}>
                                  {/* Travel todah checkbox */}
                                  <label style={{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",fontSize:"0.88rem",color:"#4ec98a",whiteSpace:"nowrap"}}>
                                    <input type="checkbox" checked={includeTravelTodah} onChange={e=>{setIncludeTravelTodah(e.target.checked);setTodahOverride(null);}} style={{width:15,height:15,accentColor:"#4ec98a",cursor:"pointer"}}/>
                                    +{regalimCount*2} {T("travel_todah_lbl")} {regalimCount} {regalimCount!==1?T("regalim_pl"):T("regalim_word")} {T("travel_todah_suf")}
                                  </label>
                                  {/* Manual qty spinner */}
                                  <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                                    <button onClick={()=>setTodahOverride(Math.max(0,(todahOverride!=null?todahOverride:todahAuto)-1))} style={qBtn(todahTotal>0)}>-</button>
                                    <input type="number" min="0" value={todahTotal} onChange={e=>{const v=parseInt(e.target.value);setTodahOverride(isNaN(v)?0:Math.max(0,v));}} style={{width:52,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
                                    <button onClick={()=>setTodahOverride((todahOverride!=null?todahOverride:todahAuto)+1)} style={qBtn(true)}>+</button>
                                  </div>
                                  {/* Reset to auto link */}
                                  {todahOverride!==null&&<button onClick={resetTodah} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.82rem",fontFamily:"inherit",fontStyle:"italic",padding:0,textDecoration:"underline",textUnderlineOffset:"3px"}}>{T("reset_auto")+" ("+(todahAuto)+")"}  </button>}
                                  {todahOverride===null&&<div style={{fontSize:"0.8rem",color:"#4ec98a",fontStyle:"italic"}}>{T("auto_regalim")+" 2 "+T("baseline_lbl")+(includeTravelTodah&&regalimCount>0?" + "+(regalimCount*2)+" "+T("travel_todah_suf"):"")}</div>}
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
              <div style={{fontSize:"0.82rem",color:"#c9a45a",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"0.5rem",fontFamily:"'Cinzel',serif"}}>{T("cost_breakdown")}</div>
              <div style={{display:"flex",height:14,borderRadius:3,overflow:"hidden",gap:1}}>
                {byCategory.filter(x=>(!livesInEY&&includeTravel)||!x.isTravel).map(({cat,subtotal})=>{const pct=(subtotal/annualTotal)*100;if(pct<0.5||!annualTotal)return null;return <div key={cat} title={(CAT_NAMES[cat]||cat)+": "+(fmtC(subtotal))} style={{width:(pct)+"%",background:CATEGORY_COLORS[cat]}}/>;})}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem 1.2rem",marginTop:"0.6rem"}}>
                {byCategory.filter(x=>(!livesInEY&&includeTravel)||!x.isTravel).map(({cat,subtotal})=>(
                  <div key={cat} style={{display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.9rem",color:"#c9a45a"}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:CATEGORY_COLORS[cat],flexShrink:0}}/>
                    <span style={{color:"#e8d4a0"}}>{CAT_NAMES[cat]||cat}</span>
                    <span style={{color:CATEGORY_COLORS[cat],fontFamily:"'Cinzel',serif",fontWeight:700}}>{fmtC(subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand total */}
            <div style={{padding:"1.4rem 1.6rem",background:"linear-gradient(135deg,#6a3010,#4a2008,#2a1004)",border:"2px solid #f0c060",boxShadow:"0 8px 40px rgba(240,192,96,.2)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"}}>
              <div>
                <div style={{fontSize:"0.9rem",color:"#f0ddb0",letterSpacing:"0.15em",textTransform:"uppercase",opacity:.85,marginBottom:"0.15rem"}}>{T("estimated_total")}</div>
                <div className="df" style={{fontSize:"2.8rem",color:"#f0c060",fontWeight:900,textShadow:"0 2px 12px rgba(240,192,96,.4)"}}>{fmtC(annualTotal)}</div>
                {(!includeTravel||livesInEY)&&travelSubtotal>0&&<div style={{fontSize:"0.9rem",color:"#5aabdf",marginTop:"0.25rem",fontStyle:"italic"}}>{T("travel_excl")} {fmtC(travelSubtotal)} {T("excl_suffix")}</div>}
              </div>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                <button onClick={()=>setShowPrint(true)} style={{background:"transparent",border:"1px solid #c9a45a",color:"#c9a45a",padding:"0.45rem 0.9rem",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.8rem",letterSpacing:"0.08em"}}>🖨 Print Summary</button>
                <button onClick={()=>{
                  const cfg={s:shiurId,t:financialTier,st:strictness,r:regalimAttending,ey:livesInEY,lo:isLandowner,it:includeTravel,itt:includeTravelTodah,tc:travelCfg,pq:personalQtys,to:todahOverride,so:shalmeiOverride,co:chagigah14Override};
                  const url=window.location.origin+window.location.pathname+"?bill="+encodeURIComponent(btoa(JSON.stringify(cfg)));
                  navigator.clipboard.writeText(url).then(()=>alert("Link copied to clipboard!")).catch(()=>prompt("Copy this link:",url));
                }} style={{background:"transparent",border:"1px solid #c9a45a",color:"#c9a45a",padding:"0.45rem 0.9rem",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.8rem",letterSpacing:"0.08em"}}>🔗 Share My Bill</button>
                <button onClick={doReset} style={{background:"transparent",border:"2px solid #f0ddb0",color:"#f0ddb0",padding:"0.45rem 1rem",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.85rem",letterSpacing:"0.1em",fontWeight:600}}>{T("reset")}</button>
              </div>
            </div>
            {disclaimer}
          </div>
        )}

        {/* ══ COMMUNAL BUDGET ══ */}
        {activeTab==="communal"&&(
          <div className="fi">
            <div style={{marginBottom:"1.5rem",padding:"1.25rem",background:"rgba(240,192,96,.06)",border:"1px solid #7a4f20",borderLeft:"4px solid #f0c060"}}>
              <div style={{fontSize:"1rem",color:"#f0c060",fontFamily:"'Cinzel',serif",letterSpacing:"0.08em",marginBottom:"0.75rem",fontWeight:700}}>{T("chatzi_pool")}</div>
              <p style={{fontSize:"1rem",color:"#e8d4a0",lineHeight:1.8,margin:"0 0 0.75rem"}}>Every adult Jewish male contributed exactly half a shekel annually — no more, no less. These funds paid for every communal korban: the tamid, all mussaf offerings, the Yom Kippur service, the Shtei HaLechem, and more. The wealthy and the poor were equal before the altar.</p>
              <p style={{fontSize:"0.95rem",color:"#c9a45a",fontStyle:"italic",lineHeight:1.7,margin:0}}>Source: Shemos 30:13; Rambam Hilchos Shekalim 1:5. Half a shekel hakodesh = {(SHEKEL_HAKODESH_NAEH_G*shiur.multiplier/2).toFixed(1)}g silver ({shiur.labelShort}; shekel = {(SHEKEL_HAKODESH_NAEH_G*shiur.multiplier).toFixed(1)}g = 320 barley grains) = <strong style={{color:"#f0ddb0"}}>{fmtC(fixedPriceFor("chatzi_shekel",silverUsdPerGram,financialTier,shiur.multiplier))}</strong> {T("at_current")} (~${silverUsdPerGram.toFixed(2)}/gram{silverStatus==="live"?<span style={{color:"#4ec98a",marginLeft:"0.3rem"}}>{T("live_lbl")}</span>:<span style={{color:"#c9a45a",marginLeft:"0.3rem"}}>{T("est_lbl")}</span>}).</p>
            </div>

            {/* Population slider */}
            <div style={{marginBottom:"1.5rem",padding:"1rem 1.25rem",background:"rgba(24,12,4,.7)",border:"1px solid #5a3a1a"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"0.5rem"}}>
                <div style={lbl}>Adult Male Population</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.95rem",color:"#f0c060",fontWeight:700}}>
                  {population>=1000000?(population/1000000).toFixed(1)+"M":(population/1000).toFixed(0)+"k"}
                </div>
              </div>
              <input type="range" min="600000" max="10000000" step="100000" value={population} onChange={e=>setPopulation(parseInt(e.target.value))} style={{width:"100%",cursor:"pointer",marginBottom:"0.5rem"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.8rem",color:"#7a5030",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:"0.5rem"}}>
                <span>600k</span><span>1M</span><span>2M</span><span>3.5M</span><span>5M</span><span>7.5M</span><span>10M</span>
              </div>
              <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
                {[{label:"600k — Bamidbar census",v:600000},{label:"1M — Scholars' low estimate",v:1000000},{label:"3M — Josephus",v:3000000},{label:"6M — Today's observant men",v:6000000}].map(({label,v})=>(
                  <button key={v} onClick={()=>setPopulation(v)} style={{padding:"0.25rem 0.6rem",background:population===v?"rgba(240,192,96,.15)":"transparent",border:"1px solid "+(population===v?"#f0c060":"#3a2010"),color:population===v?"#f0c060":"#7a5030",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.75rem",borderRadius:2}}>{label}</button>
                ))}
              </div>
            </div>

            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1rem",marginBottom:"2rem"}}>
              {[
                {tkey:"total_annual",value:fmtC(communalTotal),sub:"all public korbanos combined",color:"#f0c060"},
                {tkey:"per_capita",value:fmtC(perCapitaCommunal),sub:"assuming "+( population>=1000000 ? (population/1000000).toFixed(1)+"M" : (population/1000).toFixed(0)+"k" )+" adult males",color:"#4ec98a"},
                {tkey:"actual_chatzi",value:fmtC(fixedPriceFor("chatzi_shekel",silverUsdPerGram,financialTier,shiur.multiplier)),sub:((SHEKEL_HAKODESH_NAEH_G*shiur.multiplier/2).toFixed(1))+"g silver • "+(shiur.labelShort)+" • "+(silverStatus==="live"?"live price":"est. price"),color:"#c07ad8"},
                {tkey:"subsidy",value:fmtC(Math.max(0,fixedPriceFor("chatzi_shekel",silverUsdPerGram,financialTier,shiur.multiplier)-perCapitaCommunal)),sub:"chatzi shekel minus per-capita cost",color:"#5aabdf"},
              ].map(({tkey,value,sub,color})=>(
                <div key={tkey} style={{padding:"1.1rem 1.25rem",background:"rgba(24,12,4,.8)",border:"1px solid "+(color)+"44",borderTop:"3px solid "+(color)}}>
                  <div style={{fontSize:"0.78rem",color:"#a08050",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.4rem"}}>{T(tkey)}</div>
                  <div className="df" style={{fontSize:"1.8rem",color:color,fontWeight:900}}>{value}</div>
                  <div style={{fontSize:"0.85rem",color:"#c9a45a",fontStyle:"italic",marginTop:"0.2rem"}}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{borderBottom:"2px solid #f0c06044",paddingBottom:"0.5rem",marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <h2 className="df" style={{margin:0,fontSize:"0.95rem",color:"#f0c060",letterSpacing:"0.15em",textTransform:"uppercase"}}>{T("annual_offerings")}</h2>
              <span style={{fontSize:"0.9rem",color:"#a08050",fontStyle:"italic"}}>{T("at_jlm_prices")}</span>
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
                      <button onClick={()=>setExpandedCommune(e=>({...e,[o.id]:!e[o.id]}))} style={{background:"none",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.85rem",fontFamily:"inherit",fontStyle:"italic",padding:"0.2rem 0 0",textDecoration:"underline",textUnderlineOffset:"3px"}}>{isExp?T("hide_breakdown"):T("show_components")}</button>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,minWidth:130}}>
                      {o.count>1&&<div style={{fontSize:"0.82rem",color:"#a08050"}}>{fmtC(unitCost)} x {o.count}</div>}
                      <div className="df" style={{fontSize:"1.5rem",color:"#f0c060",fontWeight:700}}>{fmtC(totalCost)}</div>
                    </div>
                  </div>
                  {isExp&&entry&&(
                    <div className="fi" style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px dashed #5a3a1a"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.92rem"}}>
                        <tbody>{entry.components.map((c,i)=>(
                          <tr key={i} style={{borderBottom:"1px dotted #5a3a1a"}}>
                            <td style={{padding:"0.3rem 0",color:"#e8d4a0"}}>{c.label}</td>
                            <td style={{padding:"0.3rem 0",textAlign:"right",color:"#f0c060",fontFamily:"'Cinzel',serif",fontSize:"0.88rem",whiteSpace:"nowrap"}}>{fmtC(compCost(c.key,c.count,P))}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{marginTop:"1.5rem",padding:"1rem 1.25rem",background:"rgba(240,192,96,.04)",border:"1px solid #5a3a1a",fontSize:"0.9rem",color:"#c9a45a",lineHeight:1.7,fontStyle:"italic"}}>
              Note: The Kohen Gadol's personal bull on Yom Kippur was not funded by the communal pool — he brought it at his own expense. The 12 Rosh Chodesh mussafim assume a standard year; a leap year adds one additional Rosh Chodesh mussaf. Population assumption adjustable via slider in this tab; default 600,000 follows the Bamidbar census. Second Temple era estimates range from 600k to several million.
            </div>
            {disclaimer}
          </div>
        )}

        {/* ══ TODAY'S COMMUNAL COSTS ══ */}
        {/* ══ TODAY'S COMMUNAL COSTS ══ */}
        {activeTab==="today"&&(()=>{
          const todayAbsNow = gregToAbs(new Date());
          const hd = absToHebrew(todayAbs);
          const {year:hy, month:hm, day:hday, dow, isLeap} = hd;

          // Day type flags
          const isShabbat     = dow === 6; // Saturday
          const isRoshChodesh = hday===1 || (hday===30); // 30th is RC of next month if 30 days
          // More precise RC: day 1 of any month, or day 30 of a month with 30 days
          const monthLen = (hMonthInfo(hy).find(e=>e.m===hm)||{d:29}).d;
          const prevMonthInfo = hMonthInfo(hy);
          const prevIdx = prevMonthInfo.findIndex(e=>e.m===hm);
          const prevMonthLen = prevIdx>0 ? prevMonthInfo[prevIdx-1].d : 30;
          const isRC = hday===1 || (hday===30 && monthLen===30);

          const is14Nisan     = hm===HM.NISAN   && hday===14;
          const is16Nisan     = hm===HM.NISAN   && hday===16;
          const isPesach      = hm===HM.NISAN   && hday>=15 && hday<=21;
          const pesachDay     = isPesach ? hday-14 : 0;
          const isShavuos     = hm===HM.SIVAN   && hday===6;
          const isRH          = hm===HM.TISHREI && hday<=2  && hday>=1 && (()=>{const yl=hYearLen(hy); return yl===354||yl===355||yl===353||yl===383||yl===384||yl===385;})();
          const isYK          = hm===HM.TISHREI && hday===10;
          const isSukkos      = hm===HM.TISHREI && hday>=15 && hday<=21;
          const sukkosDay     = isSukkos ? hday-14 : 0;
          const sukkosBulls   = isSukkos ? 14-sukkosDay : 0;
          const isShemini     = hm===HM.TISHREI && hday===22;
          const isCholHamoed  = (hm===HM.NISAN && hday>=16 && hday<=20) || (hm===HM.TISHREI && hday>=16 && hday<=21);
          const isYomTov      = isPesach||isShavuos||isRH||isYK||isSukkos||isShemini;
          const isMussafDay    = isYomTov||isShabbat||isRC;

          const getDayLabel=()=>{
            if(isYK)      return T("day_yomkippur");
            if(is14Nisan) return T("day_14nisan");
            if(isShemini) return T("day_shemini");
            if(isSukkos)  return T("rgl_sukkos")+" "+T("tab_today").slice(0,0)+(sukkosDay)+(isCholHamoed?" — Chol HaMoed":"");
            if(isRH)      return isShabbat?T("day_rh_shab"):T("day_rh")+" "+(hday);
            if(isShavuos) return T("day_shavuos");
            if(isPesach)  return T("rgl_pesach")+" "+(pesachDay)+(isCholHamoed?" — Chol HaMoed":"");
            if(isShabbat && isRC) return T("day_shabbos_rc");
            if(isShabbat) return T("day_shabbos");
            if(isRC)      return T("day_rc")+" "+(H_MONTH_NAMES[hday===1?hm:(hm%13)+1]||"");
            return T("day_weekday");
          };

          
          const blocks=[];

          const tamidMorning=[
            {label:T("off_tamid_am"),key:"lamb_olah",count:1},
            {label:T("off_ketores_am"),key:"ketores",count:1},
            {label:T("off_menorah"),key:"log_oil",count:3.5},
          ];
          const tamidAfternoon=[
            {label:T("off_tamid_pm"),key:"lamb_olah",count:1},
            {label:T("off_ketores_pm"),key:"ketores",count:1},
          ];

          // SHACHARIT
          const shaOff=[...tamidMorning];
          if(isShabbat) shaOff.push({label:T("off_lechem"),key:"issaron_flour",count:24});
          blocks.push({title:T("blk_shacharit"),color:"#f0c060",offerings:shaOff,
            note:isShabbat?"The Lechem HaPanim (12 loaves) is placed on the golden table; the previous week's loaves are distributed to the kohanim. Source: Vayikra 24:5–9.":undefined});

          // OMER — own block 16 Nisan
          if(is16Nisan){
            blocks.push({title:T("blk_omer"),color:"#4ec98a",
              offerings:[{label:T("off_omer_bar"),key:"issaron_flour",count:1},{label:"1 lamb (olah) with nesachim",key:"lamb_olah",count:1}],
              note:"Brought after the morning Tamid on 16 Nisan. Barley wave-offering that permits the new grain harvest. Source: Vayikra 23:9–14."});
          }

          // MUSAF
          if(isYK){
            blocks.push({title:T("blk_mussaf")+" — "+T("day_yomkippur"),color:"#d4884a",
              offerings:[{label:"1 bull (olah) with nesachim",key:"bull_olah",count:1},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}],
              note:"Communal mussaf only. Source: Bamidbar 29:7–11."});
            blocks.push({title:"Avodas Yom Kippur — Public Korbanos",color:"#c07ad8",
              offerings:[{label:T("off_goats2"),key:"goat",count:2},{label:T("off_ketores2"),key:"ketores",count:2}],
              note:"The two goats are from the public fund. The Kohen Gadol's personal bull (brought at his own expense) is excluded from this communal total. Source: Vayikra 16."});
          } else if(isShemini){
            blocks.push({title:T("blk_mussaf")+" — "+T("day_shemini"),color:"#5aabdf",
              offerings:[{label:"1 bull (olah) with nesachim",key:"bull_olah",count:1},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}],
              note:"A modest intimate offering after the abundance of Sukkos — one of each. Source: Bamidbar 29:35–38."});
          } else if(isSukkos){
            blocks.push({title:T("blk_mussaf")+" — "+T("rgl_sukkos")+" "+(sukkosDay),color:"#5aabdf",
              offerings:[{label:(sukkosBulls)+" "+T("off_bull_olah"),key:"bull_olah",count:sukkosBulls},{label:"2 rams (olah) with nesachim",key:"ram_olah",count:2},{label:"14 "+T("off_lambs_olah"),key:"lamb_olah",count:14},{label:"1 goat (chatas)",key:"goat",count:1}],
              note:"Bull count decreases by one each day (13→7). 70 bulls total over all 7 days represent atonement for the 70 nations. Source: Bamidbar 29:12–34."});
          } else if(isRH){
            // Shabbos mussaf first if applicable
            if(isShabbat){
              blocks.push({title:T("blk_mussaf")+" — "+T("day_shabbos"),color:"#f0c060",
                offerings:[{label:"2 lambs (olah) with nesachim",key:"lamb_olah",count:2}],
                note:"Source: Bamidbar 28:9–10."});
            }
            // Rosh Hashana mussaf
            blocks.push({title:T("blk_mussaf")+" — "+T("day_rh"),color:"#f0a060",
              offerings:[{label:"1 bull (olah) with nesachim",key:"bull_olah",count:1},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}],
              note:"Source: Bamidbar 29:1–6."});
            // Rosh Chodesh Tishrei mussaf — 1 Tishrei is always Rosh Chodesh
            blocks.push({title:T("blk_mussaf")+" — "+T("day_rc")+" "+H_MONTH_NAMES[HM.TISHREI],color:"#c9a45a",
              offerings:[{label:"2 bulls (olah) with nesachim",key:"bull_olah",count:2},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}],
              note:"1 Tishrei is Rosh Chodesh — both mussafim are brought. This is why many have the custom of saying מוּסְפֵי in davening on Rosh Hashana. Source: Bamidbar 28:11–15; 29:1–6."});
          } else if(isShavuos){
            blocks.push({title:T("blk_mussaf")+" — "+T("rgl_shavuos"),color:"#4ec98a",
              offerings:[{label:T("off_shtei_lech"),key:"issaron_flour",count:4},{label:T("off_lambs_sht"),key:"lamb_olah",count:2},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 bull (olah) with nesachim",key:"bull_olah",count:1},{label:"2 rams (olah) with nesachim",key:"ram_olah",count:2},{label:"2 goats (chatas)",key:"goat",count:2}],
              note:"The only day leavened bread is offered in the Mikdash (Shtei HaLechem). The two loaves and their lambs are the public shelamim. Source: Vayikra 23:15–21; Bamidbar 28:26–31."});
          } else if(isPesach){
            blocks.push({title:T("blk_mussaf")+" — "+T("rgl_pesach")+" "+(pesachDay)+(isCholHamoed?" (Chol HaMoed)":""),color:"#e0a060",
              offerings:[{label:"2 bulls (olah) with nesachim",key:"bull_olah",count:2},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}],
              note:"Same mussaf on all 7 days of Pesach. Source: Bamidbar 28:19–24."});
          } else {
            if(isShabbat){
              blocks.push({title:T("blk_mussaf")+" — "+T("day_shabbos"),color:"#f0c060",
                offerings:[{label:"2 lambs (olah) with nesachim",key:"lamb_olah",count:2}],
                note:"Source: Bamidbar 28:9–10."});
            }
            if(isRC){
              blocks.push({title:T("blk_mussaf")+" — "+T("day_rc"),color:"#c9a45a",
                offerings:[{label:"2 bulls (olah) with nesachim",key:"bull_olah",count:2},{label:"1 ram (olah) with nesachim",key:"ram_olah",count:1},{label:"7 lambs (olah) with nesachim",key:"lamb_olah",count:7},{label:"1 goat (chatas)",key:"goat",count:1}],
                note:"Source: Bamidbar 28:11–15."});
            }
          }

          // MINCHA — always
          blocks.push({title:T("blk_mincha"),color:"#f0c060",offerings:tamidAfternoon});

          // Pricing
          const oCost=(key,count)=>compCost(key,count,P);
          const bTotal=(b)=>b.offerings.reduce((s,o)=>s+oCost(o.key,o.count),0);
          const dayTotal=blocks.reduce((s,b)=>s+bTotal(b),0);

          // Jump targets — next occurrence from todayAbs
          const nextOcc=(m,d)=>{
            let y=absToHebrew(todayAbs).year;
            for(let attempt=0;attempt<3;attempt++){
              // check month exists in year (Adar II only in leap)
              if(m===HM.ADAR_II&&!isHLeap(y)){y++;continue;}
              const mi=hMonthInfo(y);if(!mi.find(e=>e.m===m)){y++;continue;}
              const target=hebrewToAbs(y,m,d);
              if(target>=todayAbs) return target;
              y++;
            }
            return hebrewToAbs(absToHebrew(todayAbs).year+1,m,d);
          };
          const nextShabbos=()=>{const daysUntil=(6-dow+7)%7||7;return todayAbs+daysUntil;};
          const nextRC=()=>{
            let test=todayAbs+1;
            for(let i=0;i<35;i++){const h=absToHebrew(test+i);if(h.day===1)return test+i;}
            return nextOcc(HM.TISHREI,1);
          };
          const nextWeekday=()=>{
            let t=todayAbs+1;
            while(true){const d=absToHebrew(t).dow;if(d!==6&&d!==0)return t;t++;}
          };

          const D=(n)=>T("jmp_day")+" "+n;
          const JUMP_GROUPS=[
            {tkey:"jmp_regular",col:"#c9a45a",items:[
              {tkey:"jmp_next_wkdy",abs:nextWeekday()},
              {tkey:"jmp_next_shab",abs:nextShabbos()},
              {tkey:"jmp_next_rc",  abs:nextRC()},
            ]},
            {tkey:"rgl_pesach",col:"#e0a060",items:[
              {tkey:"jmp_14nisan",abs:nextOcc(HM.NISAN,14)},
              {label:D(1),abs:nextOcc(HM.NISAN,15)},
              {tkey:"jmp_omer",   abs:nextOcc(HM.NISAN,16)},
              {label:D(3),abs:nextOcc(HM.NISAN,17)},
              {label:D(4),abs:nextOcc(HM.NISAN,18)},
              {label:D(5),abs:nextOcc(HM.NISAN,19)},
              {label:D(6),abs:nextOcc(HM.NISAN,20)},
              {label:D(7),abs:nextOcc(HM.NISAN,21)},
            ]},
            {tkey:"rgl_sukkos",col:"#5aabdf",items:[
              {label:D(1),abs:nextOcc(HM.TISHREI,15)},
              {label:D(2),abs:nextOcc(HM.TISHREI,16)},
              {label:D(3),abs:nextOcc(HM.TISHREI,17)},
              {label:D(4),abs:nextOcc(HM.TISHREI,18)},
              {label:D(5),abs:nextOcc(HM.TISHREI,19)},
              {label:D(6),abs:nextOcc(HM.TISHREI,20)},
              {label:D(7),abs:nextOcc(HM.TISHREI,21)},
              {tkey:"day_shemini",abs:nextOcc(HM.TISHREI,22)},
            ]},
            {tkey:"rgl_shavuos",col:"#4ec98a",items:[
              {tkey:"rgl_shavuos",abs:nextOcc(HM.SIVAN,6)},
            ]},
            {tkey:"jmp_yamim",col:"#d4884a",items:[
              {tkey:"day_rh",abs:nextOcc(HM.TISHREI,1)},
              {tkey:"day_yomkippur",abs:nextOcc(HM.TISHREI,10)},
            ]},
          ];

          const hebrewStr=(hday)+" "+(H_MONTH_NAMES[hm]||"")+" "+(hy);
          const gregDate=absToGreg(todayAbs).toLocaleDateString(LANG_LOCALE[lang]||"en-US",{month:"long",day:"numeric",year:"numeric"});
          const isActualToday=todayAbs===todayAbsNow;

          return(
          <div className="fi">
            {/* Date nav */}
            <div style={{marginBottom:"1.5rem",padding:"1.25rem",background:"rgba(20,10,2,.8)",border:"1px solid #7a4f20"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.75rem",marginBottom:"1rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                  <button onClick={()=>setTodayAbs(a=>a-1)} style={{width:36,height:36,background:"#2a1a08",border:"1px solid #7a4f20",color:"#f0c060",cursor:"pointer",fontSize:"1.3rem",fontFamily:"inherit",lineHeight:1}}>‹</button>
                  <div style={{textAlign:"center",minWidth:200}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:"1.1rem",color:"#f0ddb0",fontWeight:700}}>{hebrewStr}</div>
                    <div style={{fontSize:"0.9rem",color:"#a08050",fontStyle:"italic"}}>{gregDate}</div>
                  </div>
                  <button onClick={()=>setTodayAbs(a=>a+1)} style={{width:36,height:36,background:"#2a1a08",border:"1px solid #7a4f20",color:"#f0c060",cursor:"pointer",fontSize:"1.3rem",fontFamily:"inherit",lineHeight:1}}>›</button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                  {!isActualToday&&<button onClick={()=>setTodayAbs(todayAbsNow)} style={{padding:"0.4rem 0.9rem",background:"transparent",border:"1px solid #4ec98a",color:"#4ec98a",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",letterSpacing:"0.08em"}}>{T("today_btn")}</button>}
                  <div style={{padding:"0.35rem 0.8rem",background:"rgba(240,192,96,.1)",border:"1px solid #7a4f20",color:"#f0c060",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",letterSpacing:"0.06em"}}>{getDayLabel()}</div>
                </div>
              </div>
              {/* Jump buttons */}
              <div style={{borderTop:"1px solid #3a2010",paddingTop:"0.85rem"}}>
                <div style={{fontSize:"0.75rem",color:"#5a3a1a",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.55rem"}}>{T("jump_to")}</div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
                  {JUMP_GROUPS.map(g=>(
                    <div key={g.tkey||g.label} style={{display:"flex",alignItems:"center",gap:"0.45rem",flexWrap:"wrap"}}>
                      <span style={{fontSize:"0.76rem",color:g.col,fontFamily:isHe?"'Frank Ruhl Libre',serif":"'Cinzel',serif",letterSpacing:"0.06em",minWidth:96,flexShrink:0}}>{g.tkey?T(g.tkey):g.label}</span>
                      {g.items.map(item=>{
                        const active=item.abs===todayAbs;
                        return(<button key={item.tkey||item.label} onClick={()=>setTodayAbs(item.abs)} style={{padding:"0.28rem 0.6rem",background:active?"rgba(240,192,96,.12)":"transparent",border:"1px solid "+(active?g.col:"#3a2010"),color:active?g.col:"#7a5030",cursor:"pointer",fontFamily:isHe?"'Frank Ruhl Libre',serif":"'Cinzel',serif",fontSize:"0.76rem",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{item.tkey?T(item.tkey):item.label}</button>);
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Avodah blocks */}
            {blocks.map((block,bi)=>{
              const bt=bTotal(block);
              return(
              <div key={bi} style={{marginBottom:"1.1rem",background:"rgba(24,12,4,.7)",border:"1px solid #5a3a1a",borderLeft:"4px solid "+(block.color)}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"0.65rem 1rem",borderBottom:"1px solid #3a2010"}}>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.88rem",color:block.color,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>{block.title}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:"1.15rem",color:block.color,fontWeight:700}}>{fmtC(bt)}</span>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.91rem"}}>
                  <tbody>
                    {block.offerings.map((o,oi)=>(
                      <tr key={oi} style={{borderBottom:"1px dotted #2a1404"}}>
                        <td style={{padding:"0.35rem 1rem",color:"#e8d4a0"}}>{o.label}</td>
                        <td style={{padding:"0.35rem 1rem",textAlign:"right",color:block.color,fontFamily:"'Cinzel',serif",fontSize:"0.86rem",whiteSpace:"nowrap"}}>{fmtC(oCost(o.key,o.count))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.note&&<div style={{padding:"0.45rem 1rem",fontSize:"0.83rem",color:"#7a5030",fontStyle:"italic",lineHeight:1.6,borderTop:"1px dotted #2a1404"}}>{block.note}</div>}
              </div>
              );
            })}

            {/* Day total */}
            <div style={{padding:"1.1rem 1.4rem",background:"linear-gradient(135deg,#4a2808,#2a1404)",border:"2px solid #f0c060",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.1rem"}}>
              <div>
                <div style={{fontSize:"0.85rem",color:"#f0ddb0",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:"0.1rem"}}>{T("today_total")} {getDayLabel()}</div>
                <div style={{fontSize:"0.8rem",color:"#a08050",fontStyle:"italic"}}>{T("today_public")}</div>
              </div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"2.2rem",color:"#f0c060",fontWeight:900}}>{fmtC(dayTotal)}</div>
            </div>

            {/* Ma'arachah note */}
            <div style={{padding:"0.8rem 1rem",background:"rgba(20,10,2,.5)",border:"1px solid #2a1404",borderLeft:"3px solid #3a2010",fontSize:"0.85rem",color:"#5a3a1a",lineHeight:1.7,fontStyle:"italic",marginBottom:"1.1rem"}}>
              <strong style={{color:"#7a5030",fontStyle:"normal"}}>Ma'arachah — overnight fire:</strong> The mizbeach fire burns continuously through the night (Vayikra 6:5–6). Fats and limbs from daytime korbanos continue consuming overnight — these are included in the animal costs above. Additional wood for the ma'arachah (Rambam Hilchos Temidin 2:4) adds a nominal amount not separately itemized.
            </div>

            {disclaimer}
          </div>
          );
        })()}

        {/* ══ FULL CATALOG ══ */}
        {activeTab==="catalog"&&(
          <div className="fi">
            <div style={{display:"flex",justifyContent:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1.5rem"}}>
              {GROUPS.map(g=><button key={g.id} onClick={()=>setActiveGroup(g.id)} style={{padding:"0.55rem 1.1rem",background:activeGroup===g.id?"#daa520":"transparent",color:activeGroup===g.id?"#1a0f08":"#f0c060",border:"1px solid "+(activeGroup===g.id?"#daa520":"#7a4f20"),cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.82rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>{T(g.tkey)}</button>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.9rem"}}>
              {filtered.map(s=>{
                const count=counts[s.id]||0,cost=offeringTotal(s,P),isExp=expanded[s.id];
                return(<div key={s.id} style={{background:count>0?"linear-gradient(135deg,rgba(139,69,19,.2),rgba(30,14,6,.7))":"rgba(24,12,4,.7)",border:"1px solid "+(count>0?"#f0c060":"#5a3a1a"),borderLeft:"4px solid "+(count>0?"#f0c060":"#3a2010"),padding:"1.1rem"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem",marginBottom:"0.7rem",flexWrap:"wrap"}}>
                    <div style={{flex:"1 1 260px"}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:"0.6rem",flexWrap:"wrap"}}>
                        <h3 className="df" style={{margin:0,fontSize:"1.1rem",color:"#f0ddb0",fontWeight:700,fontFamily:isHe?"'Frank Ruhl Libre',serif":"'Cinzel',serif"}}>{isHe?(s.hebrew||s.name):s.name}</h3>
                      </div>
                      <div style={{fontSize:"0.9rem",color:"#c9a45a",fontStyle:"italic",marginTop:"0.15rem"}}>{s.subtitle}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"0.78rem",color:"#a08050",letterSpacing:"0.1em",textTransform:"uppercase"}}>{T("per_offering")}</div>
                      <div className="df" style={{fontSize:"1.5rem",color:"#f0c060",fontWeight:700}}>{fmtC(cost)}</div>
                      {currency==="usd"&&<div style={{fontSize:"0.82rem",color:"#7a5030"}}>{fmtNIS(cost/usdPerNis)}</div>}
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                      <button onClick={()=>setCount(s.id,count-1)} style={qBtn(count>0)}>-</button>
                      <input type="number" min="0" value={count} onChange={e=>setCount(s.id,parseInt(e.target.value)||0)} style={{width:52,padding:"0.4rem",background:"#1a0c04",border:"1px solid #7a4f20",color:"#f0ddb0",textAlign:"center",fontFamily:"inherit",fontSize:"1rem"}}/>
                      <button onClick={()=>setCount(s.id,count+1)} style={qBtn(true)}>+</button>
                      <button onClick={()=>setExpanded(e=>({...e,[s.id]:!e[s.id]}))} style={{marginLeft:"0.5rem",background:"transparent",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.9rem",fontFamily:"inherit",fontStyle:"italic",textDecoration:"underline",textUnderlineOffset:"3px"}}>{isExp?T("hide"):T("details")}</button>
                    </div>
                    {count>0&&<div className="df" style={{fontSize:"1.1rem",color:"#f0ddb0",fontWeight:700}}>= {fmtC(count*cost)}</div>}
                  </div>
                  {isExp&&(<div className="fi" style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px dashed #5a3a1a"}}>
                    <div style={{fontSize:"0.95rem",lineHeight:1.7,color:"#e8d4a0",marginBottom:"0.6rem"}}>{s.description}</div>
                    <div style={{fontSize:"0.85rem",color:"#8a6030",fontStyle:"italic",marginBottom:"0.6rem"}}>{s.source}</div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.92rem"}}>
                      <tbody>{s.components.map((c,i)=>(
                        <tr key={i} style={{borderBottom:"1px dotted #5a3a1a"}}>
                          <td style={{padding:"0.3rem 0",color:"#e8d4a0"}}>{c.label}</td>
                          <td style={{padding:"0.3rem 0",textAlign:"right",color:"#f0c060",fontFamily:"'Cinzel',serif",fontSize:"0.88rem",whiteSpace:"nowrap"}}>{fmtC(compCost(c.key,c.count,P))}</td>
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
                  <div style={{fontSize:"0.82rem",color:"#f0ddb0",letterSpacing:"0.2em",textTransform:"uppercase",opacity:.8}}>{T("cat_total_lbl")} {catalogSelected} {catalogSelected===1?T("offering_lbl"):T("offerings_lbl")}</div>
                  <div className="df" style={{fontSize:"2rem",color:"#f0c060",fontWeight:900}}>{fmtC(catalogTotal)}</div>
                </div>
                <button onClick={()=>setCounts({})} style={{background:"transparent",border:"2px solid #f0ddb0",color:"#f0ddb0",padding:"0.5rem 1rem",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.85rem",letterSpacing:"0.1em",fontWeight:600}}>{T("clear")}</button>
              </div>
            )}
            {disclaimer}
          </div>
        )}

        {/* ══ PRICES & SOURCES ══ */}
        {activeTab==="prices"&&(
          <div className="fi">
            <div style={{marginBottom:"1.5rem",padding:"1rem 1.25rem",background:"rgba(90,171,223,.07)",border:"1px solid #3a7aaa",borderLeft:"3px solid #5aabdf",fontSize:"1rem",lineHeight:1.7,color:"#e8d4a0"}}>
              <strong style={{color:"#f0ddb0"}}>{T("prices_intro")}</strong> {T("prices_conv")} {nisPerUsd}.
            </div>
            <div style={{marginBottom:"1.5rem",padding:"1rem 1.25rem",background:"rgba(240,192,96,.06)",border:"1px solid #7a4f20",borderLeft:"3px solid #f0c060"}}>
              <div style={{marginBottom:"0.4rem"}}>
                <span className="df" style={{fontSize:"0.85rem",color:"#f0c060",letterSpacing:"0.1em"}}>{T("active_shita")} </span>
                <span style={{fontSize:"1rem",color:"#f0ddb0",fontWeight:700}}>{shiur.labelShort}</span>
                <span className="hf" style={{marginLeft:"0.6rem",color:"#f0c060",fontSize:"1.15rem"}}>{shiur.hebrew}</span>
                <span style={{marginLeft:"0.75rem",fontSize:"0.88rem",color:"#a08050",fontStyle:"italic"}}>{shiur.source}</span>
              </div>
              <div style={{fontSize:"0.95rem",color:"#c9a45a",lineHeight:1.65}}>{shiur.notes}</div>
              {shiurId!=="naeh"&&<div style={{marginTop:"0.4rem",fontSize:"0.9rem",color:"#b070e0"}}>{T("agr_mult")}{shiur.multiplier} {T("agr_baseline")}</div>}
            </div>

            {[
              {tkey:"livestock",   keys:["bull","ram","lamb","goat","bird"],                              isAgr:false},
              {tkey:"agricultural",keys:["issaron_flour","log_oil","log_wine","frankincense","ketores","wood","salt"],isAgr:true},
            ].map(({tkey,keys,isAgr})=>(
              <div key={tkey} style={{marginBottom:"2rem"}}>
                <div style={{borderBottom:"1px solid #5a3a1a",paddingBottom:"0.5rem",marginBottom:"0.75rem"}}>
                  <h2 className="df" style={{margin:0,fontSize:"0.9rem",color:"#f0c060",letterSpacing:"0.15em",textTransform:"uppercase"}}>{T(tkey)}</h2>
                </div>
                {keys.map(key=>{
                  const isFixed=key==="ketores"||key==="frankincense"||key==="wood"||key==="salt";
                  const baseNIS=JLM_NIS[key];const m=(isAgr&&!isFixed)?shiur.multiplier:1;const adjNIS=baseNIS*m;const usdPrice=adjNIS*usdPerNis;
                  const isExp=expandedPrice[key];const {src,url,note}=JLM_SOURCES[key];
                  return(<div key={key} style={{background:"rgba(24,12,4,.7)",border:"1px solid #5a3a1a",borderLeft:"4px solid "+(isAgr?"#b070e0":"#7a4f20"),padding:"0.9rem 1rem",marginBottom:"0.55rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem",flexWrap:"wrap"}}>
                      <div style={{flex:"1 1 200px"}}>
                        <div style={{display:"flex",alignItems:"baseline",gap:"0.5rem",flexWrap:"wrap"}}>
                          <span style={{fontWeight:700,fontSize:"1rem",color:"#f0ddb0",textTransform:"capitalize"}}>{key==="ketores"?"Ketores (per offering)":key.replace(/_/g," ")}</span>
                          {isAgr&&!isFixed&&<span style={{fontSize:"0.72rem",color:"#b070e0",border:"1px solid #b070e0",padding:"0.1rem 0.35rem",letterSpacing:"0.08em"}}>{T("shiur_dep")}</span>}
                          {key==="ketores"&&<span style={{fontSize:"0.72rem",color:"#4ec98a",border:"1px solid #4ec98a",padding:"0.1rem 0.35rem",letterSpacing:"0.08em"}}>{T("fixed_formula")}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:"1rem",flexShrink:0}}>
                        <div style={{textAlign:"right"}}>
                          {currency==="usd"&&<div style={{fontSize:"0.82rem",color:"#a08050"}}>NIS {adjNIS.toFixed(1)}{isAgr&&!isFixed&&shiurId!=="naeh"&&<span style={{color:"#b070e0"}}> x{shiur.multiplier}</span>}</div>}
                          <div className="df" style={{fontSize:"1.5rem",color:"#f0c060",fontWeight:700}}>{fmtC(usdPrice)}</div>
                        </div>
                        <button onClick={()=>setExpandedPrice(e=>({...e,[key]:!e[key]}))} style={{background:"transparent",border:"none",color:"#c9a45a",cursor:"pointer",fontSize:"0.9rem",fontFamily:"inherit",fontStyle:"italic",textDecoration:"underline",textUnderlineOffset:"3px",whiteSpace:"nowrap"}}>{isExp?T("hide"):T("sources_btn")}</button>
                      </div>
                    </div>
                    {isExp&&(<div className="fi" style={{marginTop:"0.85rem",paddingTop:"0.85rem",borderTop:"1px dashed #5a3a1a",display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                      {isAgr&&!isFixed&&shiurId!=="naeh"&&<div style={{padding:"0.4rem 0.75rem",background:"rgba(176,112,224,.08)",border:"1px solid rgba(176,112,224,.27)",fontSize:"0.9rem",color:"#c9a45a",lineHeight:1.6}}><strong style={{color:"#f0ddb0"}}>{T("shiur_impact")}</strong> Base (R' Naeh x1.0) = NIS {baseNIS} — {shiur.labelShort} x{shiur.multiplier} = NIS {adjNIS.toFixed(1)} = <strong style={{color:"#f0c060"}}>{fmtC(usdPrice)}</strong></div>}
                      <div><div style={{fontSize:"0.78rem",color:"#a08050",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.2rem"}}>{T("source_lbl")}</div><div style={{fontSize:"0.95rem",color:"#e8d4a0",lineHeight:1.6}}>{src}{url&&<> — <a href={url} target="_blank" rel="noopener noreferrer" className="sl">{url.replace("https://","")}</a></>}</div></div>
                      <div><div style={{fontSize:"0.78rem",color:"#a08050",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.2rem"}}>{T("notes_lbl")}</div><div style={{fontSize:"0.95rem",color:"#c9a45a",lineHeight:1.6,fontStyle:"italic"}}>{note}</div></div>
                    </div>)}
                  </div>);
                })}
              </div>
            ))}

            <div style={{marginBottom:"2rem"}}>
              <div style={{borderBottom:"1px solid #5a3a1a",paddingBottom:"0.5rem",marginBottom:"0.75rem",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <h2 className="df" style={{margin:0,fontSize:"0.9rem",color:"#f0c060",letterSpacing:"0.15em",textTransform:"uppercase"}}>{T("halachic_meas")}</h2>
                <span style={{fontSize:"0.88rem",color:"#a08050",fontStyle:"italic"}}>{T("per_lbl")} {shiur.labelShort}</span>
              </div>
              {[
                {unit:"Ephah",   equiv:((shiur.issaron_L*10).toFixed(1))+"L",        basis:"10 x issaron. "+(shiur.labelShort)+": "+(shiur.issaron_L)+"L per issaron."},
                {unit:"Issaron", equiv:(shiur.issaron_L)+"L / ~"+(shiur.issaron_kg)+"kg flour",basis:"1/10 ephah. ("+(shiur.source)+")"},
                {unit:"Hin",     equiv:((shiur.log_ml*12/1000).toFixed(2))+"L",       basis:"12 log. log="+(shiur.log_ml)+"ml."},
                {unit:"Log",     equiv:(shiur.log_ml)+"ml (~"+((shiur.log_ml/29.57).toFixed(1))+" fl oz)",basis:"6 beitzim. beitzah="+(shiur.beitzah_ml)+"ml."},
                {unit:"Beitzah", equiv:(shiur.beitzah_ml)+"ml",                       basis:shiur.source},
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
        Created by Jeremy Spier and Morris Massel with a lot of help from Claude.ai. Send questions and comments to info@korbancalculator.com
      </div>
      <div style={{textAlign:"center",marginTop:"0.5rem",color:"#ffffff",fontSize:"0.82rem",opacity:0.7}}>
        Code available at <a href="https://github.com/morrismassel/korbanos-site" target="_blank" rel="noopener noreferrer" style={{color:"#c9a45a",textDecoration:"underline",textUnderlineOffset:"3px"}}>github.com/morrismassel/korbanos-site</a>
        {" · "}
        <a href="https://github.com/morrismassel/korbanos-site#readme" target="_blank" rel="noopener noreferrer" style={{color:"#c9a45a",textDecoration:"underline",textUnderlineOffset:"3px"}}>Methodology &amp; Sources</a>
      </div>

      {/* ── Print Modal ─────────────────────────────────────────────────── */}
      {showPrint&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}} onClick={()=>setShowPrint(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",color:"#111",maxWidth:680,width:"100%",maxHeight:"90vh",overflowY:"auto",padding:"2.5rem",fontFamily:"Georgia,serif",fontSize:"14px",lineHeight:1.7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem",borderBottom:"2px solid #111",paddingBottom:"1rem"}}>
              <div>
                <div style={{fontSize:"22px",fontWeight:700,letterSpacing:"0.05em",fontFamily:"'Cinzel',serif"}}>KORBANOS CALCULATOR</div>
                <div style={{fontSize:"13px",color:"#555",marginTop:"0.2rem"}}>korbancalculator.com — Estimated Annual Bill</div>
              </div>
              <div style={{textAlign:"right",fontSize:"12px",color:"#777"}}>
                <div>{new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
                <div>Shiur: {shiur.labelShort} · {financialTier.charAt(0).toUpperCase()+financialTier.slice(1)} · {regalimCount} regel{regalimCount!==1?"im":""}</div>
                <div>{livesInEY?"Eretz Yisroel":"Chutz L'Aretz"}</div>
              </div>
            </div>

            {byCategory.filter(x=>!x.isTravel||(!livesInEY&&includeTravel)).map(({cat,items,subtotal,isTravel})=>(
              <div key={cat} style={{marginBottom:"1.25rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #ccc",paddingBottom:"0.2rem",marginBottom:"0.4rem"}}>
                  <strong style={{fontSize:"13px",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Cinzel',serif"}}>{CAT_NAMES[cat]||cat}</strong>
                  <strong>{fmtC(subtotal)}</strong>
                </div>
                {isTravel
                  ? <div style={{display:"flex",justifyContent:"space-between",padding:"0.15rem 0",color:"#444"}}><span>Travel ({regalimCount} regalim)</span><span>{fmtC(subtotal)}</span></div>
                  : items.map(item=>{
                      const qty=getQty(item.id); if(!qty) return null;
                      const cost=qty*resolveUnitCost(item.id,P);
                      return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",padding:"0.15rem 0",color:"#333"}}>
                        <span>{item.label}{qty>1?" × "+qty:""}</span>
                        <span>{fmtC(cost)}</span>
                      </div>);
                    })
                }
              </div>
            ))}

            <div style={{borderTop:"2px solid #111",paddingTop:"0.75rem",display:"flex",justifyContent:"space-between",fontSize:"18px",fontWeight:700,fontFamily:"'Cinzel',serif",marginBottom:"1rem"}}>
              <span>Total</span><span>{fmtC(annualTotal)}</span>
            </div>
            <div style={{fontSize:"11px",color:"#888",borderTop:"1px solid #ddd",paddingTop:"0.75rem",lineHeight:1.6}}>
              For educational purposes only. Do not rely on anything here for any halachic decision. All prices are Jerusalem market rates converted at live NIS/USD. Shiur: {shiur.labelShort}. Silver: ${(silverUsdPerGram*31.1035).toFixed(2)}/troy oz. Rate: $1 = NIS {(1/usdPerNis).toFixed(2)}.
            </div>
            <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem",justifyContent:"flex-end"}}>
              <button onClick={()=>window.print()} style={{padding:"0.5rem 1.25rem",background:"#111",color:"#fff",border:"none",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"0.08em"}}>Print / Save PDF</button>
              <button onClick={()=>setShowPrint(false)} style={{padding:"0.5rem 1.25rem",background:"transparent",color:"#555",border:"1px solid #999",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"13px"}}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function qBtn(e){return{width:38,height:38,background:e?"#7a4f20":"#2a1a08",border:"1px solid "+(e?"#c9a45a":"#5a3a1a"),color:e?"#f0ddb0":"#5a3a1a",cursor:e?"pointer":"not-allowed",fontSize:"1.2rem",fontFamily:"inherit",opacity:e?1:0.4};}
