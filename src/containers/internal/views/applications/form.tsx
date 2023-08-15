import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, MS } from "@jambonz/ui-kit";
import { Link, useNavigate } from "react-router-dom";

import { toastError, toastSuccess, useSelectState } from "src/store";
import { ClipBoard, Section } from "src/components";
import {
  Selector,
  Checkzone,
  Passwd,
  Message,
  AccountSelect,
} from "src/components/forms";
import {
  vendors,
  LANG_EN_US,
  VENDOR_GOOGLE,
  LANG_EN_US_STANDARD_C,
  VENDOR_AWS,
  VENDOR_WELLSAID,
  useSpeechVendors,
  VENDOR_DEEPGRAM,
  VENDOR_SONIOX,
  VENDOR_CUSTOM,
} from "src/vendor";
import {
  postApplication,
  putApplication,
  useServiceProviderData,
  useApiData,
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
  Voice,
  VoiceLanguage,
  Language,
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
} from "src/api/types";
import { MSG_REQUIRED_FIELDS, MSG_WEBHOOK_FIELDS } from "src/constants";
import { hasLength, isUserAccountScope, useRedirect } from "src/utils";
import { setAccountFilter, setLocation } from "src/store/localStore";

type ApplicationFormProps = {
  application?: UseApiDataMap<Application>;
};

