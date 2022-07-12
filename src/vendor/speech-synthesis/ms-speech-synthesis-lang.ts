import { rawData } from "./ms-speech-synthesis-raw";

import type { VoiceLanguage } from "../types";

export const languages: VoiceLanguage[] = [];

rawData.forEach((data) => {
  const lang = languages.find((l) => {
    return l.code === data.Locale;
  });

  if (!lang) {
    languages.push({
      code: data.Locale,
      name: data.LocaleName,
      voices: rawData
        .filter((d) => {
          return d.Locale === data.Locale;
        })
        .map((d) => {
          return {
            value: d.ShortName,
            name: `${d.DisplayName} (${d.Gender})`,
          };
        }),
    });
  }
});

export default languages;
