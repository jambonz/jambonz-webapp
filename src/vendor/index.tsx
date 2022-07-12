import type { Vendor } from "./types";

export const LANG_EN_US = "en-US";
export const LANG_EN_US_STANDARD_C = "en-US-Standard-C";
export const VENDOR_GOOGLE = "google";
export const VENDOR_AWS = "aws";
export const VENDOR_MICROSOFT = "microsoft";
export const VENDOR_WELLSAID = "wellsaid";

export const vendors: Vendor[] = [
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
];
