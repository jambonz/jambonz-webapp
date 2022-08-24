import type { Vendor } from "src/vendor/types";

/** Simple types */

export type WebhookMethod = "POST" | "GET";

export type CredentialStatus = "ok" | "fail" | "not tested";

/** Status codes */

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
  /** SMPP temporarily unavailable */
  TEMPORARILY_UNAVAILABLE = 480,
}

/** Fetch transport interfaces */

export interface FetchTransport<Type> {
  status: StatusCodes;
  json: Type;
  blob?: Blob;
}

export interface FetchError {
  status: StatusCodes;
  msg: string;
}

export interface UseApiData {
  <Type>(apiPath: string): [null | Type, () => void, null | FetchError];
}

/** API related interfaces */

export interface UseApiDataMap<Type> {
  data: Type | null;
  error: FetchError | null;
  refetch: () => void;
}

export interface WebhookOption {
  name: WebhookMethod;
  value: WebhookMethod;
}

export interface Pcap {
  data_url: string;
  file_name: string;
}

export interface CredentialTest {
  status: CredentialStatus;
  reason: string;
}

export interface CredentialTestResult {
  stt: CredentialTest;
  tts: CredentialTest;
}

/** API responses/payloads */

export interface User {
  user_sid: string;
}

export interface UserLogin {
  token: string;
  user_sid: string;
  force_change: boolean;
}

export interface UserLoginPayload {
  username: string;
  password: string;
}

export interface UserUpdatePayload {
  old_password: string;
  new_password: string;
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
  method: WebhookMethod;
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
}

export interface Application {
  name: string;
  call_hook: null | WebHook;
  account_sid: null | string;
  messaging_hook: null | WebHook;
  application_sid: string;
  call_status_hook: null | WebHook;
  speech_synthesis_voice: null | string;
  speech_synthesis_vendor: null | Lowercase<Vendor>;
  speech_synthesis_language: null | string;
  speech_recognizer_vendor: null | Lowercase<Vendor>;
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

export interface SpeechCredential {
  speech_credential_sid: string;
  service_provider_sid: null | string;
  account_sid: null | string;
  vendor: Lowercase<Vendor>;
  use_for_tts: number;
  use_for_stt: number;
  last_used: null | string;
  region: null | string;
  aws_region: null | string;
  api_key: null | string;
  access_key_id: null | string;
  secret_access_key: null | string;
  service_key: null | string;
}

export interface Alert {
  time: string;
  account_sid: string;
  alert_type: string;
  message: string;
  detail: string;
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

export interface EmptyResponse {
  [key: string]: unknown;
}
