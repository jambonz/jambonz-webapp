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
export const VENDOR_SPEECHMATICS = "speechmatics";
export const VENDOR_CUSTOM = "custom";
export const VENDOR_COBALT = "cobalt";
export const VENDOR_ELEVENLABS = "elevenlabs";
export const VENDOR_ASSEMBLYAI = "assemblyai";
export const VENDOR_VOXIST = "voxist";
export const VENDOR_WHISPER = "whisper";
export const VENDOR_PLAYHT = "playht";
export const VENDOR_RIMELABS = "rimelabs";
export const VENDOR_INWORLD = "inworld";
export const VENDOR_VERBIO = "verbio";
export const VENDOR_CARTESIA = "cartesia";
export const VENDOR_OPENAI = "openai";

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
    name: "Speechmatics",
    value: VENDOR_SPEECHMATICS,
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
    name: "Voxist",
    value: VENDOR_VOXIST,
  },
  {
    name: "Whisper",
    value: VENDOR_WHISPER,
  },
  {
    name: "PlayHT",
    value: VENDOR_PLAYHT,
  },
  {
    name: "RimeLabs",
    value: VENDOR_RIMELABS,
  },
  {
    name: "Inworld",
    value: VENDOR_INWORLD,
  },
  {
    name: "Verbio",
    value: VENDOR_VERBIO,
  },
  {
    name: "Cartesia",
    value: VENDOR_CARTESIA,
  },
  {
    name: "OpenAI",
    value: VENDOR_OPENAI,
  },
].sort((a, b) => a.name.localeCompare(b.name)) as VendorOptions[];

export const AWS_CREDENTIAL_ACCESS_KEY = "access_key";
export const AWS_CREDENTIAL_IAM_ASSUME_ROLE = "assume_role";
export const AWS_INSTANCE_PROFILE = "instance_profile";

export const AWS_CREDENTIAL_TYPES = [
  {
    name: "AWS access key",
    value: AWS_CREDENTIAL_ACCESS_KEY,
  },
  {
    name: "AWS assume role",
    value: AWS_CREDENTIAL_IAM_ASSUME_ROLE,
  },
  {
    name: "AWS instance profile",
    value: AWS_INSTANCE_PROFILE,
  },
];

export const useRegionVendors = () => {
  const [regions, setRegions] = useState<RegionVendors>();

  useEffect(() => {
    let ignore = false;

    Promise.all([
      import("./regions/aws-regions"),
      import("./regions/ms-azure-regions"),
      import("./regions/ibm-regions"),
      import("./regions/speechmatics-regions"),
    ]).then(
      ([
        { default: awsRegions },
        { default: msRegions },
        { default: ibmRegions },
        { default: speechmaticsRegions },
      ]) => {
        if (!ignore) {
          setRegions({
            aws: awsRegions,
            microsoft: msRegions,
            ibm: ibmRegions,
            speechmatics: speechmaticsRegions,
          });
        }
      },
    );

    return function cleanup() {
      ignore = true;
    };
  }, []);

  return regions;
};
