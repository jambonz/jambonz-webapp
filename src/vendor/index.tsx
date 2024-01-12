import { useEffect, useState } from "react";

import type { VendorOptions, RegionVendors } from "./types";

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
export const VENDOR_WHISPER = "whisper";

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
  {
    name: "Whisper",
    value: VENDOR_WHISPER,
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
