import type { VoiceLanguage } from "../types";

export const languages: VoiceLanguage[] = [
  {
    code: "en-US",
    name: "English",
    voices: [
      {
        value: "English-US.Female-1",
        name: "Female",
      },
      {
        value: "English-US.Male-1",
        name: "Male",
      },
    ],
  },
];

export default languages;
