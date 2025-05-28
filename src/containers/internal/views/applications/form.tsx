import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup, MS } from "@jambonz/ui-kit";
import { Link, useNavigate } from "react-router-dom";

import { useSelectState } from "src/store";
import { ClipBoard, Section, Tooltip } from "src/components";
import {
  Selector,
  Checkzone,
  Passwd,
  Message,
  AccountSelect,
  FileUpload,
} from "src/components/forms";
import {
  vendors,
  LANG_EN_US,
  VENDOR_GOOGLE,
  LANG_EN_US_STANDARD_C,
  VENDOR_CUSTOM,
} from "src/vendor";
import {
  postApplication,
  putApplication,
  useServiceProviderData,
  useApiData,
  getAppEnvSchema,
} from "src/api";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_APPLICATIONS,
} from "src/router/routes";
import {
  DEFAULT_WEBHOOK,
  DISABLE_CALL_RECORDING,
  WEBHOOK_METHODS,
} from "src/api/constants";

import type {
  RecognizerVendors,
  SynthesisVendors,
  VendorOptions,
  LabelOptions,
} from "src/vendor/types";

import type {
  Account,
  WebHook,
  Application,
  WebhookMethod,
  UseApiDataMap,
  SpeechCredential,
  AppEnv,
} from "src/api/types";
import { MSG_REQUIRED_FIELDS, MSG_WEBHOOK_FIELDS } from "src/constants";
import { hasLength, isUserAccountScope, useRedirect } from "src/utils";
import { setAccountFilter, setLocation } from "src/store/localStore";
import SpeechProviderSelection from "./speech-selection";
import ObscureInput from "src/components/obscure-input";
import { useToast } from "src/components/toast/toast-provider";

type ApplicationFormProps = {
  application?: UseApiDataMap<Application>;
};

