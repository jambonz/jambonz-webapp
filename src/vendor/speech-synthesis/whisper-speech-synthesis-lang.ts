import type { VoiceLanguage } from "../types";

export const languages: VoiceLanguage[] = [
  {
    code: "en-US",
    name: "English",
    voices: [
      { value: "alloy", name: "Alloy" },
      { value: "echo", name: "Echo" },
      { value: "fable", name: "Fable" },
      { value: "onyx", name: "Onyx" },
      { value: "nova", name: "Nova" },
      { value: "shimmer", name: "Shimmer" },
    ],
  },
];

export default languages;
