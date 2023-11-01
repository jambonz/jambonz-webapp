import { useEffect, useState } from "react";

import type {
  VendorOptions,
  SynthesisVendors,
  RecognizerVendors,
  RegionVendors,
} from "./types";

export const LANG_EN_US = "en-US";
export const ELEVENLABS_LANG_EN = "en";
export const LANG_COBALT_EN_US = "en_US-8khz";
export const LANG_EN_US_STANDARD_C = "en-US-Standard-C";
export const VENDOR_GOOGLE = "google";
export const VENDOR_AWS = "aws";
export const VENDOR_MICROSOFT = "microsoft";
export const VENDOR_WELLSAID = "wellsaid";
export const VENDOR_NUANCE = "nuance";
export const VENDOR_DEEPGRAM = "deepgram";
export const VENDOR_IBM = "ibm";
export const VENDOR_NVIDIA = "nvidia";
export const VENDOR_SONIOX = "soniox";
export const VENDOR_CUSTOM = "custom";
export const VENDOR_COBALT = "cobalt";
export const VENDOR_ELEVENLABS = "elevenlabs";
export const VENDOR_ASSEMBLYAI = "assemblyai";

export const vendors: VendorOptions[] = [
  {
    name: "AWS",
    value: VENDOR_AWS,
  },
  {
    name: "Google",
    value: VENDOR_GOOGLE,
  },
  {
    name: "Deepgram",
    value: VENDOR_DEEPGRAM,
  },
  {
    name: "IBM",
    value: VENDOR_IBM,
  },
  {
    name: "Microsoft",
    value: VENDOR_MICROSOFT,
  },
  {
    name: "Nuance",
    value: VENDOR_NUANCE,
  },
  {
    name: "Nvidia",
    value: VENDOR_NVIDIA,
  },
  {
    name: "WellSaid",
    value: VENDOR_WELLSAID,
  },
  {
    name: "Soniox",
    value: VENDOR_SONIOX,
  },
  {
    name: "Custom",
    value: VENDOR_CUSTOM,
  },
  {
    name: "Cobalt",
    value: VENDOR_COBALT,
  },
  {
    name: "ElevenLabs",
    value: VENDOR_ELEVENLABS,
  },
  {
    name: "AssemblyAI",
    value: VENDOR_ASSEMBLYAI,
  },
].sort((a, b) => a.name.localeCompare(b.name)) as VendorOptions[];

export const useRegionVendors = () => {
  const [regions, setRegions] = useState<RegionVendors>();

  useEffect(() => {
    let ignore = false;

    Promise.all([
      import("./regions/aws-regions"),
      import("./regions/ms-azure-regions"),
      import("./regions/ibm-regions"),
    ]).then(
      ([
        { default: awsRegions },
        { default: msRegions },
        { default: ibmRegions },
      ]) => {
        if (!ignore) {
          setRegions({
            aws: awsRegions,
            microsoft: msRegions,
            ibm: ibmRegions,
          });
        }
      }
    );

    return function cleanup() {
      ignore = true;
    };
  }, []);

  return regions;
};

export const useSpeechVendors = () => {
  const [speech, setSpeech] = useState<{
    synthesis?: SynthesisVendors;
    recognizers?: RecognizerVendors;
  }>({});

  useEffect(() => {
    let ignore = false;

    Promise.all([
      import("./speech-recognizer/aws-speech-recognizer-lang"),
      import("./speech-recognizer/google-speech-recognizer-lang"),
      import("./speech-recognizer/ms-speech-recognizer-lang"),
      import("./speech-recognizer/nuance-speech-recognizer-lang"),
      import("./speech-recognizer/deepgram-speech-recognizer-lang"),
      import("./speech-recognizer/ibm-speech-recognizer-lang"),
      import("./speech-recognizer/nvidia-speech-recognizer-lang"),
      import("./speech-recognizer/soniox-speech-recognizer-lang"),
      import("./speech-recognizer/cobalt-speech-recognizer-lang"),
      import("./speech-recognizer/assemblyai-speech-recognizer-lang"),
      import("./speech-synthesis/aws-speech-synthesis-lang"),
      import("./speech-synthesis/google-speech-synthesis-lang"),
      import("./speech-synthesis/ms-speech-synthesis-lang"),
      import("./speech-synthesis/wellsaid-speech-synthesis-lang"),
      import("./speech-synthesis/nuance-speech-synthesis-lang"),
      import("./speech-synthesis/ibm-speech-synthesis-lang"),
      import("./speech-synthesis/nvidia-speech-synthesis-lang"),
      import("./speech-synthesis/elevellabs-speech-synthesis-lang"),
    ]).then(
      ([
        { default: awsRecognizer },
        { default: googleRecognizer },
        { default: msRecognizer },
        { default: nuanceRecognizer },
        { default: deepgramRecognizer },
        { default: ibmRecognizer },
        { default: nvidiaRecognizer },
        { default: sonioxRecognizer },
        { default: cobaltRecognizer },
        { default: assemblyaiRecognizer },
        { default: awsSynthesis },
        { default: googleSynthesis },
        { default: msSynthesis },
        { default: wellsaidSynthesis },
        { default: nuanceSynthesis },
        { default: ibmSynthesis },
        { default: nvidiaynthesis },
        { default: elevenLabsSynthesis },
      ]) => {
        if (!ignore) {
          setSpeech({
            synthesis: {
              aws: awsSynthesis,
              google: googleSynthesis,
              microsoft: msSynthesis,
              wellsaid: wellsaidSynthesis,
              nuance: nuanceSynthesis,
              ibm: ibmSynthesis,
              nvidia: nvidiaynthesis,
              elevenlabs: elevenLabsSynthesis,
            },
            recognizers: {
              aws: awsRecognizer,
              google: googleRecognizer,
              microsoft: msRecognizer,
              nuance: nuanceRecognizer,
              deepgram: deepgramRecognizer,
              ibm: ibmRecognizer,
              nvidia: nvidiaRecognizer,
              soniox: sonioxRecognizer,
              cobalt: cobaltRecognizer,
              assemblyai: assemblyaiRecognizer,
            },
          });
        }
      }
    );

    return function cleanup() {
      ignore = true;
    };
  }, []);

  return speech;
};