export const ApplicationForm = ({ application }: ApplicationFormProps) => {
  const navigate = useNavigate();
  const { synthesis, recognizers } = useSpeechVendors();
  const user = useSelectState("user");
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
  const [messageWebhook, setMessageWebhook] =
    useState<WebHook>(DEFAULT_WEBHOOK);
  const [tmpMessageWebhook, setTmpMessageWebhook] =
    useState<WebHook>(DEFAULT_WEBHOOK);
  const [initialMessageWebhook, setInitialMessageWebhook] = useState(false);
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
  const [softTtsVendor, setSoftTtsVendor] = useState<VendorOptions[]>(vendors);
  const [softSttVendor, setSoftSttVendor] = useState<VendorOptions[]>(vendors);
  const [ttsLabelOptions, setTtsLabelOptions] = useState<LabelOptions[]>([]);
  const [synthLabel, setSynthLabel] = useState("");
  const [recordAllCalls, setRecordAllCalls] = useState(false);

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
    {
      label: "Messaging",
      prefix: "message_webhook",
      stateVal: messageWebhook,
      tmpStateVal: tmpMessageWebhook,
      stateSet: setMessageWebhook,
      tmpStateSet: setTmpMessageWebhook,
      initialCheck: initialMessageWebhook,
      required: false,
    },
  ];

  useRedirect<Account>(
    accounts,
    ROUTE_INTERNAL_ACCOUNTS,
    "You must create an account before you can create an application."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUserAccountScope(accountSid, user)) {
      toastError(
        "You do not have permissions to make changes to these Speech Credentials"
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
              a.application_sid !== application.data.application_sid)
        )
      ) {
        setMessage(
          "The name you have entered is already in use on another one of your applications."
        );
        return;
      }
    }

    const payload = {
      name: applicationName,
      app_json: applicationJson || null,
      call_hook: callWebhook || null,
      account_sid: accountSid || null,
      messaging_hook: messageWebhook || null,
      call_status_hook: statusWebhook || null,
      speech_synthesis_vendor: synthVendor || null,
      speech_synthesis_language: synthLang || null,
      speech_synthesis_voice: synthVoice || null,
      speech_recognizer_vendor: recogVendor || null,
      speech_recognizer_language: recogLang || null,
      record_all_calls: recordAllCalls ? 1 : 0,
    };

    if (application && application.data) {
      putApplication(application.data.application_sid, payload)
        .then(() => {
          application.refetch();
          toastSuccess("Application updated successfully");
          navigate(
            `${ROUTE_INTERNAL_APPLICATIONS}/${application.data?.application_sid}/edit`
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

  useEffect(() => {
    if (credentials && hasLength(credentials)) {
      const v = credentials
        .filter((tv) => tv.vendor.startsWith(VENDOR_CUSTOM) && tv.use_for_tts)
        .map((tv) =>
          Object.assign({
            name:
              tv.vendor.substring(VENDOR_CUSTOM.length + 1) +
              ` (${VENDOR_CUSTOM})`,
            value: tv.vendor,
          })
        );
      setSoftTtsVendor(vendors.concat(v));

      const v2 = credentials
        .filter((tv) => tv.vendor.startsWith(VENDOR_CUSTOM) && tv.use_for_stt)
        .map((tv) =>
          Object.assign({
            name:
              tv.vendor.substring(VENDOR_CUSTOM.length + 1) +
              ` (${VENDOR_CUSTOM})`,
            value: tv.vendor,
          })
        );
      setSoftSttVendor(vendors.concat(v2));
    }
  }, [credentials]);

  useEffect(() => {
    if (credentials) {
      const labels = credentials
        .filter(
          (c) =>
            c.label && c.vendor === synthVendor && c.account_sid === accountSid
        )
        .map((c) =>
          Object.assign({
            name: c.label,
            value: c.label,
          })
        );

      setTtsLabelOptions(labels);
    }
  }, [synthVendor]);

  useEffect(() => {
    if (accountSid) {
      setApiUrl(`Accounts/${accountSid}/SpeechCredentials`);
    }
  }, [accountSid]);

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
          application.data.app_json.length !== 0
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

      if (application.data.messaging_hook) {
        setMessageWebhook(application.data.messaging_hook);
        setTmpMessageWebhook(application.data.messaging_hook);

        if (
          application.data.messaging_hook.username ||
          application.data.messaging_hook.password
        )
          setInitialMessageWebhook(true);
        else setInitialMessageWebhook(false);
      }

      if (application.data.account_sid)
        setAccountSid(application.data.account_sid);

      if (application.data.messaging_hook)
        setMessageWebhook(application.data.messaging_hook);

      if (application.data.speech_synthesis_vendor)
        setSynthVendor(
          application.data.speech_synthesis_vendor as keyof SynthesisVendors
        );

      if (application.data.speech_synthesis_language)
        setSynthLang(
          application.data.speech_synthesis_language as keyof RecognizerVendors
        );

      if (application.data.speech_synthesis_voice)
        setSynthVoice(application.data.speech_synthesis_voice);

      if (application.data.speech_recognizer_vendor)
        setRecogVendor(
          application.data.speech_recognizer_vendor as keyof RecognizerVendors
        );

      if (application.data.speech_recognizer_language)
        setRecogLang(application.data.speech_recognizer_language);
    }
  }, [application]);

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
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
                      });
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
            </fieldset>
          );
        })}
        {synthesis && (
          <fieldset>
            <label htmlFor="synthesis_vendor">Speech synthesis vendor</label>
            <Selector
              id="synthesis_vendor"
              name="synthesis_vendor"
              value={synthVendor}
              options={softTtsVendor.filter(
                (vendor) =>
                  vendor.value != VENDOR_DEEPGRAM &&
                  vendor.value != VENDOR_SONIOX &&
                  vendor.value !== VENDOR_CUSTOM
              )}
              onChange={(e) => {
                const vendor = e.target.value as keyof SynthesisVendors;
                setSynthVendor(vendor);

                /** When Custom Vendor is used, user you have to input the lange and voice. */
                if (vendor.toString().startsWith(VENDOR_CUSTOM)) {
                  setSynthVoice("");
                  return;
                }

                /** When using Google and en-US, ensure "Standard-C" is used as default */
                if (
                  e.target.value === VENDOR_GOOGLE &&
                  synthLang === LANG_EN_US
                ) {
                  setSynthVoice(LANG_EN_US_STANDARD_C);
                  return;
                }

                /** Google and AWS have different language lists */
                /** If the new language doesn't map then default to "en-US" */
                let newLang = synthesis[vendor].find(
                  (lang) => lang.code === synthLang
                );

                if (newLang) {
                  setSynthVoice(newLang.voices[0].value);
                  return;
                }

                newLang = synthesis[vendor].find(
                  (lang) => lang.code === LANG_EN_US
                );

                setSynthLang(LANG_EN_US);
                setSynthVoice(newLang!.voices[0].value);
              }}
            />
            {hasLength(ttsLabelOptions) && (
              <>
                <label htmlFor="synthesis_lang">Label</label>
                <Selector
                  id="systhesis_label"
                  name="systhesis_label"
                  value={synthLabel}
                  options={ttsLabelOptions}
                  onChange={(e) => {
                    setSynthLabel(e.target.value);
                  }}
                ></Selector>
              </>
            )}
            {synthVendor &&
              !synthVendor.toString().startsWith(VENDOR_CUSTOM) &&
              synthLang && (
                <>
                  <label htmlFor="synthesis_lang">Language</label>
                  <Selector
                    id="synthesis_lang"
                    name="synthesis_lang"
                    value={synthLang}
                    options={synthesis[
                      synthVendor as keyof SynthesisVendors
                    ].map((lang: VoiceLanguage) => ({
                      name: lang.name,
                      value: lang.code,
                    }))}
                    onChange={(e) => {
                      const language = e.target.value;
                      setSynthLang(language);

                      /** When using Google and en-US, ensure "Standard-C" is used as default */
                      if (
                        synthVendor === VENDOR_GOOGLE &&
                        language === LANG_EN_US
                      ) {
                        setSynthVoice(LANG_EN_US_STANDARD_C);
                        return;
                      }

                      const newLang = synthesis[
                        synthVendor as keyof SynthesisVendors
                      ].find((lang) => lang.code === language);

                      setSynthVoice(newLang!.voices[0].value);
                    }}
                  />
                  <label htmlFor="synthesis_voice">Voice</label>
                  <Selector
                    id="synthesis_voice"
                    name="synthesis_voice"
                    value={synthVoice}
                    options={
                      synthesis[synthVendor as keyof SynthesisVendors]
                        .filter(
                          (lang: VoiceLanguage) => lang.code === synthLang
                        )
                        .flatMap((lang: VoiceLanguage) =>
                          lang.voices.map((voice: Voice) => ({
                            name: voice.name,
                            value: voice.value,
                          }))
                        ) as Voice[]
                    }
                    onChange={(e) => setSynthVoice(e.target.value)}
                  />
                </>
              )}
            {synthVendor.toString().startsWith(VENDOR_CUSTOM) && (
              <>
                <label htmlFor="custom_vendor_synthesis_lang">Language</label>
                <input
                  id="custom_vendor_synthesis_lang"
                  type="text"
                  name="custom_vendor_synthesis_lang"
                  placeholder="Required"
                  required
                  value={synthLang}
                  onChange={(e) => {
                    setSynthLang(e.target.value);
                  }}
                />

                <label htmlFor="custom_vendor_synthesis_voice">Voice</label>
                <input
                  id="custom_vendor_synthesis_voice"
                  type="text"
                  name="custom_vendor_synthesis_voice"
                  placeholder="Required"
                  required
                  value={synthVoice}
                  onChange={(e) => {
                    setSynthVoice(e.target.value);
                  }}
                />
              </>
            )}
          </fieldset>
        )}
        {recognizers && (
          <fieldset>
            <label htmlFor="recognizer_vendor">Speech recognizer vendor</label>
            <Selector
              id="recognizer_vendor"
              name="recognizer_vendor"
              value={recogVendor}
              options={softSttVendor.filter(
                (vendor) =>
                  vendor.value != VENDOR_WELLSAID &&
                  vendor.value !== VENDOR_CUSTOM
              )}
              onChange={(e) => {
                const vendor = e.target.value as keyof RecognizerVendors;
                setRecogVendor(vendor);

                /**When vendor is custom, Language is input by user */
                if (vendor.toString() === VENDOR_CUSTOM) return;

                /** Google and AWS have different language lists */
                /** If the new language doesn't map then default to "en-US" */
                const newLang = recognizers[vendor].find(
                  (lang: Language) => lang.code === recogLang
                );

                if (
                  (vendor === VENDOR_GOOGLE || vendor === VENDOR_AWS) &&
                  !newLang
                ) {
                  setRecogLang(LANG_EN_US);
                }
              }}
            />
            {recogVendor &&
              !recogVendor.toString().startsWith(VENDOR_CUSTOM) &&
              recogLang && (
                <>
                  <label htmlFor="recognizer_lang">Language</label>
                  <Selector
                    id="recognizer_lang"
                    name="recognizer_lang"
                    value={recogLang}
                    options={recognizers[
                      recogVendor as keyof RecognizerVendors
                    ].map((lang: Language) => ({
                      name: lang.name,
                      value: lang.code,
                    }))}
                    onChange={(e) => {
                      setRecogLang(e.target.value);
                    }}
                  />
                </>
              )}
            {recogVendor.toString().startsWith(VENDOR_CUSTOM) && (
              <>
                <label htmlFor="custom_vendor_recognizer_voice">Language</label>
                <input
                  id="custom_vendor_recognizer_voice"
                  type="text"
                  name="custom_vendor_recognizer_voice"
                  placeholder="Required"
                  required
                  value={recogLang}
                  onChange={(e) => {
                    setRecogLang(e.target.value);
                  }}
                />
              </>
            )}
          </fieldset>
        )}
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
