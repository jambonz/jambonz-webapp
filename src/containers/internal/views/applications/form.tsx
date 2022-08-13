import React, { useEffect, useState, useRef } from "react";
import { P, Button, ButtonGroup } from "jambonz-ui";
import { Link, useNavigate } from "react-router-dom";

import { toastError, toastSuccess } from "src/store";
import { Section } from "src/components";
import { Selector, Checkzone, Passwd, Message } from "src/components/forms";
import {
  vendors,
  LANG_EN_US,
  VENDOR_GOOGLE,
  LANG_EN_US_STANDARD_C,
  VENDOR_AWS,
  VENDOR_WELLSAID,
} from "src/vendor";
import {
  useServiceProviderData,
  useApiData,
  postApplication,
  putApplication,
} from "src/api";
import { ROUTE_INTERNAL_APPLICATIONS } from "src/router/routes";
import { DEFAULT_WEBHOOK } from "src/api/constants";

import type {
  RecognizerVendors,
  SynthesisVendors,
  Voice,
  VoiceLanguage,
  Language,
} from "src/vendor/types";

import type { Account, WebHook, Application, FetchError } from "src/api/types";

export type UseApplicationData = {
  // data fed from ./edit
  data: Application[] | null; // data returned is an array but there is only 1 (0) that matters
  error: FetchError | null;
  refetch: () => void;
};

type ApplicationFormProps = {
  application?: null | UseApplicationData;
};

