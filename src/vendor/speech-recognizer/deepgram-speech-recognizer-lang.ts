import type { Language } from "../types";

export const languages: Language[] = [
  {
    name: "Chinese - general - base",
    code: "zh",
    model: "general",
    tier: "base",
  },
  {
    name: "Chinese (China) - general - base",
    code: "zh-CN",
    model: "general",
    tier: "base",
  },
  {
    name: "Chinese (Taiwan) - general - base",
    code: "zh-TW",
    model: "general",
    tier: "base",
  },
  {
    name: "Dutsch - general - base",
    code: "nl",
    model: "general",
    tier: "base",
  },
  {
    name: "Dutsch - general - enhanced",
    code: "nl-enhanced",
    model: "general",
    tier: "enhanced",
  },
  {
    name: "English - general - base",
    code: "en",
    model: "general",
    tier: "base",
  },
  {
    name: "English - general - enhanced",
    code: "en-enhanced",
    model: "general",
    tier: "enhanced",
  },
];

export default languages;
