import type {
  Currency,
  LimitField,
  LimitUnitOption,
  PasswordSettings,
  SelectorOptions,
  SipGateway,
  SmppGateway,
  WebHook,
  WebhookOption,
} from "./types";

/** This window object is serialized and injected at docker runtime */
/** The API url is constructed with the docker containers `ip:port` */
interface JambonzWindowObject {
  API_BASE_URL: string;
  DISABLE_LCR: string;
  DISABLE_JAEGER_TRACING: string;
  DISABLE_CUSTOM_SPEECH: string;
  ENABLE_FORGOT_PASSWORD: string;
  ENABLE_HOSTED_SYSTEM: string;
  DISABLE_CALL_RECORDING: string;
  GITHUB_CLIENT_ID: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_REDIRECT_URI: string;
  DEFAULT_SERVICE_PROVIDER_SID: string;
  STRIPE_PUBLISHABLE_KEY: string;
}

declare global {
  interface Window {
    JAMBONZ: JambonzWindowObject;
  }
}

/** https://vitejs.dev/guide/env-and-mode.html#env-files */
export const API_BASE_URL =
  window.JAMBONZ?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL;

/** Serves mock API responses from a local dev API server */
export const DEV_BASE_URL = import.meta.env.VITE_DEV_BASE_URL;

/** Disable custom speech vendor*/
export const DISABLE_CUSTOM_SPEECH: boolean =
  window.JAMBONZ?.DISABLE_CUSTOM_SPEECH === "true" ||
  JSON.parse(import.meta.env.VITE_DISABLE_CUSTOM_SPEECH || "false");

/** Enable Forgot Password */
export const ENABLE_FORGOT_PASSWORD: boolean =
  window.JAMBONZ?.ENABLE_FORGOT_PASSWORD === "true" ||
  JSON.parse(import.meta.env.VITE_APP_ENABLE_FORGOT_PASSWORD || "false");

/** Enable Cloud version */
export const ENABLE_HOSTED_SYSTEM: boolean =
  window.JAMBONZ?.ENABLE_HOSTED_SYSTEM === "true" ||
  JSON.parse(import.meta.env.VITE_APP_ENABLE_HOSTED_SYSTEM || "false");
/** Disable Lcr */
export const DISABLE_LCR: boolean =
  window.JAMBONZ?.DISABLE_LCR === "true" ||
  JSON.parse(import.meta.env.VITE_APP_LCR_DISABLED || "false");

/** Disable jaeger tracing */
export const DISABLE_JAEGER_TRACING: boolean =
  window.JAMBONZ?.DISABLE_JAEGER_TRACING === "true" ||
  JSON.parse(import.meta.env.VITE_APP_JAEGER_TRACING_DISABLED || "false");

/** Enable Record All Call Feature */
export const DISABLE_CALL_RECORDING: boolean =
  window.JAMBONZ?.DISABLE_CALL_RECORDING === "true" ||
  JSON.parse(import.meta.env.VITE_APP_DISABLE_CALL_RECORDING || "false");

export const DEFAULT_SERVICE_PROVIDER_SID: string =
  window.JAMBONZ?.DEFAULT_SERVICE_PROVIDER_SID ||
  import.meta.env.VITE_APP_DEFAULT_SERVICE_PROVIDER_SID;

export const GITHUB_CLIENT_ID: string =
  window.JAMBONZ?.GITHUB_CLIENT_ID || import.meta.env.VITE_APP_GITHUB_CLIENT_ID;

export const GOOGLE_REDIRECT_URI: string =
  window.JAMBONZ?.GOOGLE_REDIRECT_URI ||
  import.meta.env.VITE_APP_GOOGLE_REDIRECT_URI;

export const GOOGLE_CLIENT_ID: string =
  window.JAMBONZ?.GOOGLE_CLIENT_ID || import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;

export const STRIPE_PUBLISHABLE_KEY: string =
  window.JAMBONZ?.STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY;

/** TCP Max Port */
export const TCP_MAX_PORT = 65535;

/** Tech Prefix minlength */
export const TECH_PREFIX_MINLENGTH = 3;

/** IP Types for validations */
export const IP = "ip";
export const FQDN = "fqdn";
export const FQDN_TOP_LEVEL = "fqdn-top-level";
export const INVALID = "invalid";

/** Default API object models */
export const DEFAULT_WEBHOOK: WebHook = {
  url: "",
  method: "POST",
  username: "",
  password: "",
};

/** Default SIP/SMPP Gateways  */
export const DEFAULT_SIP_GATEWAY: SipGateway = {
  voip_carrier_sid: "",
  ipv4: "",
  port: 5060,
  netmask: 32,
  is_active: true,
  inbound: 1,
  outbound: 0,
};

export const DEFAULT_SMPP_GATEWAY: SmppGateway = {
  voip_carrier_sid: "",
  ipv4: "",
  port: 2775,
  is_primary: false,
  use_tls: false,
  netmask: 32,
  inbound: 1,
  outbound: 1,
};
/** Netmask Bits */
export const NETMASK_BITS = Array(32)
  .fill(0)
  .map((_, index) => index + 1)
  .reverse();

export const NETMASK_OPTIONS = NETMASK_BITS.map((bit) => ({
  name: bit.toString(),
  value: bit.toString(),
}));

/** SIP Gateway Protocol */
export const SIP_GATEWAY_PROTOCOL_OPTIONS = [
  {
    name: "UDP",
    value: "udp",
  },
  {
    name: "TCP",
    value: "tcp",
  },
  {
    name: "TLS",
    value: "tls",
  },
  {
    name: "TLS/SRTP",
    value: "tls/srtp",
  },
];
/**
 * Record bucket type
 */