export const ApplicationForm = ({
  application = null,
}: ApplicationFormProps) => {
  // const [application, setApplication] = useState<Application | null>(null);
  const navigate = useNavigate();
  const [applicationName, setApplicationName] = useState<string>("");
  const [applications] = useApiData<Application[]>("Applications");

  const [accountSid, setAccountSid] = useState<string>("");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  const refCallWebhookUser = useRef<HTMLInputElement>(null);
  const refCallWebhookPass = useRef<HTMLInputElement>(null);
  const [callWebhook, setCallWebhook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [initialCallWebhook] = useState<boolean>(false);

  const refStatusWebhookUser = useRef<HTMLInputElement>(null);
  const refStatusWebhookPass = useRef<HTMLInputElement>(null);
  const [statusWebhook, setStatusWebhook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [initialStatusWebhook] = useState<boolean>(false);

  const refMessageWebhookUser = useRef<HTMLInputElement>(null);
  const refMessageWebhookPass = useRef<HTMLInputElement>(null);
  const [messageWebhook, setMessageWebhook] =
    useState<WebHook>(DEFAULT_WEBHOOK);
  const [initialMessageWebhook] = useState<boolean>(false);

  const [synthVendor, setSynthVendor] =
    useState<keyof SynthesisVendors>(VENDOR_GOOGLE);
  const [synthLang, setSynthLang] = useState<string>(LANG_EN_US);
  const [synthVoice, setSynthVoice] = useState<string>(LANG_EN_US_STANDARD_C);

  const [recogVendor, setRecogVendor] =
    useState<keyof RecognizerVendors>(VENDOR_GOOGLE);
  const [recogLang, setRecogLang] = useState<string>(LANG_EN_US);

  const [synthesis, setSynthesis] = useState<SynthesisVendors | null>(null);
  const [recognizers, setRecognizers] = useState<RecognizerVendors | null>(
    null
  );

  const [message, setMessage] = useState("");

  const webhook_method = [
    {
      name: "POST",
      value: "POST",
    },
    {
      name: "GET",
      value: "GET",
    },
  ];

  const webhooks = [
    {
      label: "Call",
      prefix: "call_webhook",
      stateVal: callWebhook,
      stateSet: setCallWebhook,
      initialCheck: initialCallWebhook,
      refUser: refCallWebhookUser,
      refPass: refCallWebhookPass,
    },
    {
      label: "Status",
      prefix: "status_webhook",
      stateVal: statusWebhook,
      stateSet: setStatusWebhook,
      initialCheck: initialStatusWebhook,
      refUser: refStatusWebhookUser,
      refPass: refStatusWebhookPass,
    },
    {
      label: "Message",
      prefix: "message_webhook",
      stateVal: messageWebhook,
      stateSet: setMessageWebhook,
      initialCheck: initialMessageWebhook,
      refUser: refMessageWebhookUser,
      refPass: refMessageWebhookPass,
    },
  ];

  /** Copy pasted from ../accounts/form.tsx */
  const handleSetHook = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    hook: WebHook,
    setHook: (h: WebHook) => void
  ) => {
    if (hook) {
      setHook({
        ...hook,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (!applicationName) {
      setMessage("Application name must not be empty");
      return;
    }

    if (!accountSid) {
      setMessage("Account must be selected");
      return;
    }

    webhooks.map((webhook) => {
      if (
        (webhook.stateVal?.username && !webhook.stateVal?.password) ||
        (!webhook.stateVal?.username && webhook.stateVal?.password)
      ) {
        setMessage(
          `${webhook.label} username and password must be either both filled out or both empty.`
        );
        !webhook.stateVal.username && webhook.refUser.current?.focus();
        !webhook.stateVal.password && webhook.refPass.current?.focus();
        return;
      }
    });

    if (applications && !application) {
      // update can still have the same name
      if (applications.find((a) => a.name === applicationName)) {
        setMessage(
          "The name you have entered is already in use on another one of your applications."
        );
        return;
      }
    }

    if (application && application.data) {
      putApplication(application.data[0].application_sid, {
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
      })
        .then(() => {
          application.refetch();
          toastSuccess("Application updated successfully");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    } else {
      postApplication({
        name: applicationName,
        call_hook: callWebhook || null,
        account_sid: accountSid || null,
        messaging_hook: messageWebhook || null,
        call_status_hook: statusWebhook || null,
        application_sid: null,
        speech_synthesis_vendor: synthVendor || null,
        speech_synthesis_language: synthLang || null,
        speech_synthesis_voice: synthVoice || null,
        speech_recognizer_vendor: recogVendor || null,
        speech_recognizer_language: recogLang || null,
      })
        .then(() => {
          toastSuccess("Application created successfully");
          navigate(`${ROUTE_INTERNAL_APPLICATIONS}`);
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  // console.log(application && application);
  useEffect(() => {
    let ignore = false;

    if (application && application.data) {
      setApplicationName(application.data[0].name);

      if (application.data[0].call_hook)
        setCallWebhook(application.data[0].call_hook);

      if (application.data[0].account_sid)
        setAccountSid(application.data[0].account_sid);

      if (application.data[0].messaging_hook)
        setMessageWebhook(application.data[0].messaging_hook);

      if (application.data[0].speech_synthesis_vendor)
        setSynthVendor(
          application.data[0].speech_synthesis_vendor as keyof SynthesisVendors
        );

      if (application.data[0].speech_synthesis_language)
        setSynthLang(
          application.data[0]
            .speech_synthesis_language as keyof RecognizerVendors
        );

      if (application.data[0].speech_synthesis_voice)
        setSynthVoice(application.data[0].speech_synthesis_voice);

      if (application.data[0].speech_recognizer_vendor)
        setRecogVendor(
          application.data[0]
            .speech_recognizer_vendor as keyof RecognizerVendors
        );

      if (application.data[0].speech_recognizer_language)
        setRecogLang(application.data[0].speech_recognizer_language);
    }

    Promise.all([
      import("src/vendor/speech-recognizer/aws-speech-recognizer-lang"),
      import("src/vendor/speech-recognizer/google-speech-recognizer-lang"),
      import("src/vendor/speech-recognizer/ms-speech-recognizer-lang"),
      import("src/vendor/speech-synthesis/aws-speech-synthesis-lang"),
      import("src/vendor/speech-synthesis/google-speech-synthesis-lang"),
      import("src/vendor/speech-synthesis/ms-speech-synthesis-lang"),
      import("src/vendor/speech-synthesis/wellsaid-speech-synthesis-lang"),
    ]).then(
      ([
        { default: awsRecognizer },
        { default: googleRecognizer },
        { default: msRecognizer },
        { default: awsSynthesis },
        { default: googleSynthesis },
        { default: msSynthesis },
        { default: wellsaidSynthesis },
      ]) => {
        if (!ignore) {
          setSynthesis({
            aws: awsSynthesis,
            google: googleSynthesis,
            microsoft: msSynthesis,
            wellsaid: wellsaidSynthesis,
          });
          setRecognizers({
            aws: awsRecognizer,
            google: googleRecognizer,
            microsoft: msRecognizer,
          });
        }
      }
    );

    return function cleanup() {
      ignore = true;
    };
  }, [application]); // i think this one makes sure there is one less lazy

  return (
    <>
      <Section>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <label htmlFor="application_name">Name</label>
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
          {accounts && (
            <fieldset>
              <label htmlFor="account_name">Account</label>
              <Selector
                id="account_name"
                name="account_name"
                value={accountSid}
                placeholder="Select an account"
                options={[
                  {
                    // TODO: correctly concating these twos so the select an account option is up there
                    name: "-- Select an account --",
                    value: "",
                  },
                ].concat(
                  accounts.map((account) => ({
                    name: account.name,
                    value: account.account_sid,
                  }))
                )}
                onChange={(e) => setAccountSid(e.target.value)}
              />
            </fieldset>
          )}
          {webhooks.map((webhook) => {
            return (
              <fieldset key={webhook.prefix}>
                <label htmlFor="registration_hook_url">
                  {webhook.label} Webhook
                </label>
                <input
                  id={`${webhook.prefix}_url`}
                  type="text"
                  name="url"
                  placeholder={`${webhook.label} Webhook`}
                  value={webhook.stateVal?.url || ""}
                  onChange={(e) =>
                    handleSetHook(e, webhook.stateVal, webhook.stateSet)
                  }
                />
                <label htmlFor={`${webhook.prefix}_method`}>Method</label>
                <Selector
                  id={`${webhook.prefix}_method`}
                  name="method"
                  value={webhook.stateVal?.method || ""}
                  onChange={(e) =>
                    handleSetHook(e, webhook.stateVal, webhook.stateSet)
                  }
                  options={webhook_method}
                />
                <Checkzone
                  hidden
                  name={webhook.prefix}
                  label="Use HTTP Basic Authentication"
                  initialCheck={webhook.initialCheck}
                >
                  <label htmlFor={`${webhook.prefix}_username`}>Username</label>
                  <input
                    ref={webhook.refUser}
                    id={`${webhook.prefix}_username`}
                    type="text"
                    name="username"
                    placeholder="Optional"
                    value={webhook.stateVal?.username || ""}
                    onChange={(e) =>
                      handleSetHook(e, webhook.stateVal, webhook.stateSet)
                    }
                  />
                  <label htmlFor={`${webhook.prefix}_password`}>Password</label>
                  <Passwd
                    ref={webhook.refPass}
                    id={`${webhook.prefix}_password`}
                    name="password"
                    value={webhook.stateVal?.password || ""}
                    placeholder="Optional"
                    onChange={(e) =>
                      handleSetHook(e, webhook.stateVal, webhook.stateSet)
                    }
                  />
                </Checkzone>
              </fieldset>
            );
          })}
          {synthesis && (
            <>
              <fieldset>
                <label htmlFor="synthesis_vendor">
                  Speech Synthesis Vendor
                </label>
                <Selector
                  id="synthesis_vendor"
                  name="synthesis_vendor"
                  value={synthVendor}
                  options={vendors}
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
              </fieldset>
              {synthVendor && synthLang && (
                <>
                  <fieldset>
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
                  </fieldset>
                  <fieldset>
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
                          .map((lang: VoiceLanguage) =>
                            lang.voices.map((voice: Voice) => ({
                              name: voice.name,
                              value: voice.value,
                            }))
                          )
                          .flat() as Voice[]
                      }
                      onChange={(e) => setSynthVoice(e.target.value)}
                    />
                  </fieldset>
                </>
              )}
            </>
          )}
          <P>
            Selected recognizer vendor:{" "}
            <strong>{recogVendor || "undefined"}</strong>.
          </P>
          <P>
            Selected recognizer language:{" "}
            <strong>{recogLang || "undefined"}</strong>.
          </P>
          {recognizers && (
            <>
              <fieldset>
                <label htmlFor="recognizer_vendor">
                  Speech Recognizer Vendor
                </label>
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
              </fieldset>
              {recogVendor && recogLang && (
                <fieldset>
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
                </fieldset>
              )}
            </>
          )}
          {message && <Message message={message} />}
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
        </form>
      </Section>
    </>
  );
};

export default ApplicationForm;
