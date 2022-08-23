import type { WebHook, WebhookOption } from "./types";

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

/** Default API object models */
export const DEFAULT_WEBHOOK: WebHook = {
  url: "",
  method: "POST",
  username: "",
  password: "",
};

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

/* Reference: API usage by internal route

/internal/*
  :POST /ServiceProviders

/internal/settings
  :GET /ServiceProviders
  :GET /ServiceProviders/:service_provider_sid/ApiKeys
  :POST /ApiKeys
  :PUT /ServiceProviders/:service_provider_sid
  :DELETE /ServiceProviders/:service_provider_sid

/internal/accounts
  :GET /ServiceProviders
  :GET /ServiceProviders/:service_provider_sid/Accounts

/internal/accounts/add
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Sbcs
  :GET /Accounts/WebhookSecret?regenerate=true
  :POST /Accounts

/internal/accounts/edit
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Applications
  :GET /Sbcs
  :GET /Accounts/:account_sid/ApiKeys
  :GET /Accounts/WebhookSecret?regenerate=true
  :PUT /Accounts/:account_sid


/internal/applications
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Applications

/internal/applications/add
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Applications
  :POST /Applications

/internal/applications/edit
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Applications
  :PUT /Applications/:application_sid

/internal/recent-calls
  :GET /ServiceProviders
  :GET /Accounts
  :GET /RecentCalls?page=1&count=25&start=2022-07-14T07:00:00.000Z

  ???

/internal/alerts
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Alerts?page=1&count=25&start=2022-07-14T07:00:00.000Z

  ???

/internal/carriers
  :GET /ServiceProviders
  :GET /Accounts
  :GET /VoipCarriers
  :GET /SipGateways?voip_carrier_sid=:voip_carrier_sid
  :GET /SmppGateways?voip_carrier_sid=:voip_carrier_sid

/internal/carriers/add
  :GET /ServiceProviders
  :GET /Applications
  :GET /Accounts
  :GET /Smpps
  :GET /Sbcs
  :GET /PredefinedCarriers
  :POST /ServiceProviders/:service_provider_sid/VoipCarriers
  :POST /SipGateways
  :POST /SmppGateways (inbound / outbound)

/internal/carriers/edit
  :GET /ServiceProviders
  :GET /Applications
  :GET /Accounts
  :GET /Smpps
  :GET /Sbcs
  :GET /VoipCarriers/:voip_carrier_sid
  :GET /SipGateways?voip_carrier_sid=:voip_carrier_sid
  :GET /SmppGateways?voip_carrier_sid=:voip_carrier_sid
  :PUT /ServiceProviders/:service_provider_sid/VoipCarriers/:voip_carrier_sid
  :PUT /SipGateways/sip_gateway_sid
  :PUT /SmppGateways/smpp_gateway_sid (inbound / outbound)

/internal/speech-services
  :GET /ServiceProviders
  :GET /Accounts
  :GET /SpeechCredentials

/internal/speech-services/add
  :GET /ServiceProviders
  :GET /Accounts
  :POST /ServiceProviders/:service_provider_sid/SpeechCredentials

/internal/speech-services/edit
  :GET /ServiceProviders
  :GET /Accounts
  :PUT /ServiceProviders/:service_provider_sid/SpeechCredentials/:speech_service_sid

/internal/phone-numbers
  :GET /ServiceProviders
  :GET /Accounts
  :GET /PhoneNumbers
  :GET /Applications
  :GET /VoipCarriers

/internal/phone-numbers/add
  :GET /ServiceProviders
  :GET /Accounts
  :GET /PhoneNumbers
  :GET /Applications
  :GET /VoipCarriers
  :POST /PhoneNumbers

/internal/phone-numbers/edit
  :GET /ServiceProviders
  :GET /Accounts
  :GET /PhoneNumbers
  :GET /Applications
  :GET /VoipCarriers
  :PUT /PhoneNumbers/:phone_number_sid

/internal/ms-teams-tenants
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Applications
  :GET /MicrosoftTeamsTenants

/internal/ms-teams-tenants/add
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Applications
  :GET /MicrosoftTeamsTenants
  :POST /MicrosoftTeamsTenants

/internal/ms-teams-tenants/edit
  :GET /ServiceProviders
  :GET /Accounts
  :GET /Applications
  :GET /MicrosoftTeamsTenants
  :PUT /MicrosoftTeamsTenants/:ms_teams_tenants_sid
*/
