/**
 * Full language set (Google-Translate style). Single source of truth:
 * the backend exposes this via GET /api/languages and the frontend loads
 * it, so the UI and validation can never drift apart.
 *
 * Codes are derived as slugs from the names (deterministic, no manual
 * lookup of ISO codes), and the human-readable name is what we send to the
 * model — LLMs translate by language *name* reliably.
 */
const NAMES = [
  "Abkhazian", "Acehnese", "Acoli", "Afar", "Afrikaans", "Akan", "Albanian",
  "Alur", "Amharic", "Arabic", "Armenian", "Assamese", "Avaric", "Awadhi",
  "Aymara", "Azerbaijani", "Balinese", "Baluchi", "Bambara", "Bangla",
  "Baoulé", "Bashkir", "Basque", "Batak Karo", "Batak Simalungun",
  "Batak Toba", "Belarusian", "Bemba", "Betawi", "Bhojpuri", "Bikol",
  "Bosnian", "Breton", "Bulgarian", "Buriat", "Burmese", "Cantonese",
  "Catalan", "Cebuano", "Central Kurdish", "Chamorro", "Chechen", "Chiga",
  "Chinese (Simplified)", "Chinese (Traditional)", "Chuukese", "Chuvash",
  "Corsican", "Crimean Tatar", "Croatian", "Czech", "Danish", "Dari",
  "Dinka", "Divehi", "Dogri", "Dombe", "Dutch", "Dyula", "Dzongkha",
  "English", "Esperanto", "Estonian", "Ewe", "Faroese", "Fijian", "Filipino",
  "Finnish", "Fon", "French", "Friulian", "Fulani", "Ga", "Galician",
  "Ganda", "Georgian", "German", "Greek", "Guarani", "Gujarati",
  "Haitian Creole", "Hakha Chin", "Hausa", "Hawaiian", "Hebrew",
  "Hiligaynon", "Hindi", "Hmong", "Hungarian", "Hunsrik", "Iban",
  "Icelandic", "Igbo", "Iloko", "Indonesian", "Irish", "Italian",
  "Jamaican Patois", "Japanese", "Javanese", "Jingpo", "Kalaallisut",
  "Kannada", "Kanuri", "Kazakh", "Khasi", "Khmer", "Kinyarwanda", "Kituba",
  "Kokborok", "Komi", "Kongo", "Konkani", "Korean", "Krio", "Kurdish",
  "Kyrgyz", "Lao", "Latgalian", "Latin", "Latvian", "Ligurian", "Limburgish",
  "Lingala", "Lithuanian", "Lombard", "Luo", "Luxembourgish", "Macedonian",
  "Madurese", "Maithili", "Makasar", "Malagasy", "Malay", "Malay (Arabic)",
  "Malayalam", "Maltese", "Mam", "Manipuri (Meitei Mayek)", "Manx", "Māori",
  "Marathi", "Marshallese", "Marwari", "Meadow Mari", "Minangkabau", "Mizo",
  "Mongolian", "Morisyen", "Nahuatl (Eastern Huasteca)", "Ndau",
  "Nepalbhasa (Newari)", "Nepali", "NKo", "Northern Sami", "Northern Sotho",
  "Norwegian", "Nuer", "Nyanja", "Occitan", "Odia", "Oromo", "Ossetic",
  "Pampanga", "Pangasinan", "Papiamento", "Pashto", "Persian", "Polish",
  "Portuguese", "Portuguese (Portugal)", "Punjabi", "Punjabi (Arabic)",
  "Q'eqchi'", "Quechua", "Romanian", "Romany", "Rundi", "Russian", "Samoan",
  "Sango", "Sanskrit", "Santali (Latin)", "Scottish Gaelic", "Serbian",
  "Seselwa Creole French", "Shan", "Shona", "Sicilian", "Silesian", "Sindhi",
  "Sinhala", "Slovak", "Slovenian", "Somali", "South Ndebele",
  "Southern Sotho", "Spanish", "Sundanese", "Susu", "Swahili", "Swati",
  "Swedish", "Tahitian", "Tajik", "Tamazight", "Tamazight (Tifinagh)",
  "Tamil", "Tatar", "Telugu", "Tetum", "Thai", "Tibetan", "Tigrinya", "Tiv",
  "Tok Pisin", "Tongan", "Tsonga", "Tswana", "Tulu", "Tumbuka", "Turkish",
  "Turkmen", "Tuvinian", "Udmurt", "Ukrainian", "Urdu", "Uyghur", "Uzbek",
  "Venda", "Venetian", "Vietnamese", "Waray", "Welsh", "Western Frisian",
  "Wolof", "Xhosa", "Yakut", "Yiddish", "Yoruba", "Yucatec Maya", "Zapotec",
  "Zulu",
];

/** Turn a display name into a stable url-safe code, e.g. "Māori" -> "maori". */
function toSlug(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/['’()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** { code: displayName } for every supported language (no "auto"). */
export const LANGUAGES = Object.fromEntries(
  NAMES.map((name) => [toSlug(name), name])
);

/** Same map, but with "auto" prepended — valid values for a source language. */
export const SOURCE_LANGUAGES = { auto: "Auto-detect", ...LANGUAGES };

export const TARGET_LANGUAGE_CODES = Object.keys(LANGUAGES);
export const SOURCE_LANGUAGE_CODES = Object.keys(SOURCE_LANGUAGES);

export function languageName(code) {
  return SOURCE_LANGUAGES[code] || LANGUAGES[code] || code;
}

export function isValidTarget(code) {
  return Object.prototype.hasOwnProperty.call(LANGUAGES, code);
}

export function isValidSource(code) {
  return Object.prototype.hasOwnProperty.call(SOURCE_LANGUAGES, code);
}
