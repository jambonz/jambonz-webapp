import { useEffect, useState } from "react";

import type {
  VendorOptions,
  SynthesisVendors,
  RecognizerVendors,
  RegionVendors,
} from "./types";

export const LANG_EN_US = "en-US";
export const LANG_EN_US_STANDARD_C = "en-US-Standard-C";
export const VENDOR_GOOGLE = "google";
export const VENDOR_AWS = "aws";
export const VENDOR_MICROSOFT = "microsoft";
export const VENDOR_WELLSAID = "wellsaid";
export const VENDOR_NUANCE = "nuance";
export const VENDOR_DEEPGRAM = "deepgram";

export const vendors: VendorOptions[] = [
  {
    name: "Google",
    value: VENDOR_GOOGLE,
  },
  {
    name: "AWS",
    value: VENDOR_AWS,
  },
  {
    name: "Microsoft",
    value: VENDOR_MICROSOFT,
  },
  {
    name: "WellSaid",
    value: VENDOR_WELLSAID,
  },
  {
    name: "Nuance",
    value: VENDOR_NUANCE,
  },
  {
    name: "deepgram",
    value: VENDOR_DEEPGRAM,
  },
];

export const useRegionVendors = () => {
  const [regions, setRegions] = useState<RegionVendors>();

  useEffect(() => {
    let ignore = false;

    Promise.all([
      import("./regions/aws-regions"),
      import("./regions/ms-azure-regions"),
    ]).then(([{ default: awsRegions }, { default: msRegions }]) => {
      if (!ignore) {
        setRegions({
          aws: awsRegions,
          microsoft: msRegions,
        });
      }
    });

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
      import("./speech-synthesis/aws-speech-synthesis-lang"),
      import("./speech-synthesis/google-speech-synthesis-lang"),
      import("./speech-synthesis/ms-speech-synthesis-lang"),
      import("./speech-synthesis/wellsaid-speech-synthesis-lang"),
      import("./speech-synthesis/nuance-speech-synthesis-lang"),
    ]).then(
      ([
        { default: awsRecognizer },
        { default: googleRecognizer },
        { default: msRecognizer },
        { default: nuanceRecognizer },
        { default: deepgramRecognizer },
        { default: awsSynthesis },
        { default: googleSynthesis },
        { default: msSynthesis },
        { default: wellsaidSynthesis },
        { default: nuanceSynthesis },
      ]) => {
        if (!ignore) {
          setSpeech({
            synthesis: {
              aws: awsSynthesis,
              google: googleSynthesis,
              microsoft: msSynthesis,
              wellsaid: wellsaidSynthesis,
              nuance: nuanceSynthesis,
            },
            recognizers: {
              aws: awsRecognizer,
              google: googleRecognizer,
              microsoft: msRecognizer,
              nuance: nuanceRecognizer,
              deepgram: deepgramRecognizer,
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
