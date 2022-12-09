import type { Vendor } from "src/vendor/types";

/** Simple types */

export type WebhookMethod = "POST" | "GET";

export type CredentialStatus = "ok" | "fail" | "not tested";

export type IpType = "ip" | "fqdn" | "fqdn-top-level" | "invalid";

export type LimitCategories =
  | "api_rate"
  | "voice_call_session"
  | "device"
  | "voice_call_minutes_license"
  | "voice_call_minutes"
  | "voice_call_session_license";

export type LimitUnit = "Sessions" | "Minutes";

export interface LimitUnitOption {
  name: LimitUnit;
  value: Lowercase<LimitUnit>;
}

/** User roles / permissions */
export type UserScopes = "admin" | "service_provider" | "account";

export type UserPermissions =
  | "VIEW_ONLY"
  | "PROVISION_SERVICES"
  | "PROVISION_USERS";

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
  <Type>(apiPath: string): [
    Type | undefined,
    () => void,
    FetchError | undefined
  ];
}

/** API related interfaces */

export interface UseApiDataMap<Type> {
  data?: Type;
  error?: FetchError;
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

export interface LimitField {
  label: string;
  category: LimitCategories;
}

export interface PasswordSettings {
  min_password_length: number;
  require_digit: number;
  require_special_character: number;
}

/** API responses/payloads */

export interface User {
  scope: UserScopes;
  user_sid: string;
  name: string;
  email: string;
  is_active: boolean;
  force_change: boolean;
  account_sid: string | null;
  account_name?: string | null;
  service_provider_sid: string | null;
  service_provider_name?: string | null;
  initial_password?: string;
  permissions?: UserPermissions[];
}

export interface UserLogin {
  token: string;
  force_change: boolean;
  scope: UserScopes;
  user_sid: string;
  permissions: UserPermissions[];
}

export interface UserLoginPayload {
  username: string;
  password: string;
}

export interface UserUpdatePayload {
  old_password?: string;
  new_password?: string;
  initial_password: string | null;
  email: string;
  name: string;
  force_change: boolean;
  is_active: boolean;
  service_provider_sid: string | null;
  account_sid: string | null;
}

export interface UserJWT {
  scope: UserScopes;
  user_sid: string;
  account_sid?: string | null;
  service_provider_sid?: string | null;
  permissions: UserPermissions[];
  name: string;
}

export interface CurrentUserData {
  user: User;
}

export interface ServiceProvider {
  name: string;
  ms_teams_fqdn: null | string;
  service_provider_sid: string;
}

export interface Limit {
  category: LimitCategories;
  /** Empty string signals :DELETE */
  /** @see src/components/forms/local-limits */
  /** @see src/containers/internal/views/accounts/form */
  /** @see src/containers/internal/views/settings/index */
  quantity: number | string;
  account_sid?: string;
  account_limits_sid?: string;
  service_provider_sid?: string;
  service_provider_limits_sid?: string;
}

export interface ApiKey {
  token: string;
  last_used: null | string;
  expires_at: null | string;
  created_at: string;
  api_key_sid: string;
  account_sid: null | string;
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

export interface Smpp {
  ipv4: string;
  port: number | string;
  use_tls: boolean;
  is_primary: boolean;
  smpp_address_sid: string;
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
  ms_teams_tenant_sid: string;
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
  sip_callid: string;
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
  use_custom_tts: number;
  custom_tts_endpoint: null | string;
  use_custom_stt: number;
  custom_stt_endpoint: null | string;
  client_id: null | string;
  secret: null | string;
  tts_api_key: null | string;
  tts_region: null | string;
  stt_api_key: null | string;
  stt_region: null | string;
}

export interface Alert {
  time: number;
  account_sid: string;
  alert_type: string;
  message: string;
  detail: string;
}

export interface Carrier {
  voip_carrier_sid: string;
  name: string;
  description: null | string;
  is_active: boolean;
  service_provider_sid: string;
  account_sid: null | string;
  application_sid: null | string;
  e164_leading_plus: boolean;
  requires_register: boolean;
  register_username: null | string;
  register_password: null | string;
  register_sip_realm: null | string;
  register_from_user: null | string;
  register_from_domain: null | string;
  register_public_ip_in_contact: boolean;
  tech_prefix: null | string;
  diversion: null | string;
  inbound_auth_username: string;
  inbound_auth_password: string;
  smpp_system_id: null | string;
  smpp_password: null | string;
  smpp_inbound_system_id: null | string;
  smpp_inbound_password: null | string;
  smpp_enquire_link_interval: number;
}

export interface PredefinedCarrier extends Carrier {
  requires_static_ip: boolean;
  predefined_carrier_sid: string;
}

export interface Gateway {
  voip_carrier_sid: string;
  ipv4: string;
  port: number;
  netmask: number;
  inbound: number;
  outbound: number;
}

export interface SipGateway extends Gateway {
  sip_gateway_sid?: null | string;
  is_active: boolean;
}

export interface SmppGateway extends Gateway {
  smpp_gateway_sid?: null | string;
  is_primary: boolean;
  use_tls: boolean;
}

export interface PageQuery {
  page: number;
  count: number;
  start?: string;
  days?: number;
}

export interface CallQuery extends PageQuery {
  direction?: string;
  answered?: string;
}

export interface PagedResponse<Type> {
  page_size: number;
  total: number;
  page: number;
  data: Type[];
}

export interface SidResponse {
  sid: string;
}

export interface UserSidResponse {
  user_sid: string;
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

export interface TotalResponse {
  total: number;
}
