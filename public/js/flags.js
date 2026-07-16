/**
 * Language → country flag mapping and renderer.
 * Emoji flags don't render on Windows/Chrome, so we load real flag images
 * (circle-flags SVGs via jsDelivr). Each language maps to an ISO 3166-1
 * alpha-2 country code; languages with no country fall back to a globe icon.
 */
export const COUNTRY = {
  english: "gb", spanish: "es", french: "fr", german: "de", italian: "it",
  portuguese: "br", "portuguese-portugal": "pt", dutch: "nl", russian: "ru",
  "chinese-simplified": "cn", "chinese-traditional": "tw", cantonese: "hk",
  japanese: "jp", korean: "kr", arabic: "sa", hindi: "in", bangla: "bd",
  urdu: "pk", turkish: "tr", vietnamese: "vn", indonesian: "id", thai: "th",
  polish: "pl", ukrainian: "ua", greek: "gr", hebrew: "il", persian: "ir",
  swedish: "se", norwegian: "no", danish: "dk", finnish: "fi", czech: "cz",
  slovak: "sk", hungarian: "hu", romanian: "ro", bulgarian: "bg", serbian: "rs",
  croatian: "hr", bosnian: "ba", slovenian: "si", albanian: "al",
  macedonian: "mk", lithuanian: "lt", latvian: "lv", estonian: "ee",
  icelandic: "is", irish: "ie", filipino: "ph", malay: "my",
  "malay-arabic": "my", swahili: "ke", amharic: "et", somali: "so",
  hausa: "ng", yoruba: "ng", igbo: "ng", zulu: "za", xhosa: "za",
  afrikaans: "za", nepali: "np", sinhala: "lk", tamil: "in", telugu: "in",
  kannada: "in", malayalam: "in", marathi: "in", gujarati: "in", punjabi: "in",
  "punjabi-arabic": "pk", odia: "in", assamese: "in", burmese: "mm",
  khmer: "kh", lao: "la", mongolian: "mn", kazakh: "kz", uzbek: "uz",
  azerbaijani: "az", georgian: "ge", armenian: "am", pashto: "af", dari: "af",
  maltese: "mt", luxembourgish: "lu", belarusian: "by", tajik: "tj",
  kyrgyz: "kg", turkmen: "tm", "haitian-creole": "ht", samoan: "ws",
  maori: "nz", fijian: "fj", tongan: "to", hawaiian: "us", tigrinya: "er",
  kinyarwanda: "rw", catalan: "es", basque: "es", galician: "es", welsh: "gb",
  "scottish-gaelic": "gb", acehnese: "id", acoli: "ug", afar: "et", akan: "gh",
  alur: "ug", awadhi: "in", aymara: "bo", balinese: "id", baluchi: "pk",
  bambara: "ml", "baoule": "ci", bashkir: "ru", "batak-karo": "id",
  "batak-simalungun": "id", "batak-toba": "id", bemba: "zm", betawi: "id",
  bhojpuri: "in", bikol: "ph", breton: "fr", buriat: "ru", chamorro: "gu",
  chechen: "ru", chiga: "ug", chuukese: "fm", chuvash: "ru", corsican: "fr",
  "crimean-tatar": "ua", "central-kurdish": "iq", kurdish: "iq", dinka: "ss",
  divehi: "mv", dogri: "in", dyula: "ci", dzongkha: "bt", ewe: "gh",
  faroese: "fo", fon: "bj", friulian: "it", fulani: "ng", ga: "gh",
  ganda: "ug", guarani: "py", "hakha-chin": "mm", hiligaynon: "ph",
  hmong: "cn", hunsrik: "br", iban: "my", iloko: "ph", "jamaican-patois": "jm",
  jingpo: "mm", kalaallisut: "gl", kanuri: "ng", khasi: "in", kituba: "cd",
  kokborok: "in", komi: "ru", kongo: "cd", konkani: "in", krio: "sl",
  latgalian: "lv", ligurian: "it", limburgish: "nl", lingala: "cd",
  lombard: "it", luo: "ke", madurese: "id", maithili: "in", makasar: "id",
  malagasy: "mg", mam: "gt", "manipuri-meitei-mayek": "in", manx: "im",
  marwari: "in", "meadow-mari": "ru", minangkabau: "id", mizo: "in",
  morisyen: "mu", "nahuatl-eastern-huasteca": "mx", ndau: "zw",
  "nepalbhasa-newari": "np", nko: "gn", "northern-sami": "no",
  "northern-sotho": "za", nuer: "ss", nyanja: "mw", occitan: "fr", oromo: "et",
  ossetic: "ge", pampanga: "ph", pangasinan: "ph", papiamento: "aw",
  "qeqchi": "gt", quechua: "pe", romany: "ro", rundi: "bi", sango: "cf",
  sanskrit: "in", "santali-latin": "in", "seselwa-creole-french": "sc",
  shan: "mm", shona: "zw", sicilian: "it", silesian: "pl", sindhi: "pk",
  "south-ndebele": "za", "southern-sotho": "ls", sundanese: "id", susu: "gn",
  swati: "sz", tahitian: "pf", tamazight: "ma", "tamazight-tifinagh": "ma",
  tatar: "ru", tetum: "tl", tibetan: "cn", tiv: "ng", "tok-pisin": "pg",
  tsonga: "za", tswana: "bw", tulu: "in", tumbuka: "mw", tuvinian: "ru",
  udmurt: "ru", uyghur: "cn", venda: "za", venetian: "it", waray: "ph",
  "western-frisian": "nl", wolof: "sn", yakut: "ru", yiddish: "il",
  "yucatec-maya": "mx", zapotec: "mx", dombe: "ao",
};

const GLOBE_SVG =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"></path></svg>';

/** Returns the flag markup (round SVG image) for a language code. */
export function flagHtml(code) {
  const cc = COUNTRY[code];
  if (code === "auto" || !cc) {
    return `<span class="lang-flag is-auto">${GLOBE_SVG}</span>`;
  }
  return `<img class="lang-flag" src="https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags/${cc}.svg" alt="" loading="lazy" width="22" height="22" />`;
}