export const BUCKET_VENDOR_OPTIONS = [
  {
    name: "NONE",
    value: "",
  },
  {
    name: "AWS S3",
    value: "aws_s3",
  },
];

export const AUDIO_FORMAT_OPTIONS = [
  {
    name: "mp3",
    value: "mp3",
  },
  {
    name: "wav",
    value: "wav",
  },
];
/** Password Length options */

export const PASSWORD_MIN = 8;
export const PASSWORD_LENGTHS_OPTIONS = Array(13)
  .fill(PASSWORD_MIN)
  .map((i, j) => ({
    name: (i + j).toString(),
    value: (i + j).toString(),
  }));

/** List view filters */
export const DATE_SELECTION = [
  { name: "today", value: "today" },
  { name: "last 7d", value: "7" },
  { name: "last 14d", value: "14" },
  { name: "last 30d", value: "30" },
];

export const PER_PAGE_SELECTION = [
  { name: "25 / page", value: "25" },
  { name: "50 / page", value: "50" },
  { name: "100 / page", value: "100" },
];

export const USER_SCOPE_SELECTION: SelectorOptions[] = [
  { name: "All scopes", value: "all" },
  { name: "Admin", value: "admin" },
  { name: "Service provider", value: "service_provider" },
  { name: "Account", value: "account" },
];

/** Available webhook methods */
export const WEBHOOK_METHODS: WebhookOption[] = [
  {
    name: "POST",
    value: "POST",
  },
  {
    name: "GET",
    value: "GET",
  },
];

/** Various system limits */
export const LIMITS: LimitField[] = [
  {
    label: "Max calls",
    category: "voice_call_session",
  },
  // {
  //   label: "Max registered devices (0=unlimited)",
  //   category: "device",
  // },
  // {
  //   label: "Max api calls per minute (0=unlimited)",
  //   category: "api_rate",
  // },
  {
    label: "Licensed calls",
    category: "voice_call_session_license",
  },
  {
    label: "Max minutes",
    category: "voice_call_minutes",
  },
  {
    label: "Licensed minutes",
    category: "voice_call_minutes_license",
  },
];

export const LIMIT_MIN = "minute";
export const LIMIT_SESS = "session";

export const LIMIT_UNITS: LimitUnitOption[] = [
  {
    name: "Session",
    value: LIMIT_SESS,
  },
  {
    name: "Minute",
    value: LIMIT_MIN,
  },
];

export const DEFAULT_PSWD_SETTINGS: PasswordSettings = {
  min_password_length: 6,
  require_digit: 0,
  require_special_character: 0,
};

export const PlanType = {
  PAID: "paid",
  TRIAL: "trial",
  FREE: "free",
};

export const CurrencySymbol: Currency = {
  usd: "$",
};

/** User scope values values */
export const USER_ADMIN = "admin";
export const USER_SP = "service_provider";
export const USER_ACCOUNT = "account";

/** Speech credential test result status values */
export const CRED_OK = "ok";
export const CRED_FAIL = "fail";
export const CRED_NOT_TESTED = "not tested";

/** Voip Carrier Register result status values */
export const CARRIER_REG_OK = "ok";
export const CARRIER_REG_FAIL = "fail";

export const PRIVACY_POLICY = "https://jambonz.org/privacy";
export const TERMS_OF_SERVICE = "https://jambonz.org/terms";

/** API base paths */
export const API_LOGIN = `${API_BASE_URL}/login`;
export const API_LOGOUT = `${API_BASE_URL}/logout`;
export const API_SBCS = `${API_BASE_URL}/Sbcs`;
export const API_USERS = `${API_BASE_URL}/Users`;
export const API_API_KEYS = `${API_BASE_URL}/ApiKeys`;
export const API_ACCOUNTS = `${API_BASE_URL}/Accounts`;
export const API_APPLICATIONS = `${API_BASE_URL}/Applications`;
export const API_PHONE_NUMBERS = `${API_BASE_URL}/PhoneNumbers`;
export const API_MS_TEAMS_TENANTS = `${API_BASE_URL}/MicrosoftTeamsTenants`;
export const API_SERVICE_PROVIDERS = `${API_BASE_URL}/ServiceProviders`;
export const API_CARRIERS = `${API_BASE_URL}/VoipCarriers`;
export const API_SMPP_GATEWAY = `${API_BASE_URL}/SmppGateways`;
export const API_SIP_GATEWAY = `${API_BASE_URL}/SipGateways`;
export const API_PASSWORD_SETTINGS = `${API_BASE_URL}/PasswordSettings`;
export const API_FORGOT_PASSWORD = `${API_BASE_URL}/forgot-password`;
export const API_SYSTEM_INFORMATION = `${API_BASE_URL}/SystemInformation`;
export const API_LCRS = `${API_BASE_URL}/Lcrs`;
export const API_LCR_ROUTES = `${API_BASE_URL}/LcrRoutes`;
export const API_LCR_CARRIER_SET_ENTRIES = `${API_BASE_URL}/LcrCarrierSetEntries`;
export const API_TTS_CACHE = `${API_BASE_URL}/TtsCache`;
export const API_CLIENTS = `${API_BASE_URL}/Clients`;
export const API_REGISTER = `${API_BASE_URL}/register`;
export const API_ACTIVATION_CODE = `${API_BASE_URL}/ActivationCode`;
export const API_AVAILABILITY = `${API_BASE_URL}/Availability`;
export const API_PRICE = `${API_BASE_URL}/Prices`;
export const API_SUBSCRIPTIONS = `${API_BASE_URL}/Subscriptions`;