export const ApplicationForm = ({ application }: ApplicationFormProps) => {
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");
  const [applicationName, setApplicationName] = useState("");
  const [applicationJson, setApplicationJson] = useState("");
  const [tmpApplicationJson, setTmpApplicationJson] = useState("");
  const [initialApplicationJson, setInitialApplicationJson] = useState(false);
  const [accountSid, setAccountSid] = useState("");
  const [callWebhook, setCallWebhook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [tmpCallWebhook, setTmpCallWebhook] =
    useState<WebHook>(DEFAULT_WEBHOOK);
  const [initialCallWebhook, setInitialCallWebhook] = useState(false);
  const [statusWebhook, setStatusWebhook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [tmpStatusWebhook, setTmpStatusWebhook] =
    useState<WebHook>(DEFAULT_WEBHOOK);
  const [initialStatusWebhook, setInitialStatusWebhook] = useState(false);
  const [synthVendor, setSynthVendor] =
    useState<keyof SynthesisVendors>(VENDOR_GOOGLE);
  const [synthLang, setSynthLang] = useState(LANG_EN_US);
  const [synthVoice, setSynthVoice] = useState(LANG_EN_US_STANDARD_C);
  const [recogVendor, setRecogVendor] =
    useState<keyof RecognizerVendors>(VENDOR_GOOGLE);
  const [recogLang, setRecogLang] = useState(LANG_EN_US);
  const [message, setMessage] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [credentials] = useApiData<SpeechCredential[]>(apiUrl);
  const [ttsVendorOptions, setttsVendorOptions] =
    useState<VendorOptions[]>(vendors);
  const [sttVendorOptions, setSttVendorOptions] =
    useState<VendorOptions[]>(vendors);
  const [recogLabel, setRecogLabel] = useState("");
  const [ttsLabelOptions, setTtsLabelOptions] = useState<LabelOptions[]>([]);
  const [sttLabelOptions, setSttLabelOptions] = useState<LabelOptions[]>([]);
  const [fallbackTtsLabelOptions, setFallbackTtsLabelOptions] = useState<
    LabelOptions[]
  >([]);
  const [fallbackSttLabelOptions, setFallbackSttLabelOptions] = useState<
    LabelOptions[]
  >([]);
  const [synthLabel, setSynthLabel] = useState("");
  const [recordAllCalls, setRecordAllCalls] = useState(false);

  const [useForFallbackSpeech, setUseForFallbackSpeech] = useState(false);
  const [fallbackSpeechSynthsisVendor, setFallbackSpeechSynthsisVendor] =
    useState<keyof SynthesisVendors>(VENDOR_GOOGLE);
  const [fallbackSpeechSynthsisLanguage, setFallbackSpeechSynthsisLanguage] =
    useState(LANG_EN_US);
  const [fallbackSpeechSynthsisVoice, setFallbackSpeechSynthsisVoice] =
    useState(LANG_EN_US_STANDARD_C);
  const [fallbackSpeechSynthsisLabel, setFallbackSpeechSynthsisLabel] =
    useState("");
  const [fallbackSpeechRecognizerVendor, setFallbackSpeechRecognizerVendor] =
    useState<keyof RecognizerVendors>(VENDOR_GOOGLE);
  const [
    fallbackSpeechRecognizerLanguage,
    setFallbackSpeechRecognizerLanguage,
  ] = useState(LANG_EN_US);
  const [fallbackSpeechRecognizerLabel, setFallbackSpeechRecognizerLabel] =
    useState("");
  const [initalCheckFallbackSpeech, setInitalCheckFallbackSpeech] =
    useState(false);
  const [appEnv, setAppEnv] = useState<AppEnv | null>(null);
  const appEnvTimeoutRef = useRef<number | null>(null);
  const [envVars, setEnvVars] = useState<Record<
    string,
    string | number | boolean
  > | null>(null);

  /** This lets us map and render the same UI for each... */
  const webhooks = [
    {
      label: "Calling",
      prefix: "call_webhook",
      stateVal: callWebhook,
      tmpStateVal: tmpCallWebhook,
      stateSet: setCallWebhook,
      tmpStateSet: setTmpCallWebhook,
      initialCheck: initialCallWebhook,
      required: true,
      webhookEnv: appEnv,
    },
    {
      label: "Call status",
      prefix: "status_webhook",
      stateVal: statusWebhook,
      tmpStateVal: tmpStatusWebhook,
      stateSet: setStatusWebhook,
      tmpStateSet: setTmpStatusWebhook,
      initialCheck: initialStatusWebhook,
      required: true,
    },
  ];

  useRedirect<Account>(
    accounts,
    ROUTE_INTERNAL_ACCOUNTS,
    "You must create an account before you can create an application.",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUserAccountScope(accountSid, user)) {
      toastError(
        "You do not have permissions to make changes to these Speech Credentials",
      );
      return;
    }

    setMessage("");

    if (applications) {
      if (
        applications.find(
          (a) =>
            a.name === applicationName &&
            (!application ||
              !application.data ||
              a.application_sid !== application.data.application_sid),
        )
      ) {
        setMessage(
          "The name you have entered is already in use on another one of your applications.",
        );
        return;
      }
    }

    const payload: Partial<Application> = {
      name: applicationName,
      app_json: applicationJson || null,
      call_hook: callWebhook || null,
      account_sid: accountSid || null,
      call_status_hook: statusWebhook || null,
      speech_synthesis_vendor: synthVendor || null,
      speech_synthesis_language: synthLang || null,
      speech_synthesis_label: synthLabel || null,
      speech_synthesis_voice: synthVoice || null,
      speech_recognizer_vendor: recogVendor || null,
      speech_recognizer_language: recogLang || null,
      speech_recognizer_label: recogLabel || null,
      record_all_calls: recordAllCalls ? 1 : 0,
      use_for_fallback_speech: useForFallbackSpeech ? 1 : 0,
      env_vars: envVars
        ? Object.keys(envVars).reduce((acc, key) => {
            const value = envVars[key];
            // Keep only values that:
            // 1. Are defined in appEnv schema
            // 2. Are not empty strings, undefined, or null
            // 3. For booleans and numbers, keep them even if they're false or 0
            if (
              appEnv &&
              appEnv[key] &&
              (value === false ||
                value === 0 ||
                (value !== "" && value != null))
            ) {
              return { ...acc, [key]: value };
            }
            return acc;
          }, {})
        : null,
      fallback_speech_synthesis_vendor: useForFallbackSpeech
        ? fallbackSpeechSynthsisVendor || null
        : null,
      fallback_speech_synthesis_language: useForFallbackSpeech
        ? fallbackSpeechSynthsisLanguage || null
        : null,
      fallback_speech_synthesis_voice: useForFallbackSpeech
        ? fallbackSpeechSynthsisVoice || null
        : null,
      fallback_speech_synthesis_label: useForFallbackSpeech
        ? fallbackSpeechSynthsisLabel || null
        : null,
      fallback_speech_recognizer_vendor: useForFallbackSpeech
        ? fallbackSpeechRecognizerVendor || null
        : null,
      fallback_speech_recognizer_language: useForFallbackSpeech
        ? fallbackSpeechRecognizerLanguage || null
        : null,
      fallback_speech_recognizer_label: useForFallbackSpeech
        ? fallbackSpeechRecognizerLabel || null
        : null,
    };

    if (application && application.data) {
      putApplication(application.data.application_sid, payload)
        .then(() => {
          application.refetch();
          toastSuccess("Application updated successfully");
          navigate(
            `${ROUTE_INTERNAL_APPLICATIONS}/${application.data?.application_sid}/edit`,
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    } else {
      postApplication(payload)
        .then(() => {
          toastSuccess("Application created successfully");
          navigate(ROUTE_INTERNAL_APPLICATIONS);
          setAccountFilter(accountSid);
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useMemo(() => {
    if (credentials && hasLength(credentials)) {
      const v = credentials
        .filter((tv) => tv.vendor.startsWith(VENDOR_CUSTOM) && tv.use_for_tts)
        .map((tv) =>
          Object.assign({
            name:
              tv.vendor.substring(VENDOR_CUSTOM.length + 1) +
              ` (${VENDOR_CUSTOM})`,
            value: tv.vendor,
          }),
        );
      setttsVendorOptions(vendors.concat(v));

      const v2 = credentials
        .filter((tv) => tv.vendor.startsWith(VENDOR_CUSTOM) && tv.use_for_stt)
        .map((tv) =>
          Object.assign({
            name:
              tv.vendor.substring(VENDOR_CUSTOM.length + 1) +
              ` (${VENDOR_CUSTOM})`,
            value: tv.vendor,
          }),
        );
      setSttVendorOptions(vendors.concat(v2));

      const noneLabelObject = {
        name: "None",
        value: "",
      };

      let c1 = credentials.filter(
        (c) =>
          c.vendor === synthVendor &&
          (!c.account_sid || c.account_sid === accountSid) &&
          c.use_for_tts,
      );
      let c2 = c1
        .filter((c) => c.label)
        .map((c) =>
          Object.assign({
            name: c.label,
            value: c.label,
          }),
        );

      setTtsLabelOptions(
        c1.length !== c2.length ? [noneLabelObject, ...c2] : c2,
      );

      c1 = fallbackSpeechSynthsisVendor
        ? credentials.filter(
            (c) =>
              c.vendor === fallbackSpeechSynthsisVendor &&
              (!c.account_sid || c.account_sid === accountSid) &&
              c.use_for_tts,
          )
        : [];

      c2 = c1
        .filter((c) => c.label)
        .map((c) =>
          Object.assign({
            name: c.label,
            value: c.label,
          }),
        );
      setFallbackTtsLabelOptions(
        c1.length !== c2.length ? [noneLabelObject, ...c2] : c2,
      );

      c1 = credentials.filter(
        (c) =>
          c.vendor === recogVendor &&
          (!c.account_sid || c.account_sid === accountSid) &&
          c.use_for_stt,
      );
      c2 = c1
        .filter((c) => c.label)
        .map((c) =>
          Object.assign({
            name: c.label,
            value: c.label,
          }),
        );

      setSttLabelOptions(
        c1.length !== c2.length ? [noneLabelObject, ...c2] : c2,
      );

      c1 = fallbackSpeechRecognizerVendor
        ? credentials.filter(
            (c) =>
              c.vendor === fallbackSpeechRecognizerVendor &&
              (!c.account_sid || c.account_sid === accountSid) &&
              c.use_for_stt,
          )
        : [];
      c2 = c1
        .filter((c) => c.label)
        .map((c) =>
          Object.assign({
            name: c.label,
            value: c.label,
          }),
        );

      setFallbackSttLabelOptions(
        c1.length !== c2.length ? [noneLabelObject, ...c2] : c2,
      );
    }
  }, [
    credentials,
    synthVendor,
    recogVendor,
    fallbackSpeechRecognizerVendor,
    fallbackSpeechSynthsisVendor,
  ]);

  useEffect(() => {
    if (accountSid) {
      setApiUrl(`Accounts/${accountSid}/SpeechCredentials`);
    }
  }, [accountSid]);

  useEffect(() => {
    let label: string;
    // Synthesis Label
    label = application?.data?.speech_synthesis_label || "";
    if (ttsLabelOptions && !ttsLabelOptions.find((l) => l.value === label)) {
      label = ttsLabelOptions.length ? ttsLabelOptions[0].value : "";
    }
    setSynthLabel(label);

    // fallback Synthesis Label
    label = application?.data?.fallback_speech_synthesis_label || "";
    if (
      fallbackTtsLabelOptions &&
      !fallbackTtsLabelOptions.find((l) => l.value === label)
    ) {
      label = fallbackTtsLabelOptions.length
        ? fallbackTtsLabelOptions[0].value
        : "";
    }
    setFallbackSpeechSynthsisLabel(label);

    // regconizer label
    label = application?.data?.speech_recognizer_label || "";
    if (sttLabelOptions && !sttLabelOptions.find((l) => l.value === label)) {
      label = sttLabelOptions.length ? sttLabelOptions[0].value : "";
    }
    setRecogLabel(label);

    // fallback regconizer label
    label = application?.data?.fallback_speech_recognizer_label || "";
    if (
      fallbackSttLabelOptions &&
      !fallbackSttLabelOptions.find((l) => l.value === label)
    ) {
      label = fallbackSttLabelOptions.length
        ? fallbackSttLabelOptions[0].value
        : "";
    }
    setFallbackSpeechRecognizerLabel(label);
  }, [
    ttsLabelOptions,
    sttLabelOptions,
    fallbackTtsLabelOptions,
    fallbackSttLabelOptions,
    application,
  ]);

  useEffect(() => {
    setLocation();
    if (application && application.data) {
      setApplicationName(application.data.name);
      setRecordAllCalls(application.data.record_all_calls ? true : false);
      if (!applicationJson) {
        setApplicationJson(application.data.app_json || "");
      }
      setTmpApplicationJson(applicationJson);
      setInitialApplicationJson(
        application.data.app_json != undefined &&
          application.data.app_json.length !== 0,
      );

      if (application.data.call_hook) {
        setCallWebhook(application.data.call_hook);
        setTmpCallWebhook(application.data.call_hook);

        if (
          application.data.call_hook.username ||
          application.data.call_hook.password
        )
          setInitialCallWebhook(true);
        else setInitialCallWebhook(false);
      }

      if (application.data.call_status_hook) {
        setStatusWebhook(application.data.call_status_hook);
        setTmpStatusWebhook(application.data.call_status_hook);

        if (
          application.data.call_status_hook.username ||
          application.data.call_status_hook.password
        )
          setInitialStatusWebhook(true);
        else setInitialStatusWebhook(false);
      }

      if (application.data.account_sid)
        setAccountSid(application.data.account_sid);

      if (application.data.speech_synthesis_vendor)
        setSynthVendor(
          application.data.speech_synthesis_vendor as keyof SynthesisVendors,
        );

      if (application.data.speech_synthesis_language)
        setSynthLang(
          application.data.speech_synthesis_language as keyof RecognizerVendors,
        );

      if (application.data.speech_synthesis_voice)
        setSynthVoice(application.data.speech_synthesis_voice);

      if (application.data.speech_recognizer_vendor)
        setRecogVendor(
          application.data.speech_recognizer_vendor as keyof RecognizerVendors,
        );

      if (application.data.speech_recognizer_language)
        setRecogLang(application.data.speech_recognizer_language);

      if (application.data.use_for_fallback_speech) {
        setUseForFallbackSpeech(application.data.use_for_fallback_speech > 0);
        setInitalCheckFallbackSpeech(
          application.data.use_for_fallback_speech > 0,
        );
      }
      if (application.data.fallback_speech_recognizer_vendor) {
        setFallbackSpeechRecognizerVendor(
          application.data
            .fallback_speech_recognizer_vendor as keyof RecognizerVendors,
        );
      }
      if (application.data.fallback_speech_recognizer_language) {
        setFallbackSpeechRecognizerLanguage(
          application.data.fallback_speech_recognizer_language,
        );
      }

      if (application.data.fallback_speech_synthesis_vendor) {
        setFallbackSpeechSynthsisVendor(
          application.data
            .fallback_speech_synthesis_vendor as keyof SynthesisVendors,
        );
      }
      if (application.data.fallback_speech_synthesis_language) {
        setFallbackSpeechSynthsisLanguage(
          application.data.fallback_speech_synthesis_language,
        );
      }
      if (application.data.fallback_speech_synthesis_voice) {
        setFallbackSpeechSynthsisVoice(
          application.data.fallback_speech_synthesis_voice,
        );
      }
      if (application.data.env_vars) {
        setEnvVars(application.data.env_vars);
      }
    }
  }, [application]);

  const swapPrimaryAndfalloverSpeech = () => {
    let tmp;

    tmp = synthVendor;
    setSynthVendor(fallbackSpeechSynthsisVendor);
    setFallbackSpeechSynthsisVendor(tmp);

    tmp = synthLang;
    setSynthLang(fallbackSpeechSynthsisLanguage);
    setFallbackSpeechSynthsisLanguage(synthLang);

    tmp = synthVoice;
    setSynthVoice(fallbackSpeechSynthsisVoice);
    setFallbackSpeechSynthsisVoice(tmp);

    tmp = synthLabel;
    setSynthLabel(fallbackSpeechSynthsisLabel);
    setFallbackSpeechSynthsisLabel(tmp);

    tmp = recogVendor;
    setRecogVendor(fallbackSpeechRecognizerVendor);
    setFallbackSpeechRecognizerVendor(tmp);

    tmp = recogLang;
    setRecogLang(fallbackSpeechRecognizerLanguage);
    setFallbackSpeechRecognizerLanguage(tmp);

    tmp = recogLabel;
    setRecogLabel(fallbackSpeechRecognizerLabel);
    setFallbackSpeechRecognizerLabel(tmp);
  };

  useEffect(() => {
    if (callWebhook && callWebhook.url) {
      // Clear any existing timeout to prevent multiple requests
      if (appEnvTimeoutRef.current) {
        clearTimeout(appEnvTimeoutRef.current);
        appEnvTimeoutRef.current = null;
      }

      appEnvTimeoutRef.current = setTimeout(() => {
        getAppEnvSchema(callWebhook.url)
          .then(({ json }) => {
            setAppEnv(json);
          })
          .catch((error) => {
            setMessage(error.msg);
          });
      }, 500);
    }

    return () => {
      if (appEnvTimeoutRef.current) {
        clearTimeout(appEnvTimeoutRef.current);
        appEnvTimeoutRef.current = null;
      }
    };
  }, [callWebhook]);

  return (
    <Section slim>
      <form
        className={`form form--internal ${
          !application?.data && application?.refetch ? "form--blur" : ""
        }`}
        onSubmit={handleSubmit}
      >
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        {application && application.data && (
          <fieldset>
            <label htmlFor="application_sid">Application SID</label>
            <ClipBoard
              id="application_sid"
              name="application_sid"
              text={application.data.application_sid}
            />
          </fieldset>
        )}
        <fieldset>
          <label htmlFor="application_name">
            Application name<span>*</span>
          </label>
          <input
            id="application_name"
            required
            type="text"
            name="application_name"
            placeholder="Application name"
            value={applicationName}
            onChange={(e) => setApplicationName(e.target.value)}
          />
        </fieldset>
        <fieldset>
          <AccountSelect
            accounts={accounts}
            account={[accountSid, setAccountSid]}
          />
        </fieldset>
        {webhooks.map((webhook) => {
          return (
            <fieldset key={webhook.prefix}>
              <div className="multi">
                <div className="inp">
                  <label htmlFor={`${webhook.prefix}_url`}>
                    {webhook.label} webhook{" "}
                    {webhook.required ? <span>*</span> : ""}
                  </label>
                  <input
                    id={`${webhook.prefix}_url`}
                    type="text"
                    name={`${webhook.prefix}_url`}
                    required={webhook.required}
                    placeholder={`${webhook.label} Webhook`}
                    value={webhook.stateVal?.url || ""}
                    onChange={(e) => {
                      webhook.stateSet({
                        ...webhook.stateVal,
                        url: e.target.value,
                        ...(e.target.value.startsWith("ws") && {
                          method: "GET",
                        }),
                      });
                      if (
                        e.target.value.startsWith("ws") &&
                        webhook.prefix === "call_webhook"
                      ) {
                        const statusWebhook = webhooks.find(
                          (w) => w.prefix === "status_webhook",
                        );
                        if (
                          statusWebhook &&
                          ((statusWebhook.stateVal?.url || "").length === 0 ||
                            statusWebhook.stateVal?.url.startsWith("ws"))
                        ) {
                          statusWebhook.stateSet({
                            ...statusWebhook.stateVal,
                            url: e.target.value,
                            method: "GET",
                          });
                        }
                      }
                    }}
                  />
                </div>
                <div className="sel">
                  <label htmlFor={`${webhook.prefix}_method`}>Method</label>
                  <Selector
                    id={`${webhook.prefix}_method`}
                    name={`${webhook.prefix}_method`}
                    value={webhook.stateVal?.method || ""}
                    onChange={(e) => {
                      webhook.stateSet({
                        ...webhook.stateVal,
                        method: e.target.value as WebhookMethod,
                      });
                    }}
                    disabled={webhook.stateVal?.url.startsWith("ws")}
                    options={WEBHOOK_METHODS}
                  />
                </div>
              </div>
              <Checkzone
                hidden
                name={webhook.prefix}
                label="Use HTTP basic authentication"
                initialCheck={webhook.initialCheck}
                handleChecked={(e) => {
                  if (e.target.checked) {
                    webhook.stateSet(webhook.tmpStateVal);
                  } else {
                    webhook.tmpStateSet(webhook.stateVal);
                    webhook.stateSet({
                      ...webhook.stateVal,
                      username: "",
                      password: "",
                    });
                  }
                }}
              >
                <MS>{MSG_WEBHOOK_FIELDS}</MS>
                <label htmlFor={`${webhook.prefix}_username`}>Username</label>
                <input
                  id={`${webhook.prefix}_username`}
                  type="text"
                  name={`${webhook.prefix}_username`}
                  placeholder="Optional"
                  value={webhook.stateVal?.username || ""}
                  onChange={(e) => {
                    webhook.stateSet({
                      ...webhook.stateVal,
                      username: e.target.value,
                    });
                  }}
                />
                <label htmlFor={`${webhook.prefix}_password`}>Password</label>
                <Passwd
                  id={`${webhook.prefix}_password`}
                  name={`${webhook.prefix}_password`}
                  value={webhook.stateVal?.password || ""}
                  placeholder="Optional"
                  onChange={(e) => {
                    webhook.stateSet({
                      ...webhook.stateVal,
                      password: e.target.value,
                    });
                  }}
                />
              </Checkzone>

              {webhook.webhookEnv &&
                Object.keys(webhook.webhookEnv).length > 0 && (
                  <>
                    {Object.keys(webhook.webhookEnv).map((key) => {
                      const envType = webhook.webhookEnv![key].type;
                      const isBoolean = envType === "boolean";
                      const isNumber = envType === "number";
                      const defaultValue = webhook.webhookEnv![key].default;

                      return (
                        <div key={key}>
                          {isBoolean ? (
                            // Boolean input as checkbox
                            <label htmlFor={`env_${key}`} className="chk">
                              <input
                                id={`env_${key}`}
                                type="checkbox"
                                name={`env_${key}`}
                                required={webhook.webhookEnv![key].required}
                                checked={
                                  envVars && envVars[key] !== undefined
                                    ? Boolean(envVars[key])
                                    : Boolean(defaultValue)
                                }
                                onChange={(e) => {
                                  setEnvVars((prev) => ({
                                    ...(prev || {}),
                                    [key]: e.target.checked,
                                  }));
                                }}
                              />
                              <Tooltip
                                text={webhook.webhookEnv![key].description}
                              >
                                {key}
                                {webhook.webhookEnv![key].required && (
                                  <span>*</span>
                                )}
                              </Tooltip>
                            </label>
                          ) : (
                            // Text or number input
                            <>
                              <label htmlFor={`env_${key}`}>
                                <Tooltip
                                  text={webhook.webhookEnv![key].description}
                                >
                                  {key}
                                  {webhook.webhookEnv![key].required && (
                                    <span>*</span>
                                  )}
                                </Tooltip>
                              </label>
                              {(() => {
                                // Common props for both input types
                                const commonProps = {
                                  id: `env_${key}`,
                                  name: `env_${key}`,
                                  required: webhook.webhookEnv![key].required,
                                  value:
                                    envVars && envVars[key] !== undefined
                                      ? String(envVars[key])
                                      : defaultValue !== undefined
                                        ? String(defaultValue)
                                        : "",
                                  onChange: (
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) => {
                                    // Convert to proper type based on schema
                                    let newValue;
                                    if (isNumber) {
                                      newValue =
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value);
                                    } else {
                                      newValue = e.target.value;
                                    }

                                    setEnvVars((prev) => ({
                                      ...(prev || {}),
                                      [key]: newValue,
                                    }));
                                  },
                                };

                                // Extra props only for regular input
                                const inputSpecificProps = {
                                  type: isNumber ? "number" : "text",
                                };

                                const textAreaSpecificProps = {
                                  rows: 6,
                                  cols: 61,
                                };

                                // Choose component type based on obscure flag
                                const componentType = webhook.webhookEnv![key]
                                  .obscure
                                  ? ObscureInput
                                  : webhook.webhookEnv![key].uiHint || "input";
                                if (componentType === "filepicker") {
                                  return (
                                    <>
                                      <FileUpload
                                        id={`app_env_${key}`}
                                        name={`app_env_${key}`}
                                        handleFile={(file) => {
                                          file
                                            .text()
                                            .then((content) => {
                                              setEnvVars((prev) => ({
                                                ...(prev || {}),
                                                [key]: content,
                                              }));
                                            })
                                            .catch((err) => {
                                              toastError(
                                                `Failed to read file: ${err.message}`,
                                              );
                                            });
                                        }}
                                        placeholder="Choose a file"
                                        required={
                                          webhook.webhookEnv![key].required
                                        }
                                      />
                                      {React.createElement("textarea", {
                                        ...commonProps,
                                        ...inputSpecificProps,
                                        ...textAreaSpecificProps,
                                      })}
                                    </>
                                  );
                                }
                                // Create the component with appropriate props
                                return React.createElement(
                                  componentType,
                                  webhook.webhookEnv![key].obscure
                                    ? commonProps
                                    : {
                                        ...commonProps,
                                        ...inputSpecificProps,
                                        ...(webhook.webhookEnv![key].uiHint ===
                                          "textarea" && textAreaSpecificProps),
                                      },
                                );
                              })()}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
            </fieldset>
          );
        })}
        <SpeechProviderSelection
          serviceProviderSid={
            currentServiceProvider?.service_provider_sid || ""
          }
          accountSid={accountSid}
          credentials={credentials}
          ttsVendor={[synthVendor, setSynthVendor]}
          ttsVendorOptions={ttsVendorOptions}
          ttsVoice={[synthVoice, setSynthVoice]}
          ttsLang={[synthLang, setSynthLang]}
          ttsLabelOptions={ttsLabelOptions}
          ttsLabel={[synthLabel, setSynthLabel]}
          sttVendor={[recogVendor, setRecogVendor]}
          sttVendorOptions={sttVendorOptions}
          sttLang={[recogLang, setRecogLang]}
          sttLabelOptions={sttLabelOptions}
          sttLabel={[recogLabel, setRecogLabel]}
        />

        <fieldset>
          <Checkzone
            hidden
            name="cz_fallback_speech"
            label="Use a fallback speech vendor if primary fails"
            initialCheck={initalCheckFallbackSpeech}
            handleChecked={(e) => {
              setUseForFallbackSpeech(e.target.checked);
            }}
          >
            <SpeechProviderSelection
              serviceProviderSid={
                currentServiceProvider?.service_provider_sid || ""
              }
              accountSid={accountSid}
              credentials={credentials}
              ttsVendor={[
                fallbackSpeechSynthsisVendor,
                setFallbackSpeechSynthsisVendor,
              ]}
              ttsVendorOptions={ttsVendorOptions}
              ttsVoice={[
                fallbackSpeechSynthsisVoice,
                setFallbackSpeechSynthsisVoice,
              ]}
              ttsLang={[
                fallbackSpeechSynthsisLanguage,
                setFallbackSpeechSynthsisLanguage,
              ]}
              ttsLabelOptions={fallbackTtsLabelOptions}
              ttsLabel={[
                fallbackSpeechSynthsisLabel,
                setFallbackSpeechSynthsisLabel,
              ]}
              sttVendor={[
                fallbackSpeechRecognizerVendor,
                setFallbackSpeechRecognizerVendor,
              ]}
              sttVendorOptions={sttVendorOptions}
              sttLang={[
                fallbackSpeechRecognizerLanguage,
                setFallbackSpeechRecognizerLanguage,
              ]}
              sttLabelOptions={fallbackSttLabelOptions}
              sttLabel={[
                fallbackSpeechRecognizerLabel,
                setFallbackSpeechRecognizerLabel,
              ]}
            />
            <fieldset>
              <Button
                type="button"
                small
                onClick={swapPrimaryAndfalloverSpeech}
              >
                Swap primary and fallback
              </Button>
            </fieldset>
          </Checkzone>
        </fieldset>
        {(import.meta.env.INITIAL_APP_JSON_ENABLED === undefined ||
          import.meta.env.INITIAL_APP_JSON_ENABLED) && (
          <fieldset>
            <Checkzone
              hidden
              name="cz_pplication_json"
              label="Override webhook for initial application"
              initialCheck={initialApplicationJson}
              handleChecked={(e) => {
                if (e.target.checked && tmpApplicationJson) {
                  setApplicationJson(tmpApplicationJson);
                }
                if (!e.target.checked) {
                  setTmpApplicationJson(applicationJson);
                  setApplicationJson("");
                }
              }}
            >
              <textarea
                id="input_application_json"
                name="application_json"
                rows={6}
                cols={55}
                placeholder="an array of jambonz verbs to execute"
                value={applicationJson}
                onChange={(e) => setApplicationJson(e.target.value)}
              />
            </Checkzone>
          </fieldset>
        )}
        {!DISABLE_CALL_RECORDING &&
          accounts?.filter((a) => a.account_sid === accountSid).length &&
          !accounts?.filter((a) => a.account_sid === accountSid)[0]
            .record_all_calls && (
            <fieldset>
              <label htmlFor="record_all_call" className="chk">
                <input
                  id="record_all_call"
                  name="record_all_call"
                  type="checkbox"
                  onChange={(e) => setRecordAllCalls(e.target.checked)}
                  checked={recordAllCalls}
                />
                <div>Record all calls</div>
              </label>
            </fieldset>
          )}
        {message && <fieldset>{<Message message={message} />}</fieldset>}
        <fieldset>
          <ButtonGroup left>
            <Button
              small
              subStyle="grey"
              as={Link}
              to={ROUTE_INTERNAL_APPLICATIONS}
            >
              Cancel
            </Button>
            <Button type="submit" small>
              Save
            </Button>
          </ButtonGroup>
        </fieldset>
      </form>
    </Section>
  );
};

export default ApplicationForm;
