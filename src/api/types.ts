export type Payload = Record<string, unknown>;

export type EmptyResponse = Payload;

/** Status codes with JSON responses */
/** Code 400,403 can be an empty response sometimes... */
/** FYI: Code 480 is SMPP temporarily unavailable */
// export type StatusJSON = 200 | 201 | 400 | 403 | 422 | 480 | 500;

/** Status codes with empty responses */
/** Code 403 can have a JSON response sometimes... */
// export type StatusEmpty = 202 | 204 | 400 | 403 | 404;

export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,

  /** Code 480 is SMPP temporarily unavailable */
  TEMPORARILY_UNAVAILABLE = 480,
}

export interface FetchTransport<Type> {
  status: StatusCodes;
  json: Type;
}

export interface FetchError {
  status: StatusCodes;
  msg: string;
}

export interface UseApiData {
  <Type>(apiPath: string): [null | Type, () => void, null | FetchError];
}

export interface User {
  user_sid: string;
}

export interface UserLogin {
  token: string;
  user_sid: string;
  force_change: boolean;
}

export interface ServiceProvider {
  name: string;
  ms_teams_fqdn: null | string;
  service_provider_sid: string;
}

export interface ApiKey {
  token: string;
  last_used: null | string;
  expires_at: null | string;
  created_at: string;
  api_key_sid: string;
  service_provider_sid: null | string;
}

export interface WebHook {
  url: string;
  method: string;
  username: null | string;
  password: null | string;
  webhook_sid?: null | string;
}

export interface Sbc {
  ipv4: string;
  port: number | string;
  sbc_address_sid: string;
  service_provider_sid: null | string;
}

/** Subspace is behind an ENV flag `VITE_FEATURE_SUBSPACE` */
export interface SubspaceTeleport {
  destination: string;
}

export interface SubspaceEntryPoint {
  address: string;
  transport_type: string;
}

export interface Account {
  name: string;
  sip_realm: null | string;
  account_sid: string;
  webhook_secret: string;
  siprec_hook_sid: null | string;
  queue_event_hook: null | WebHook;
  registration_hook: null | WebHook;
  service_provider_sid: string;
  device_calling_application_sid: null | string;

  /** Subspace is behind an ENV flag `VITE_FEATURE_SUBSPACE` */
  subspace_client_id: null | string;
  subspace_client_secret: null | string;
  subspace_sip_teleport_id: null | string;
  /** Serialized JSON parsed as an array of SubspaceEntryPoint types */
  subspace_sip_teleport_destinations: null | string;
}

export interface Application {
  name: string;
  call_hook: null | WebHook;
  account_sid: null | string;
  messaging_hook: null | WebHook;
  application_sid: string;
  call_status_hook: null | WebHook;
  speech_synthesis_voice: null | string;
  speech_synthesis_vendor: null | string;
  speech_synthesis_language: null | string;
  speech_recognizer_vendor: null | string;
  speech_recognizer_language: null | string;
}

export interface PhoneNumber {
  number: string;
  account_sid: null | string;
  application_sid: null | string;
  phone_number_sid: string;
  voip_carrier_sid: null | string;
}

export interface MSTeamsTenant {
  tenant_fqdn: string;
  account_sid: null | string;
  application_sid: null | string;
  service_provider_sid: string;
}

export interface RecentCall {
  account_sid: string;
  call_sid: string;
  from: string;
  to: string;
  answered: boolean;
  sip_call_id: string;
  sip_status: number;
  duration: number;
  attempted_at: number;
  answered_at: number;
  terminated_at: number;
  termination_reason: string;
  host: string;
  remote_host: string;
  direction: string;
  trunk: string;
}

export interface PagedResponse<Type> {
  total: number;
  batch: number;
  page: number;
  data: Type[];
}

export interface SidResponse {
  sid: string;
}

export interface TokenResponse extends SidResponse {
  token: string;
}

export interface SecretResponse {
  webhook_secret: string;
}
