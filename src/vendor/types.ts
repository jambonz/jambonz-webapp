export type Vendor =
  | "Google"
  | "AWS"
  | "Microsoft"
  | "WellSaid"
  | "Nuance"
  | "Deepgram"
  | "IBM"
  | "Nvidia"
  | "Soniox"
  | "Cobalt"
  | "Custom"
  | "ElevenLabs"
  | "assemblyai"
  | "whisper";

export interface VendorOptions {
  name: Vendor;
  value: Lowercase<Vendor>;
}

export interface LabelOptions {
  name: string;
  value: string;
}

export interface Region {
  name: string;
  value: string;
}

export interface Model {
  name: string;
  value: string;
}

export interface Voice {
  name: string;
  value: string;
  model?: "standard" | "enhanced";
}

export interface Language {
  name: string;
  code: string;
  codeMix?: string;
}

export interface VoiceLanguage extends Language {
  voices: Voice[];
}

/** https://cloud.google.com/iam/docs/creating-managing-service-account-keys */
export interface GoogleServiceKey {
  type: string;
  auth_uri: string;
  token_uri: string;
  client_id: string;
  project_id: string;
  private_key: string;
  client_email: string;
  private_key_id: string;
  client_x509_cert_url: string;
  auth_provider_x509_cert_url: string;
}

export interface RegionVendors {
  aws: Region[];
  microsoft: Region[];
  ibm: Region[];
}

export interface TtsModels {
  elevenlabs: Model[];
  whisper: Model[];
  deepgram: Model[];
}

export interface RecognizerVendors {
  aws: Language[];
  google: Language[];
  microsoft: Language[];
  nuance: Language[];
  deepgram: Language[];
  ibm: Language[];
  nvidia: Language[];
  soniox: Language[];
  cobalt: Language[];
  assemblyai: Language[];
}

export interface SynthesisVendors {
  aws: VoiceLanguage[];
  google: VoiceLanguage[];
  microsoft: VoiceLanguage[];
  wellsaid: VoiceLanguage[];
  nuance: VoiceLanguage[];
  ibm: VoiceLanguage[];
  nvidia: VoiceLanguage[];
  elevenlabs: VoiceLanguage[];
  whisper: VoiceLanguage[];
  deepgram: VoiceLanguage[];
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
  WordsPerMinute?: string;
  SecondaryLocaleList?: string[];
}
