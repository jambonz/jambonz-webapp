import type { SipGateway, SmppGateway, WebHook, WebhookOption } from "./types";

/** This window object is serialized and injected at docker runtime */
/** The API url is constructed with the docker containers `ip:port` */
interface JambonzWindowObject {
  API_BASE_URL: string;
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

/** TCP Max Port */
export const TCP_MAX_PORT = 65535;

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
  is_active: false,
  inbound: true,
  outbound: false,
};

export const DEFAULT_SMPP_GATEWAY: SmppGateway = {
  voip_carrier_sid: "",
  ipv4: "",
  port: 2775,
  is_primary: false,
  use_tls: false,
  netmask: 32,
  inbound: true,
  outbound: true,
};

/** Netmask Bits */
export const NETMASK_BITS = Array(32)
  .fill(0)
  .map((_, index) => index + 1)
  .reverse();

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

/** Speech credential test result status values */
export const CRED_OK = "ok";
export const CRED_FAIL = "fail";
export const CRED_NOT_TESTED = "not tested";

/** API base paths */
export const API_LOGIN = `${API_BASE_URL}/login`;
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
