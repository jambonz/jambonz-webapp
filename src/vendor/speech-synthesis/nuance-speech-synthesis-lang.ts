import type { VoiceLanguage } from "../types";

export const languages: VoiceLanguage[] = [
  {
    code: "ar-WW",
    name: "Arabic (Worldwide)",
    voices: [
      {
        value: "laila - standard",
        name: "Laila (standard)",
        model: "standard",
      },
      {
        value: "tarik - standard",
        name: "Tarik (standard)",
        model: "standard",
      },
      {
        value: "miriam - standard",
        name: "Miriam (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "eu-ES",
    name: "Basque (Spain)",
    voices: [{ value: "laila", name: "Miren (standard)", model: "standard" }],
  },
  {
    code: "bn-IN",
    name: "Bengali (India)",
    voices: [
      { value: "paya - standard", name: "Paya (standard)", model: "standard" },
    ],
  },
  {
    code: "bho-IN",
    name: "Bhojpuri (India)",
    voices: [
      { value: "jaya - standard", name: "Jaya (standard)", model: "standard" },
    ],
  },
  {
    code: "bg-BG",
    name: "Bulgarian (Bulgaria)",
    voices: [
      {
        value: "daria - standard",
        name: "Daria (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "yue-HK",
    name: "Cantonese (Hong Kong)",
    voices: [
      {
        value: "sinji-ml - standard",
        name: "Sinji-Ml (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "ca-ES",
    name: "Catalan (Spain)",
    voices: [
      {
        value: "jordi - standard",
        name: "Jordi (standard)",
        model: "standard",
      },
      {
        value: "montserrat - standard",
        name: "Montserrat (standard)",
        model: "enhanced",
      },
    ],
  },
  {
    code: "yue-HK",
    name: "Croatian (Croatia)",
    voices: [
      { value: "lana - standard", name: "Lana (standard)", model: "standard" },
    ],
  },
  {
    code: "cs-CZ",
    name: "Czech (Czech Republic)",
    voices: [
      {
        value: "iveta - standard",
        name: "Iveta (standard)",
        model: "standard",
      },
      {
        value: "zuzana - standard",
        name: "Zuzana (standard)",
        model: "standard",
      },
      {
        value: "zuzana-ml - enhanced",
        name: "Zuzana (enhanced)",
        model: "enhanced",
      },
    ],
  },
  {
    code: "da-DK",
    name: "Danish (Denmark)",
    voices: [
      {
        value: "magnus - standard",
        name: "Magnus (standard)",
        model: "standard",
      },
      { value: "sara - standard", name: "Sara (standard)", model: "standard" },
    ],
  },
  {
    code: "nl-BE",
    name: "Dutch (Belgium)",
    voices: [
      {
        value: "ellen - standard",
        name: "Ellen (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "nl-NL",
    name: "Dutch (Belgium)",
    voices: [
      {
        value: "claire-ml - standard",
        name: "Claire-Ml (standard)",
        model: "standard",
      },
      {
        value: "xander - standard",
        name: "Xander (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "en-AU",
    name: "English (Australia)",
    voices: [
      {
        value: "karen - standard",
        name: "Karen (standard)",
        model: "standard",
      },
      { value: "lee - standard", name: "Lee (standard)", model: "standard" },
      {
        value: "matilda - enhanced",
        name: "Matilda (enhanced)",
        model: "enhanced",
      },
    ],
  },
  {
    code: "en-IN",
    name: "English (India)",
    voices: [
      {
        value: "isha-ml - enhanced",
        name: "Isha-Ml (enhanced)",
        model: "enhanced",
      },
      {
        value: "rishi - standard",
        name: "Rishi (standard)",
        model: "standard",
      },
      {
        value: "rishi-Ml - standard",
        name: "Rishi-Ml (standard)",
        model: "standard",
      },
      {
        value: "sangeeta - standard",
        name: "Sangeeta (standard)",
        model: "standard",
      },
      {
        value: "veena - standard",
        name: "Veena (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "en-IE",
    name: "English (Ireland)",
    voices: [
      {
        value: "moira - standard",
        name: "Moira (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "en-SC",
    name: "English (Scotland)",
    voices: [
      {
        value: "fiona - standard",
        name: "Fiona (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "en-ZA",
    name: "English (South Africa)",
    voices: [
      {
        value: "tessa - standard",
        name: "Tessa (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "en-GB",
    name: "English (United Kingdom)",
    voices: [
      {
        value: "daniel - standard",
        name: "Daniel (standard)",
        model: "standard",
      },
      { value: "kate - standard", name: "Kate (standard)", model: "standard" },
      {
        value: "malcolm - standard",
        name: "Malcolm (standard)",
        model: "standard",
      },
      {
        value: "oliver - standard",
        name: "Oliver (standard)",
        model: "standard",
      },
      {
        value: "serena - enhanced",
        name: "Malcolm (enhanced)",
        model: "enhanced",
      },
      {
        value: "simon - standard",
        name: "Simon (standard)",
        model: "standard",
      },
      {
        value: "stephanie - standard",
        name: "Stephanie (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "en-US",
    name: "English (United States)",
    voices: [
      {
        value: "allison - standard",
        name: "Allison (standard)",
        model: "standard",
      },
      {
        value: "ava-ml - enhanced",
        name: "Ava-Ml (enhanced)",
        model: "enhanced",
      },
      {
        value: "chloe - standard",
        name: "Chloe (standard)",
        model: "standard",
      },
      { value: "evan - enhanced", name: "Evan (enhanced)", model: "enhanced" },
      {
        value: "nathan - enhanced",
        name: "Nathan (enhanced)",
        model: "enhanced",
      },
      {
        value: "evelyn - standard",
        name: "Evelyn (standard)",
        model: "standard",
      },
      {
        value: "nolan - standard",
        name: "Nolan (standard)",
        model: "standard",
      },
      {
        value: "samantha - standard",
        name: "Samantha (standard)",
        model: "standard",
      },
      {
        value: "susan - standard",
        name: "Susan (standard)",
        model: "standard",
      },
      { value: "tom - standard", name: "Tom (standard)", model: "standard" },
      {
        value: "zoe-ml - enhanced",
        name: "Zoe-Ml (enhanced)",
        model: "enhanced",
      },
    ],
  },
  {
    code: "fi-FI",
    name: "Finnish (Finland)",
    voices: [
      { value: "onni - standard", name: "Onni (standard)", model: "standard" },
      { value: "satu - standard", name: "Satu (standard)", model: "standard" },
    ],
  },
  {
    code: "fr-BE",
    name: "French (Belgium)",
    voices: [
      { value: "aude - standard", name: "Aude (standard)", model: "standard" },
    ],
  },
  {
    code: "fr-CA",
    name: "French (Canada)",
    voices: [
      {
        value: "amelie-ml - enhanced",
        name: "Amelie-Ml (enhanced)",
        model: "enhanced",
      },
      {
        value: "chantal - standard",
        name: "Chantal (standard)",
        model: "standard",
      },
      {
        value: "nicolas - standard",
        name: "Nicolas (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "fr-FR",
    name: "French (France)",
    voices: [
      {
        value: "audrey-ml - enhanced",
        name: "Audrey-Ml (enhanced)",
        model: "enhanced",
      },
      {
        value: "aurelie - standard",
        name: "Aurelie (standard)",
        model: "standard",
      },
      {
        value: "thomas - standard",
        name: "Thomas (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "gl-ES",
    name: "Galician (Spain)",
    voices: [
      {
        value: "aarmela - standard",
        name: "Carmela (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "de-DE",
    name: "German (Germany)",
    voices: [
      {
        value: "anna-ml - enhanced",
        name: "Anna-Ml (enhanced)",
        model: "enhanced",
      },
      {
        value: "markus - standard",
        name: "Markus (standard)",
        model: "standard",
      },
      {
        value: "petra-Ml - enhanced",
        name: "Petra-Ml (enhanced)",
        model: "enhanced",
      },
      {
        value: "viktor - standard",
        name: "Viktor (standard)",
        model: "standard",
      },
      {
        value: "yannick - standard",
        name: "Yannick (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "el-GR",
    name: "Greek (Greece)",
    voices: [
      {
        value: "melina - standard",
        name: "Melina (standard)",
        model: "standard",
      },
      {
        value: "nikos - standard",
        name: "Nikos (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "he-IL",
    name: "Hebrew (Israel)",
    voices: [
      {
        value: "carmit - standard",
        name: "Carmit (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "hi-IN",
    name: "Hindi (India)",
    voices: [
      {
        value: "miyara-ml - enhanced",
        name: "Kiyara-Ml (enhanced)",
        model: "enhanced",
      },
      {
        value: "lekha - standard",
        name: "Lekha (standard)",
        model: "standard",
      },
      { value: "neel - standard", name: "Neel (standard)", model: "standard" },
      {
        value: "neel-ml - standard",
        name: "Neel-Ml (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "hu-HU",
    name: "Hungarian (Hungary)",
    voices: [
      {
        value: "mariska - standard",
        name: "Mariska (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "id-ID",
    name: "Indonesian (Indonesia)",
    voices: [
      {
        value: "damayanti - standard",
        name: "Damayanti (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "it-IT",
    name: "Italian (Italy)",
    voices: [
      { value: "emma - enhanced", name: "Emma (enhanced)", model: "enhanced" },
      {
        value: "federica-ml - standard",
        name: "Federica-Ml (standard)",
        model: "standard",
      },
      { value: "luca - standard", name: "Luca (standard)", model: "standard" },
      {
        value: "neel-ml - standard",
        name: "Neel-Ml (standard)",
        model: "standard",
      },
      {
        value: "paola - standard",
        name: "Paola (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "ja-JP",
    name: "Japanese (Japan)",
    voices: [
      {
        value: "ayane - standard",
        name: "Ayane (standard)",
        model: "standard",
      },
      {
        value: "daisuke - standard",
        name: "Daisuke (standard)",
        model: "standard",
      },
      {
        value: "ichiro - standard",
        name: "Ichiro (standard)",
        model: "standard",
      },
      {
        value: "koharu - standard",
        name: "Koharu (standard)",
        model: "standard",
      },
      {
        value: "kyoko - standard",
        name: "Kyoko (standard)",
        model: "standard",
      },
      {
        value: "mizuki - standard",
        name: "Mizuki (standard)",
        model: "standard",
      },
      {
        value: "otoya - standard",
        name: "Otoya (standard)",
        model: "standard",
      },
      {
        value: "sakura - standard",
        name: "Sakura (standard)",
        model: "standard",
      },
      {
        value: "seiji - standard",
        name: "Seiji (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "kn-IN",
    name: "Kannada (India)",
    voices: [
      {
        value: "alpana - standard",
        name: "Alpana (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "ko-KR",
    name: "Korean (South Korea)",
    voices: [
      { value: "jina - enhanced", name: "Jina (enhanced)", model: "enhanced" },
      { value: "sora - standard", name: "Sora (standard)", model: "standard" },
      { value: "yuna - standard", name: "Yuna (standard)", model: "standard" },
      {
        value: "yuna-ml - enhanced",
        name: "Yuna-Ml (enhanced)",
        model: "enhanced",
      },
    ],
  },
  {
    code: "zlm-MY",
    name: "Malay (Malaysia)",
    voices: [
      {
        value: "amira - standard",
        name: "Amira (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "zh-CN",
    name: "Mandarin (China)",
    voices: [
      {
        value: "lili-ml - enhanced",
        name: "Lili-Ml (enhanced)",
        model: "enhanced",
      },
      {
        value: "binbin-ml - standard",
        name: "Binbin-Ml (standard)",
        model: "standard",
      },
      {
        value: "lilian-ml - standard",
        name: "Lilian-Ml (standard)",
        model: "standard",
      },
      {
        value: "lisheng-ml - standard",
        name: "Lisheng-Ml (standard)",
        model: "standard",
      },
      {
        value: "tiantian-ml - standard",
        name: "Tiantian-Ml (standard)",
        model: "standard",
      },
      {
        value: "tingting-ml - standard",
        name: "Tingting-Ml (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "cmn-TW",
    name: "Mandarin (Taiwan)",
    voices: [
      {
        value: "meijia-ml - standard",
        name: "Meijia-Ml (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "mr-IN",
    name: "Marathi (India)",
    voices: [
      {
        value: "ananya - standard",
        name: "Ananya (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "nb-NO",
    name: "Norwegian Bokmål (Norway)",
    voices: [
      {
        value: "henrik - standard",
        name: "Henrik (standard)",
        model: "standard",
      },
      { value: "nora - standard", name: "Nora (standard)", model: "standard" },
    ],
  },
  {
    code: "pl-PL",
    name: "Polish (Poland)",
    voices: [
      { value: "ewa - enhanced", name: "Ewa (enhanced)", model: "enhanced" },
      {
        value: "krzysztof - standard",
        name: "Krzysztof (standard)",
        model: "standard",
      },
      {
        value: "zosia - standard",
        name: "Zosia (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    voices: [
      {
        value: "luciana - enhanced",
        name: "Luciana (enhanced)",
        model: "enhanced",
      },
      {
        value: "fernanda - standard",
        name: "Fernanda (standard)",
        model: "standard",
      },
      {
        value: "felipe - standard",
        name: "Felipe (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "pt-PT",
    name: "Portuguese (Portugal)",
    voices: [
      {
        value: "catarina - standard",
        name: "Catarina (standard)",
        model: "standard",
      },
      {
        value: "joana - standard",
        name: "Joana (standard)",
        model: "standard",
      },
      {
        value: "joaquim - standard",
        name: "Joaquim (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "ro-RO",
    name: "Romanian (Romania)",
    voices: [
      {
        value: "ioana - standard",
        name: "Ioana (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "ru-RU",
    name: "Russian (Russia)",
    voices: [
      {
        value: "katya - standard",
        name: "Katya (standard)",
        model: "standard",
      },
      {
        value: "katya-ml - standard",
        name: "Katya-Ml (standard)",
        model: "standard",
      },
      {
        value: "milena - standard",
        name: "Milena (standard)",
        model: "standard",
      },
      { value: "yuri - standard", name: "Yuri (standard)", model: "standard" },
    ],
  },
  {
    code: "sk-SK",
    name: "Slovak (Slovakia)",
    voices: [
      {
        value: "laura - standard",
        name: "Laura (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "es-AR",
    name: "Spanish (Argentina)",
    voices: [
      {
        value: "diego - standard",
        name: "Diego (standard)",
        model: "standard",
      },
      {
        value: "isabela - standard",
        name: "Isabela (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "es-CL",
    name: "Spanish (Chile)",
    voices: [
      {
        value: "francisca - standard",
        name: "Francisca (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "es-CO",
    name: "Spanish (Colombia)",
    voices: [
      {
        value: "carlos - standard",
        name: "Carlos (standard)",
        model: "standard",
      },
      {
        value: "soledad - standard",
        name: "Soledad (standard)",
        model: "standard",
      },
      {
        value: "ximena - standard",
        name: "Ximena (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "es-MX",
    name: "Spanish (Mexico)",
    voices: [
      {
        value: "angelica - standard",
        name: "Angelica (standard)",
        model: "standard",
      },
      {
        value: "javier - standard",
        name: "Javier (standard)",
        model: "standard",
      },
      { value: "juan - standard", name: "Juan (standard)", model: "standard" },
      {
        value: "paulina-ml - enhanced",
        name: "Paulina-Ml (enhanced)",
        model: "enhanced",
      },
    ],
  },
  {
    code: "es-ES",
    name: "Spanish (Spain)",
    voices: [
      {
        value: "jorge - standard",
        name: "Jorge (standard)",
        model: "standard",
      },
      {
        value: "marisol-ml - standard",
        name: "Marisol-Ml (standard)",
        model: "standard",
      },
      {
        value: "monica-ml - standard",
        name: "Monica-Ml (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "sv-SE",
    name: "Swedish (Sweden)",
    voices: [
      { value: "alva - standard", name: "Alva (standard)", model: "standard" },
      {
        value: "klara - standard",
        name: "Klara (standard)",
        model: "standard",
      },
      {
        value: "oskar - standard",
        name: "Oskar (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "ta-IN",
    name: "Tamil (India)",
    voices: [
      { value: "vani - standard", name: "Vani (standard)", model: "standard" },
    ],
  },
  {
    code: "te-IN",
    name: "Telugu (India)",
    voices: [
      {
        value: "geeta - standard",
        name: "Geeta (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "th-TH",
    name: "Thai (Thailand)",
    voices: [
      {
        value: "kanya - enhanced",
        name: "Kanya (enhanced)",
        model: "enhanced",
      },
      {
        value: "narisa - standard",
        name: "Narisa (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "tr-TR",
    name: "Turkish (Turkey)",
    voices: [
      {
        value: "cem-ml - standard",
        name: "Cem-Ml (standard)",
        model: "standard",
      },
      {
        value: "yelda - standard",
        name: "Yelda (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "uk-UA",
    name: "Ukrainian (Ukraine)",
    voices: [
      {
        value: "lesya - standard",
        name: "Lesya (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "va-ES",
    name: "Valencian (Spain)",
    voices: [
      {
        value: "empar - standard",
        name: "Empar (standard)",
        model: "standard",
      },
    ],
  },
  {
    code: "vi-VN",
    name: "Vietnamese (Vietnam)",
    voices: [
      { value: "linh - standard", name: "Linh (standard)", model: "standard" },
    ],
  },
];

export default languages;
