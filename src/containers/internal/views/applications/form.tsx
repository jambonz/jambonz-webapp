import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, MS } from "jambonz-ui";
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
import { DEFAULT_WEBHOOK, WEBHOOK_METHODS } from "src/api/constants";

import type {
  RecognizerVendors,
  SynthesisVendors,
  Voice,
  VoiceLanguage,
  Language,
} from "src/vendor/types";

import type {
  Account,
  WebHook,
  Application,
  WebhookMethod,
  UseApiDataMap,
} from "src/api/types";
import { MSG_REQUIRED_FIELDS, MSG_WEBHOOK_FIELDS } from "src/constants";
import { isUserAccountScope, useRedirect } from "src/utils";

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
  const [accountSid, setAccountSid] = useState("");
  const [callWebhook, setCallWebhook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [initialCallWebhook, setInitialCallWebhook] = useState(false);
  const [statusWebhook, setStatusWebhook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [initialStatusWebhook, setInitialStatusWebhook] = useState(false);
  const [messageWebhook, setMessageWebhook] =
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

  /** This lets us map and render the same UI for each... */
  const webhooks = [
    {
      label: "Calling",
      prefix: "call_webhook",
      stateVal: callWebhook,
      stateSet: setCallWebhook,
      initialCheck: initialCallWebhook,
      required: true,
    },
    {
      label: "Call status",
      prefix: "status_webhook",
      stateVal: statusWebhook,
      stateSet: setStatusWebhook,
      initialCheck: initialStatusWebhook,
      required: true,
    },
    {
      label: "Messaging",
      prefix: "message_webhook",
      stateVal: messageWebhook,
      stateSet: setMessageWebhook,
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
      call_hook: callWebhook || null,
      account_sid: accountSid || null,
      messaging_hook: messageWebhook || null,
      call_status_hook: statusWebhook || null,
      speech_synthesis_vendor: synthVendor || null,
      speech_synthesis_language: synthLang || null,
      speech_synthesis_voice: synthVoice || null,
      speech_recognizer_vendor: recogVendor || null,
      speech_recognizer_language: recogLang || null,
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
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    if (application && application.data) {
      setApplicationName(application.data.name);

      if (application.data.call_hook) {
        setCallWebhook(application.data.call_hook);

        if (
          application.data.call_hook.username ||
          application.data.call_hook.password
        )
          setInitialCallWebhook(true);
        else setInitialCallWebhook(false);
      }

      if (application.data.call_status_hook) {
        setStatusWebhook(application.data.call_status_hook);

        if (
          application.data.call_status_hook.username ||
          application.data.call_status_hook.password
        )
          setInitialStatusWebhook(true);
        else setInitialStatusWebhook(false);
      }

      if (application.data.messaging_hook) {
        setMessageWebhook(application.data.messaging_hook);

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
                  required={
                    webhook.required &&
                    !webhook.stateVal.username &&
                    webhook.stateVal.password
                      ? true
                      : false
                  }
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
                  required={
                    webhook.required &&
                    webhook.stateVal.username &&
                    !webhook.stateVal.password
                      ? true
                      : false
                  }
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
              options={vendors.filter(
                (vendor) => vendor.value != VENDOR_DEEPGRAM
              )}
              onChange={(e) => {
                const vendor = e.target.value as keyof SynthesisVendors;
                setSynthVendor(vendor);

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
            {synthVendor && synthLang && (
              <>
                <label htmlFor="synthesis_lang">Language</label>
                <Selector
                  id="synthesis_lang"
                  name="synthesis_lang"
                  value={synthLang}
                  options={synthesis[synthVendor as keyof SynthesisVendors].map(
                    (lang: VoiceLanguage) => ({
                      name: lang.name,
                      value: lang.code,
                    })
                  )}
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
                      .filter((lang: VoiceLanguage) => lang.code === synthLang)
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
          </fieldset>
        )}
        {recognizers && (
          <fieldset>
            <label htmlFor="recognizer_vendor">Speech recognizer vendor</label>
            <Selector
              id="recognizer_vendor"
              name="recognizer_vendor"
              value={recogVendor}
              options={vendors.filter(
                (vendor) => vendor.value != VENDOR_WELLSAID
              )}
              onChange={(e) => {
                const vendor = e.target.value as keyof RecognizerVendors;
                setRecogVendor(vendor);

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
            {recogVendor && recogLang && (
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
