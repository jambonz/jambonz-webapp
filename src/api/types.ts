import type { Language, Model, Vendor, VoiceLanguage } from "src/vendor/types";

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

export type LimitUnit = "Session" | "Minute";

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
  headers: Headers;
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

export interface SelectorOptions {
  name: string;
  value: string;
}

export interface DownloadedBlob {
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

export interface BucketCredentialTestResult {
  status: CredentialStatus;
  reason: string;
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

export interface ForgotPassword {
  email: string;
}

export interface SystemInformation {
  domain_name: string;
  sip_domain_name: string;
  monitoring_domain_name: string;
}

export interface TtsCache {
  size: number;
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
  provider?: null | string;
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
  account?: Account;
  subscription?: null | Subscription;
}

export interface ServiceProvider {
  name: string;
  ms_teams_fqdn: null | string;
  service_provider_sid: string;
  lcr_sid: null | string;
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
  root_domain?: null | string;
  account_sid: string;
  webhook_secret: string;
  siprec_hook_sid: null | string;
  queue_event_hook: null | WebHook;
  registration_hook: null | WebHook;
  service_provider_sid: string;
  device_calling_application_sid: null | string;
  record_all_calls: number;
  record_format?: null | string;
  bucket_credential: null | BucketCredential;
  plan_type?: string;
  device_to_call_ratio?: number;
  trial_end_date?: null | string;
  is_active: boolean;
}

export interface Product {
  price_id?: null | string;
  product_sid?: null | string;
  name?: string;
  quantity?: number;
}

export interface Subscription {
  action?: null | string;
  payment_method_id?: null | string;
  account_subscription_sid?: null | string;
  stripe_customer_id?: null | string;
  products?: null | Product[];
  start_date?: string;
  status?: string;
  client_secret?: null | string;
  last4?: null | string;
  exp_month?: null | string;
  exp_year?: null | string;
  card_type?: null | string;
  reason?: null | string;
  dry_run?: boolean;
  currency?: null | string;
  prorated_cost?: number;
  monthly_cost?: number;
  next_invoice_date?: null | string;
}

export interface AwsTag {
  Key: string;
  Value: string;
}

export interface BucketCredential {
  vendor: null | string;
  region?: null | string;
  name?: null | string;
  access_key_id?: null | string;
  secret_access_key?: null | string;
  tags?: null | AwsTag[];
  service_key?: null | string;
  connection_string?: null | string;
  endpoint?: null | string;
}

export interface Application {
  name: string;
  app_json: null | string;
  call_hook: null | WebHook;
  account_sid: null | string;
  messaging_hook: null | WebHook;
  application_sid: string;
  call_status_hook: null | WebHook;
  speech_synthesis_voice: null | string;
  speech_synthesis_vendor: null | Lowercase<Vendor>;
  speech_synthesis_language: null | string;
  speech_synthesis_label: null | string;
  speech_recognizer_vendor: null | Lowercase<Vendor>;
  speech_recognizer_language: null | string;
  speech_recognizer_label: null | string;
  record_all_calls: number;
  use_for_fallback_speech: number;
  fallback_speech_synthesis_vendor: null | string;
  fallback_speech_synthesis_language: null | string;
  fallback_speech_synthesis_voice: null | string;
  fallback_speech_synthesis_label: null | string;
  fallback_speech_recognizer_vendor: null | string;
  fallback_speech_recognizer_language: null | string;
  fallback_speech_recognizer_label: null | string;
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
  trace_id: string;
  recording_url?: string;
}

export interface GoogleCustomVoice {
  google_custom_voice_sid?: string;
  speech_credential_sid?: string;
  name: string;
  reported_usage: string;
  model: string;
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
  custom_tts_endpoint_url: null | string;
  custom_tts_endpoint: null | string;
  use_custom_stt: number;
  custom_stt_endpoint_url: null | string;
  custom_stt_endpoint: null | string;
  client_id: null | string;
  secret: null | string;
  nuance_tts_uri: null | string;
  nuance_stt_uri: null | string;
  tts_api_key: null | string;
  tts_region: null | string;
  stt_api_key: null | string;
  stt_region: null | string;
  instance_id: null | string;
  riva_server_uri: null | string;
  auth_token: null | string;
  custom_stt_url: null | string;
  custom_tts_url: null | string;
  label: null | string;
  cobalt_server_uri: null | string;
  model_id: null | string;
  model: null | string;
  options: null | string;
}

export interface Alert {
  time: number;
  account_sid: string;
  alert_type: string;
  message: string;
  detail: string;
}

export interface CarrierRegisterStatus {
  status: null | string;
  reason: null | string;
  cseq: null | string;
  callId: null | string;
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
  register_status: CarrierRegisterStatus;
}

export interface PredefinedCarrier extends Carrier {
  requires_static_ip: boolean;
  predefined_carrier_sid: string;
}

export interface Gateway {
  voip_carrier_sid: string;
  ipv4: string;
  netmask: number;
  inbound: number;
  outbound: number;
}

export interface SipGateway extends Gateway {
  sip_gateway_sid?: null | string;
  is_active: boolean;
  protocol?: string;
  port: number | null;
  pad_crypto?: boolean;
}

export interface SmppGateway extends Gateway {
  smpp_gateway_sid?: null | string;
  is_primary: boolean;
  use_tls: boolean;
  port: number;
}

export interface Lcr {
  lcr_sid?: null | string;
  is_active: boolean;
  name: null | string;
  default_carrier_set_entry_sid?: null | string;
  account_sid: null | string;
  service_provider_sid: null | string;
  number_routes?: number;
}

export interface LcrRoute {
  lcr_route_sid?: null | string;
  lcr_sid: null | string;
  regex: null | string;
  description?: null | string;
  priority: number;
  lcr_carrier_set_entries?: LcrCarrierSetEntry[];
}

export interface LcrCarrierSetEntry {
  lcr_carrier_set_entry_sid?: null | string;
  workload?: number;
  lcr_route_sid: null | string;
  voip_carrier_sid: null | string;
  priority: number;
}

export interface Client {
  client_sid?: null | string;
  account_sid: null | string;
  username: null | string;
  password?: null | string;
  is_active: boolean;
  allow_direct_app_calling: boolean;
  allow_direct_queue_calling: boolean;
  allow_direct_user_calling: boolean;
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

export interface GoogleCustomVoicesQuery {
  speech_credential_sid?: string;
  label?: string;
  account_sid?: string;
  service_provider_sid: string;
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

export interface RegisterRequest {
  service_provider_sid: string;
  provider: string;
  oauth2_code?: string;
  oauth2_state?: string;
  oauth2_client_id?: string;
  oauth2_redirect_uri?: string;
  locationBeforeAuth?: string;
  name?: string;
  email?: string;
  password?: string;
  email_activation_code?: string;
  inviteCode?: string;
}

export interface RegisterResponse {
  jwt: string;
  user_sid: string;
  account_sid: string;
  root_domain: string;
}

export interface ActivationCode {
  user_sid: string;
  type: string;
}

export interface Availability {
  available: boolean;
}

export interface Invoice {
  total: number;
  currency: null | string;
  next_payment_attempt: null | string;
}

export type Currency = {
  [key: string]: null | string;
};

export interface Recurring {
  aggregate_usage: null | string;
  interval: null | string;
  interval_count: number;
  trial_period_days: null | string;
  usage_type: string;
}

export interface Price {
  billing_scheme: string;
  currency: string;
  recurring: Recurring;
  stripe_price_id: null | string;
  tiers_mode: null | string;
  type: null | string;
  unit_amount: number;
  unit_amount_decimal: null | string;
}

export interface PriceInfo {
  category: null | string;
  description: null | string;
  name: null | string;
  prices: Price[];
  product_sid: null | string;
  stripe_product_id: null | string;
  unit_label: null | string;
}

export interface StripeCustomerId {
  stripe_customer_id: null | string;
}

export interface Tier {
  up_to: number;
  flat_amount: number;
  unit_amount: number;
}

export interface ServiceData {
  category: null | string;
  name: null | string;
  service: null | string;
  fees: number;
  feesLabel: null | string;
  cost: number;
  capacity: number;
  invalid: boolean;
  currency: null | string;
  min: number;
  max: number;
  dirty: boolean;
  visible: boolean;
  required: boolean;
  billing_scheme?: null | string;
  stripe_price_id?: null | string;
  unit_label?: null | string;
  product_sid?: null | string;
  stripe_product_id?: null | string;
  tiers?: Tier[];
}

export interface DeleteAccount {
  password: string;
}

export interface ChangePassword {
  old_password: null | string;
  new_password: null | string;
}

export interface SignIn {
  link?: null | string;
  jwt?: null | string;
  account_sid?: null | string;
}

export interface GetLanguagesAndVoices {
  vendor: string;
  label: string;
}

export interface SpeechSupportedLanguagesAndVoices {
  tts: VoiceLanguage[];
  stt: Language[];
  models: Model[];
}

export interface ElevenLabsOptions {
  optimize_streaming_latency: number;
  voice_settings: Partial<{
    similarity_boost: number;
    stability: number;
    style: number;
    use_speaker_boost: boolean;
  }>;
}
