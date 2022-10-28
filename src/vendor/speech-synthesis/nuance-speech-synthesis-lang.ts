import type { VoiceLanguage } from "../types";

export const languages: VoiceLanguage[] = [
  {
    code: "ar-WW",
    name: "Arabic (Worldwide)",
    voices: [
      { value: "laila", name: "Laila (standard)", model: "standard" },
      { value: "tarik", name: "Tarik (standard)", model: "standard" },
      { value: "miriam", name: "Miriam (standard)", model: "standard" },
    ],
  },
  {
    code: "eu-ES",
    name: "Basque (Spain)",
    voices: [{ value: "laila", name: "Miren (standard)", model: "standard" }],
  },
  {
    code: "en-US",
    name: "English (United States)",
    voices: [
      { value: "allison", name: "Allison (standard)", model: "standard" },
      { value: "Ava-Ml", name: "Ava-Ml (enhanced)", model: "enhanced" },
    ],
  },
];

export default languages;
