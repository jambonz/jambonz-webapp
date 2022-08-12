export interface Region {
  name: string;
  value: string;
}

export interface Voice {
  name: string;
  value: string;
}

export interface Language {
  name: string;
  code: string;
}

export interface VoiceLanguage extends Language {
  voices: Voice[];
}

export interface GoogleServiceKey {
  private_key: string;
  client_email: string;
}

export interface Vendor {
  name: "Google" | "AWS" | "Microsoft" | "WellSaid";
  value: "google" | "aws" | "microsoft" | "wellsaid";
}

export interface RegionVendors {
  aws: Region[];
  microsoft: Region[];
}

export interface RecognizerVendors {
  aws: Language[];
  google: Language[];
  microsoft: Language[];
}

export interface SynthesisVendors {
  aws: VoiceLanguage[];
  google: VoiceLanguage[];
  microsoft: VoiceLanguage[];
  wellsaid: VoiceLanguage[];
}

export interface MSRawSpeech {
  Name: string;
  DisplayName: string;
  LocalName: string;
  ShortName: string;
  Gender: string;
  Locale: string;
  LocaleName: string;
  SampleRateHertz: string;
  VoiceType: string;
  Status: string;
  StyleList?: string[];
  RolePlayList?: string[];
  WordPerMinute?: Record<string, unknown>;
  SecondaryLocaleList?: string[];
}
