import React, { Fragment, useEffect, useState } from "react";
import { Button, ButtonGroup, Icon, MS, MXS } from "@jambonz/ui-kit";
import { Link, useNavigate } from "react-router-dom";

import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import { Icons, Section, Tooltip } from "src/components";
import {
  FileUpload,
  Selector,
  Passwd,
  AccountSelect,
  Checkzone,
  Message,
} from "src/components/forms";
import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  deleteGoogleCustomVoice,
  getGoogleCustomVoices,
  getSpeechSupportedLanguagesAndVoices,
  postGoogleCustomVoice,
  postSpeechService,
  putGoogleCustomVoice,
  putSpeechService,
  useServiceProviderData,
} from "src/api";
import {
  useRegionVendors,
  vendors,
  VENDOR_AWS,
  VENDOR_GOOGLE,
  VENDOR_MICROSOFT,
  VENDOR_NUANCE,
  VENDOR_WELLSAID,
  VENDOR_DEEPGRAM,
  VENDOR_IBM,
  VENDOR_NVIDIA,
  VENDOR_SONIOX,
  VENDOR_CUSTOM,
  VENDOR_COBALT,
  VENDOR_ELEVENLABS,
  VENDOR_ASSEMBLYAI,
  VENDOR_WHISPER,
} from "src/vendor";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import {
  checkSelectOptions,
  getObscuredSecret,
  isUserAccountScope,
  isNotBlank,
  hasLength,
} from "src/utils";
import { getObscuredGoogleServiceKey } from "./utils";
import { CredentialStatus } from "./status";

import type {
  RegionVendors,
  GoogleServiceKey,
  Vendor,
  Model,
} from "src/vendor/types";
import type {
  Account,
  GoogleCustomVoice,
  SpeechCredential,
  UseApiDataMap,
} from "src/api/types";
import { setAccountFilter, setLocation } from "src/store/localStore";
import {
  DEFAULT_ELEVENLABS_OPTIONS,
  DEFAULT_GOOGLE_CUSTOM_VOICES_REPORTED_USAGE,
  DISABLE_CUSTOM_SPEECH,
  GOOGLE_CUSTOM_VOICES_REPORTED_USAGE,
} from "src/api/constants";

type SpeechServiceFormProps = {
  credential?: UseApiDataMap<SpeechCredential>;
};

export const SpeechServiceForm = ({ credential }: SpeechServiceFormProps) => {
  const navigate = useNavigate();
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const regions = useRegionVendors();
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [initialTtsCheck, setInitialTtsCheck] = useState(false);
  const [ttsCheck, setTtsCheck] = useState(false);
  const [initialSttCheck, setInitialSttCheck] = useState(false);
  const [sttCheck, setSttCheck] = useState(false);
  const [vendor, setVendor] = useState<Lowercase<Vendor>>(
    "" as Lowercase<Vendor>
  );
  const [region, setRegion] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [clientId, setClientId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [googleServiceKey, setGoogleServiceKey] =
    useState<GoogleServiceKey | null>(null);
  const [sttRegion, setSttRegion] = useState("");
  const [sttApiKey, setSttApiKey] = useState("");
  const [ttsRegion, setTtsRegion] = useState("");
  const [ttsApiKey, setTtsApiKey] = useState("");
  const [ttsModelId, setTtsModelId] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [initialCheckCustomTts, setInitialCheckCustomTts] = useState(false);
  const [initialCheckCustomStt, setInitialCheckCustomStt] = useState(false);
  const [initialCheckOnpremAzureService, setInitialCheckOnpremAzureService] =
    useState(false);
  const [useCustomTts, setUseCustomTts] = useState(false);
  const [useCustomStt, setUseCustomStt] = useState(false);
  const [customTtsEndpointUrl, setCustomTtsEndpointUrl] = useState("");
  const [tmpCustomTtsEndpointUrl, setTmpCustomTtsEndpointUrl] = useState("");
  const [customTtsEndpoint, setCustomTtsEndpoint] = useState("");
  const [tmpCustomTtsEndpoint, setTmpCustomTtsEndpoint] = useState("");
  const [customSttEndpointUrl, setCustomSttEndpointUrl] = useState("");
  const [tmpCustomSttEndpointUrl, setTmpCustomSttEndpointUrl] = useState("");
  const [customSttEndpoint, setCustomSttEndpoint] = useState("");
  const [tmpCustomSttEndpoint, setTmpCustomSttEndpoint] = useState("");
  const [rivaServerUri, setRivaServerUri] = useState("");
  const [customVendorName, setCustomVendorName] = useState("");
  const [customVendorAuthToken, setCustomVendorAuthToken] = useState("");
  const [tmpCustomVendorTtsUrl, setTmpCustomVendorTtsUrl] = useState("");
  const [customVendorTtsUrl, setCustomVendorTtsUrl] = useState("");
  const [tmpCustomVendorSttUrl, setTmpCustomVendorSttUrl] = useState("");
  const [customVendorSttUrl, setCustomVendorSttUrl] = useState("");
  const [initialOnPremNuanceTtsCheck, setInitialOnPremNuanceTtsCheck] =
    useState(false);
  const [onPremNuanceTtsCheck, setOnPremNuanceTtsCheck] = useState(false);
  const [onPremNuanceTtsUrl, setOnPremNuanceTtsUrl] = useState("");
  const [tmpOnPremNuanceTtsUrl, setTmpOnPremNuanceTtsUrl] = useState("");
  const [initialOnPremNuanceSttCheck, setInitialOnPremNuanceSttCheck] =
    useState(false);
  const [onPremNuanceSttCheck, setOnPremNuanceSttCheck] = useState(false);
  const [tmpOnPremNuanceSttUrl, setTmpOnPremNuanceSttUrl] = useState("");
  const [onPremNuanceSttUrl, setOnPremNuanceSttUrl] = useState("");
  const [cobaltServerUri, setCobaltServerUri] = useState("");
  const [label, setLabel] = useState("");
  const [useCustomVoicesCheck, setUseCustomVoicesCheck] = useState(false);
  const [customVoices, setCustomVoices] = useState<GoogleCustomVoice[]>([]);
  const [customVoicesMessage, setCustomVoicesMessage] = useState("");
  const [ttsModels, setTtsModels] = useState<Model[]>([]);
  const [optionsInitialChecked, setOptionsInitialChecked] = useState(false);
  const [options, setOptions] = useState("");
  const [tmpOptions, setTmpOptions] = useState("");

  const handleFile = (file: File) => {
    const handleError = () => {
      setGoogleServiceKey(null);
      toastError("Invalid service key file, could not parse as JSON.");
    };

    file
      .text()
      .then((text) => {
        try {
          const json: GoogleServiceKey = JSON.parse(text);

          if (json.private_key && json.client_email) {
            setGoogleServiceKey(json);
          } else {
            setGoogleServiceKey(null);
          }
        } catch (error) {
          handleError();
        }
      })
      .catch(() => {
        handleError();
      });
  };

  const handlePutGoogleCustomVoices = () => {
    if (!credential || !credential.data) {
      return;
    }
    if (useCustomVoicesCheck) {
      Promise.all(
        customVoices.map((v) => {
          if (v.google_custom_voice_sid) {
            const sid = v.google_custom_voice_sid;
            delete v.google_custom_voice_sid;
            return putGoogleCustomVoice(sid, v);
          } else {
            return postGoogleCustomVoice({
              ...v,
              speech_credential_sid: credential.data?.speech_credential_sid,
            });
          }
        })
      )
        .then(() => {
          toastSuccess("Speech credential updated successfully");
          credential.refetch();
          navigate(
            `${ROUTE_INTERNAL_SPEECH}/${credential?.data?.speech_credential_sid}/edit`
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    } else if (useCustomVoicesCheck && customVoices.length > 0) {
      Promise.all(
        customVoices.map((v) => {
          if (v.google_custom_voice_sid) {
            return deleteGoogleCustomVoice(v.google_custom_voice_sid);
          }
        })
      )
        .then(() => {
          toastSuccess("Speech credential updated successfully");
          credential.refetch();
          navigate(
            `${ROUTE_INTERNAL_SPEECH}/${credential?.data?.speech_credential_sid}/edit`
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    } else {
      toastSuccess("Speech credential updated successfully");
      credential.refetch();
      navigate(
        `${ROUTE_INTERNAL_SPEECH}/${credential.data.speech_credential_sid}/edit`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUserAccountScope(accountSid, user)) {
      toastError(
        "You do not have permissions to make changes to these Speech Credentials"
      );
      return;
    }

    if (currentServiceProvider) {
      const payload: Partial<SpeechCredential> = {
        vendor,
        account_sid: accountSid || null,
        service_provider_sid: currentServiceProvider.service_provider_sid,
        use_for_tts: ttsCheck ? 1 : 0,
        use_for_stt: sttCheck ? 1 : 0,
        label: label || null,
        ...(vendor === VENDOR_AWS && {
          aws_region: region || null,
        }),
        ...(vendor === VENDOR_MICROSOFT && {
          region: region || null,
          use_custom_tts:
            useCustomTts || isNotBlank(customTtsEndpointUrl) ? 1 : 0,
          custom_tts_endpoint_url: customTtsEndpointUrl || null,
          custom_tts_endpoint: customTtsEndpoint || null,
          use_custom_stt:
            useCustomStt || isNotBlank(customSttEndpointUrl) ? 1 : 0,
          custom_stt_endpoint_url: customSttEndpointUrl || null,
          custom_stt_endpoint: customSttEndpoint || null,
        }),
        ...(vendor === VENDOR_IBM && {
          instance_id: instanceId,
          stt_api_key: sttApiKey || null,
          stt_region: sttRegion || null,
          tts_api_key: ttsApiKey || null,
          tts_region: ttsRegion || null,
        }),
        ...(vendor === VENDOR_NVIDIA && {
          riva_server_uri: rivaServerUri || null,
        }),
        ...(vendor === VENDOR_CUSTOM && {
          vendor: (vendor + ":" + customVendorName) as Lowercase<Vendor>,
          use_for_tts: ttsCheck ? 1 : 0,
          use_for_stt: sttCheck ? 1 : 0,
          custom_tts_url: customVendorTtsUrl || null,
          custom_stt_url: customVendorSttUrl || null,
          auth_token: customVendorAuthToken || null,
        }),
        ...(vendor === VENDOR_NUANCE && {
          client_id: clientId || null,
          secret: secretKey || null,
          nuance_tts_uri: onPremNuanceTtsUrl || null,
          nuance_stt_uri: onPremNuanceSttUrl || null,
        }),
        ...(vendor === VENDOR_COBALT && {
          cobalt_server_uri: cobaltServerUri || null,
        }),
        ...((vendor === VENDOR_ELEVENLABS || vendor === VENDOR_WHISPER) && {
          model_id: ttsModelId || null,
        }),
        ...(vendor === VENDOR_ELEVENLABS && {
          options: options || null,
        }),
      };

      if (credential && credential.data) {
        /** The backend API returns obscured secrets now so we need to make sure we don't send them back */
        /** Fields not sent back via :PUT are `service_key`, `access_key_id`, `secret_access_key` and `api_key`  */
        putSpeechService(
          currentServiceProvider.service_provider_sid,
          credential.data.speech_credential_sid,
          payload
        )
          .then(() => {
            if (credential && credential.data) {
              if (credential.data.vendor === VENDOR_GOOGLE) {
                handlePutGoogleCustomVoices();
              } else {
                toastSuccess("Speech credential updated successfully");
                credential.refetch();
                navigate(
                  `${ROUTE_INTERNAL_SPEECH}/${credential.data.speech_credential_sid}/edit`
                );
              }
            }
          })
          .catch((error) => {
            toastError(error.msg);
          });
      } else {
        postSpeechService(currentServiceProvider.service_provider_sid, {
          ...payload,
          service_key:
            vendor === VENDOR_GOOGLE ? JSON.stringify(googleServiceKey) : null,
          access_key_id: vendor === VENDOR_AWS ? accessKeyId : null,
          secret_access_key: vendor === VENDOR_AWS ? secretAccessKey : null,
          ...(apiKey && {
            api_key:
              vendor === VENDOR_MICROSOFT ||
              vendor === VENDOR_WELLSAID ||
              vendor === VENDOR_DEEPGRAM ||
              vendor === VENDOR_ASSEMBLYAI ||
              vendor === VENDOR_SONIOX ||
              vendor === VENDOR_ELEVENLABS ||
              vendor === VENDOR_WHISPER
                ? apiKey
                : null,
          }),
          riva_server_uri: vendor == VENDOR_NVIDIA ? rivaServerUri : null,
        })
          .then(({ json }) => {
            if (vendor === VENDOR_GOOGLE && useCustomVoicesCheck) {
              Promise.all(
                customVoices.map((v) =>
                  postGoogleCustomVoice({
                    ...v,
                    speech_credential_sid: json.sid,
                  })
                )
              ).then(() => {
                toastSuccess("Speech credential created successfully");
                navigate(ROUTE_INTERNAL_SPEECH);
                setAccountFilter(accountSid);
              });
            } else {
              toastSuccess("Speech credential created successfully");
              navigate(ROUTE_INTERNAL_SPEECH);
              setAccountFilter(accountSid);
            }
          })
          .catch((error) => {
            toastError(error.msg);
          });
      }
    }
  };

  useEffect(() => {
    if (vendor === VENDOR_ELEVENLABS || vendor === VENDOR_WHISPER) {
      getSpeechSupportedLanguagesAndVoices(
        currentServiceProvider?.service_provider_sid,
        vendor,
        ""
      ).then(({ json }) => {
        if (json.models) {
          setTtsModels(json.models);
          if (
            json.models.length > 0 &&
            (vendor === VENDOR_ELEVENLABS || vendor === VENDOR_WHISPER)
          ) {
            setTtsModelId(json.models[0].value);
          }
        }
      });
    } else {
      setTtsModels([]);
    }
  }, [vendor]);

  useEffect(() => {
    setLocation();
    if (credential && credential.data) {
      if (credential.data.vendor) {
        const v = credential.data.vendor.startsWith(VENDOR_CUSTOM)
          ? VENDOR_CUSTOM
          : credential.data.vendor;
        setVendor(v);
      }

      if (credential.data.account_sid) {
        setAccountSid(credential.data.account_sid);
      }

      if (credential.data.use_for_stt) {
        setSttCheck(true);
        setInitialSttCheck(true);
      } else {
        setSttCheck(false);
        setInitialSttCheck(false);
      }

      if (credential.data.use_for_tts) {
        setTtsCheck(true);
        setInitialTtsCheck(true);
      } else {
        setTtsCheck(false);
        setInitialTtsCheck(false);
      }

      if (credential.data.service_key) {
        setGoogleServiceKey(JSON.parse(credential.data.service_key));
      }

      if (credential.data.access_key_id) {
        setAccessKeyId(credential.data.access_key_id);
      }

      if (credential.data.secret_access_key) {
        setSecretAccessKey(credential.data.secret_access_key);
      }

      if (credential.data.api_key) {
        setApiKey(credential.data.api_key);
      }

      if (credential.data.region) {
        setRegion(credential.data.region);
      }

      if (credential.data.aws_region) {
        setRegion(credential.data.aws_region);
      }

      if (credential.data.client_id) {
        setClientId(credential.data.client_id);
      }

      if (credential.data.secret) {
        setSecretKey(credential.data.secret);
      }

      if (credential.data.nuance_tts_uri) {
        setOnPremNuanceTtsUrl(credential.data.nuance_tts_uri);
        setInitialOnPremNuanceTtsCheck(true);
        setOnPremNuanceTtsCheck(true);
      } else {
        setInitialOnPremNuanceTtsCheck(false);
        setOnPremNuanceTtsCheck(false);
      }

      if (credential.data.nuance_stt_uri) {
        setOnPremNuanceSttUrl(credential.data.nuance_stt_uri);
        setInitialOnPremNuanceSttCheck(true);
        setOnPremNuanceSttCheck(true);
      } else {
        setInitialOnPremNuanceSttCheck(false);
        setOnPremNuanceSttCheck(false);
      }

      if (credential.data.tts_api_key) {
        setTtsApiKey(credential.data.tts_api_key);
      }

      if (credential.data.tts_region) {
        setTtsRegion(credential.data.tts_region);
      }

      if (credential.data.stt_api_key) {
        setSttApiKey(credential.data.stt_api_key);
      }

      if (credential.data.stt_region) {
        setSttRegion(credential.data.stt_region);
      }

      if (credential.data.instance_id) {
        setInstanceId(credential.data.instance_id);
      }

      if (credential.data.riva_server_uri) {
        setRivaServerUri(credential.data.riva_server_uri);
      }
      setUseCustomTts(credential.data.use_custom_tts > 0 ? true : false);
      setUseCustomStt(credential.data.use_custom_stt > 0 ? true : false);

      setCustomTtsEndpointUrl(credential.data.custom_tts_endpoint_url || "");
      setCustomSttEndpointUrl(credential.data.custom_stt_endpoint_url || "");
      setTmpCustomTtsEndpointUrl(credential.data.custom_tts_endpoint_url || "");
      setTmpCustomSttEndpointUrl(credential.data.custom_stt_endpoint_url || "");

      setCustomTtsEndpoint(credential.data.custom_tts_endpoint || "");
      setCustomSttEndpoint(credential.data.custom_stt_endpoint || "");
      setTmpCustomTtsEndpoint(credential.data.custom_tts_endpoint || "");
      setTmpCustomSttEndpoint(credential.data.custom_stt_endpoint || "");

      setInitialCheckCustomTts(isNotBlank(credential.data.custom_tts_endpoint));
      setInitialCheckCustomStt(isNotBlank(credential.data.custom_stt_endpoint));
      setInitialCheckOnpremAzureService(
        isNotBlank(credential.data.custom_tts_endpoint_url) ||
          isNotBlank(credential.data.custom_stt_endpoint_url)
      );

      setCustomVendorName(
        credential.data.vendor.startsWith(VENDOR_CUSTOM)
          ? credential.data.vendor.substring(VENDOR_CUSTOM.length + 1)
          : credential.data.vendor
      );
      setCustomVendorAuthToken(credential.data.auth_token || "");
      setCustomVendorSttUrl(credential.data.custom_stt_url || "");
      setTmpCustomVendorSttUrl(credential.data.custom_stt_url || "");
      setCustomVendorTtsUrl(credential.data.custom_tts_url || "");
      setTmpCustomVendorTtsUrl(credential.data.custom_tts_url || "");
      if (credential.data.label) {
        setLabel(credential.data.label);
      }
      if (credential.data.cobalt_server_uri) {
        setCobaltServerUri(credential.data.cobalt_server_uri);
      }
      if (credential.data.model_id) {
        setTtsModelId(credential.data.model_id);
      }
    }
    if (credential?.data?.options) {
      setOptions(credential.data.options);
      setOptionsInitialChecked(true);
    }
    if (credential?.data?.vendor === VENDOR_GOOGLE) {
      // let try to check if there is custom voices
      getGoogleCustomVoices({
        speech_credential_sid: credential.data.speech_credential_sid,
      }).then(({ json }) => {
        setCustomVoices(json);
        setUseCustomVoicesCheck(json.length > 0);
      });
    }
  }, [credential]);

  const updateCustomVoices = (
    index: number,
    key: string,
    value: typeof customVoices[number][keyof GoogleCustomVoice]
  ) => {
    setCustomVoices((prev) =>
      prev.map((g, i) =>
        i === index
          ? {
              ...g,
              [key]: value,
            }
          : g
      )
    );
  };

  return (
    <Section slim>
      <form
        className={`form form--internal ${
          !credential?.data && credential?.refetch ? "form--blur" : ""
        }`}
        onSubmit={handleSubmit}
      >
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        {credential && credential.data && (
          <fieldset>
            <div className="m med">Credential status</div>
            <CredentialStatus cred={credential.data} showSummary />
          </fieldset>
        )}
        <fieldset>
          <label htmlFor="vendor">
            Vendor<span>*</span>
          </label>
          <Selector
            id="vendor"
            name="vendor"
            value={vendor}
            options={[
              {
                name: "Select a vendor",
                value: "",
              },
            ]
              .concat(vendors)
              .filter(
                (v) => !DISABLE_CUSTOM_SPEECH || v.value !== VENDOR_CUSTOM
              )}
            onChange={(e) => {
              setVendor(e.target.value as Lowercase<Vendor>);
              setRegion("");
              setApiKey("");
              setGoogleServiceKey(null);
            }}
            disabled={credential ? true : false}
            required
          />
          {vendor === VENDOR_CUSTOM && (
            <>
              <label htmlFor="custom_vendor_name">
                Name<span>*</span>
              </label>
              <input
                id="custom_vendor_name"
                required
                type="text"
                name="custom_vendor_name"
                placeholder="Vendor Name"
                value={customVendorName}
                onChange={(e) => setCustomVendorName(e.target.value)}
                disabled={credential ? true : false}
              />
            </>
          )}
        </fieldset>
        <fieldset>
          <AccountSelect
            accounts={accounts}
            account={[accountSid, setAccountSid]}
            required={false}
            defaultOption={checkSelectOptions(user, credential?.data)}
            disabled={credential ? true : false}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="speech_label">
            Label
            <Tooltip text="Assign a label only if you need to create multiple speech services from the same vendor. Then use the label in your application to specify which service to use.">
              {" "}
            </Tooltip>
          </label>
          <input
            id="speech_label"
            type="text"
            name="speech_label"
            value={label}
            disabled={credential ? true : false}
            onChange={(e) => setLabel(e.target.value)}
          />
        </fieldset>
        {vendor && (
          <fieldset>
            {vendor !== VENDOR_ASSEMBLYAI &&
              vendor !== VENDOR_COBALT &&
              vendor !== VENDOR_SONIOX &&
              vendor != VENDOR_CUSTOM && (
                <label htmlFor="use_for_tts" className="chk">
                  <input
                    id="use_for_tts"
                    name="use_for_tts"
                    type="checkbox"
                    onChange={(e) => setTtsCheck(e.target.checked)}
                    defaultChecked={ttsCheck}
                  />
                  <div>Use for text-to-speech</div>
                </label>
              )}
            {vendor !== VENDOR_WELLSAID &&
              vendor !== VENDOR_CUSTOM &&
              vendor !== VENDOR_WHISPER &&
              vendor !== VENDOR_ELEVENLABS && (
                <label htmlFor="use_for_stt" className="chk">
                  <input
                    id="use_for_stt"
                    name="use_for_stt"
                    type="checkbox"
                    onChange={(e) => setSttCheck(e.target.checked)}
                    defaultChecked={sttCheck}
                  />
                  <div>Use for speech-to-text</div>
                </label>
              )}
            {vendor === VENDOR_CUSTOM && (
              <Fragment>
                <Checkzone
                  hidden
                  name="custom_vendor_use_for_tts"
                  label="Use for text-to-speech"
                  initialCheck={initialTtsCheck}
                  handleChecked={(e) => {
                    setTtsCheck(e.target.checked);
                    if (!e.target.checked) {
                      setTmpCustomVendorTtsUrl(customVendorTtsUrl);
                      setCustomVendorTtsUrl("");
                    } else {
                      setCustomVendorTtsUrl(tmpCustomVendorTtsUrl);
                    }
                  }}
                >
                  <label htmlFor="custom_vendor_use_for_tts">
                    TTS HTTP URL<span>*</span>
                  </label>
                  <input
                    id="custom_vendor_use_for_tts"
                    type="text"
                    name="custom_vendor_use_for_tts"
                    placeholder="Required"
                    required={ttsCheck}
                    value={customVendorTtsUrl}
                    onChange={(e) => {
                      setCustomVendorTtsUrl(e.target.value);
                    }}
                  />
                </Checkzone>

                <Checkzone
                  hidden
                  name="custom_vendor_use_for_stt"
                  label="Use for speech-to-text"
                  initialCheck={initialSttCheck}
                  handleChecked={(e) => {
                    setSttCheck(e.target.checked);
                    if (!e.target.checked) {
                      setTmpCustomVendorSttUrl(customVendorSttUrl);
                      setCustomVendorSttUrl("");
                    } else {
                      setCustomVendorSttUrl(tmpCustomVendorSttUrl);
                    }
                  }}
                >
                  <label htmlFor="custom_vendor_use_for_stt">
                    STT websocket URL<span>*</span>
                  </label>
                  <input
                    id="custom_vendor_use_for_stt"
                    type="text"
                    name="custom_vendor_use_for_stt"
                    placeholder="Required"
                    required={sttCheck}
                    value={customVendorSttUrl}
                    onChange={(e) => {
                      setCustomVendorSttUrl(e.target.value);
                    }}
                  />
                </Checkzone>
              </Fragment>
            )}
          </fieldset>
        )}
        {vendor === VENDOR_COBALT && (
          <fieldset>
            <label htmlFor="cobalt_server_url">
              Server URI<span>*</span>
            </label>
            <input
              id="cobalt_server_url"
              type="text"
              name="cobalt_server_url"
              placeholder="Required"
              required
              value={cobaltServerUri}
              onChange={(e) => {
                setCobaltServerUri(e.target.value);
              }}
            />
          </fieldset>
        )}
        {vendor === VENDOR_CUSTOM && (
          <fieldset>
            <label htmlFor="custom_vendor_auth_token">
              Authentication Token
            </label>
            <input
              id="custom_vendor_auth_token"
              type="text"
              name="custom_vendor_auth_token"
              placeholder="Authentication Token"
              value={customVendorAuthToken}
              onChange={(e) => setCustomVendorAuthToken(e.target.value)}
              disabled={credential ? true : false}
            />
          </fieldset>
        )}
        {vendor === VENDOR_GOOGLE && (
          <>
            {!googleServiceKey && (
              <fieldset>
                <label htmlFor="google_service_key">
                  Service key<span>*</span>
                </label>
                <FileUpload
                  id="google_service_key"
                  name="google_service_key"
                  handleFile={handleFile}
                  disabled={credential ? true : false}
                  required
                />
              </fieldset>
            )}
            {googleServiceKey && (
              <fieldset>
                <pre>
                  <code>
                    {JSON.stringify(
                      getObscuredGoogleServiceKey(googleServiceKey),
                      null,
                      2
                    )}
                  </code>
                </pre>
              </fieldset>
            )}
            {ttsCheck && vendor === VENDOR_GOOGLE && (
              <fieldset>
                <label htmlFor="use_custom_voice" className="chk">
                  <input
                    id="use_custom_voice"
                    name="use_custom_voice"
                    type="checkbox"
                    onChange={(e) => {
                      if (customVoices.length === 0) {
                        setCustomVoices([
                          {
                            name: "",
                            reported_usage:
                              DEFAULT_GOOGLE_CUSTOM_VOICES_REPORTED_USAGE,
                            model: "",
                          },
                        ]);
                      }
                      setUseCustomVoicesCheck(e.target.checked);
                    }}
                    checked={useCustomVoicesCheck}
                  />
                  <div>Use custom voices</div>
                </label>
                {useCustomVoicesCheck && (
                  <fieldset>
                    <label htmlFor="sip_gateways">Custom Voices</label>
                    <MXS>
                      <em>At least one Custom voice is required.</em>
                    </MXS>
                    {customVoicesMessage && (
                      <Message message={customVoicesMessage} />
                    )}
                    {hasLength(customVoices) &&
                      customVoices.map((v, i) => (
                        <div key={`custom_voice_${i}`} className="customVoice">
                          <div>
                            <div>
                              <label htmlFor="custom_voice_name">
                                Name / Reported Usage
                              </label>
                            </div>
                          </div>

                          <div>
                            <div>
                              <input
                                id={`sip_ip_${i}`}
                                name={`sip_ip_${i}`}
                                type="text"
                                placeholder="Assigned Name"
                                required
                                value={v.name}
                                onChange={(e) => {
                                  updateCustomVoices(i, "name", e.target.value);
                                }}
                              />
                            </div>

                            <div>
                              <Selector
                                id={"google_custom_voices_reported_usage"}
                                name={"google_custom_voices_reported_usage"}
                                value={v.reported_usage}
                                options={GOOGLE_CUSTOM_VOICES_REPORTED_USAGE}
                                onChange={(e) => {
                                  updateCustomVoices(
                                    i,
                                    "reported_usage",
                                    e.target.value
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div>
                              <label htmlFor="custom_voice_name">Model</label>
                            </div>
                          </div>

                          <div>
                            <div>
                              <input
                                id={`sip_ip_${i}`}
                                name={`sip_ip_${i}`}
                                type="text"
                                placeholder="Model"
                                required
                                value={v.model}
                                style={{ maxWidth: "100%" }}
                                onChange={(e) => {
                                  updateCustomVoices(
                                    i,
                                    "model",
                                    e.target.value
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <button
                            className="btnty"
                            title="Delete custom voice"
                            type="button"
                            onClick={() => {
                              setCustomVoicesMessage("");
                              if (customVoices.length === 1) {
                                setCustomVoicesMessage(
                                  "You must provide at least one custom voice."
                                );
                                return;
                              }
                              if (v.google_custom_voice_sid) {
                                deleteGoogleCustomVoice(
                                  v.google_custom_voice_sid
                                ).finally(() => {
                                  credential?.refetch();
                                });
                              }
                              setCustomVoices((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              );
                            }}
                          >
                            <Icon>
                              <Icons.Trash2 />
                            </Icon>
                          </button>
                        </div>
                      ))}
                    <ButtonGroup left>
                      <button
                        className="btnty"
                        type="button"
                        title="Add Voice"
                        onClick={() => {
                          setCustomVoicesMessage("");
                          setCustomVoices((prev) => [
                            ...prev,
                            {
                              name: "",
                              reported_usage:
                                DEFAULT_GOOGLE_CUSTOM_VOICES_REPORTED_USAGE,
                              model: "",
                            },
                          ]);
                        }}
                      >
                        <Icon subStyle="teal">
                          <Icons.Plus />
                        </Icon>
                      </button>
                    </ButtonGroup>
                  </fieldset>
                )}
              </fieldset>
            )}
          </>
        )}
        {vendor === VENDOR_NUANCE && (
          <>
            <fieldset>
              <label htmlFor="nuance_client_id">
                Client ID
                {!onPremNuanceSttCheck && !onPremNuanceTtsCheck && (
                  <span>*</span>
                )}
              </label>
              <input
                id="nuance_client_id"
                required={!onPremNuanceSttCheck && !onPremNuanceTtsCheck}
                type="text"
                name="nuance_client_id"
                placeholder="Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={credential ? true : false}
              />
              <label htmlFor="nuance_secret">
                Secret
                {!onPremNuanceSttCheck && !onPremNuanceTtsCheck && (
                  <span>*</span>
                )}
              </label>
              <Passwd
                id="nuance_secret"
                required={!onPremNuanceSttCheck && !onPremNuanceTtsCheck}
                name="nuance_secret"
                placeholder="Secret Key"
                value={secretKey ? getObscuredSecret(secretKey) : secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                disabled={credential ? true : false}
              />
            </fieldset>
            <fieldset>
              <>
                <Checkzone
                  hidden
                  name="on_prem_nuance_use_tts"
                  label="Use on-prem TTS"
                  initialCheck={initialOnPremNuanceTtsCheck}
                  handleChecked={(e) => {
                    setOnPremNuanceTtsCheck(e.target.checked);
                    if (!e.target.checked) {
                      setTmpOnPremNuanceTtsUrl(onPremNuanceTtsUrl);
                      setOnPremNuanceTtsUrl("");
                    } else {
                      setOnPremNuanceTtsUrl(tmpOnPremNuanceTtsUrl);
                    }
                  }}
                >
                  <label htmlFor="on_prem_nuance_use_tts">
                    TTS URI<span>*</span>
                  </label>
                  <input
                    id="on_prem_nuance_use_tts"
                    type="text"
                    name="on_prem_nuance_use_tts"
                    placeholder="ip:port"
                    pattern="(.*):([0-9]{0,6}$)"
                    required={onPremNuanceTtsCheck}
                    value={onPremNuanceTtsUrl}
                    onChange={(e) => {
                      setOnPremNuanceTtsUrl(e.target.value);
                    }}
                  />
                </Checkzone>

                <Checkzone
                  hidden
                  name="on_prem_nuance_use_stt"
                  label="Use on-prem STT"
                  initialCheck={initialOnPremNuanceSttCheck}
                  handleChecked={(e) => {
                    setOnPremNuanceSttCheck(e.target.checked);
                    if (!e.target.checked) {
                      setTmpOnPremNuanceSttUrl(onPremNuanceSttUrl);
                      setOnPremNuanceSttUrl("");
                    } else {
                      setOnPremNuanceSttUrl(tmpOnPremNuanceSttUrl);
                    }
                  }}
                >
                  <label htmlFor="on_prem_nuance_use_stt_lb">
                    STT URI<span>*</span>
                  </label>
                  <input
                    id="on_prem_nuance_use_stt"
                    type="text"
                    name="on_prem_nuance_use_stt"
                    placeholder="ip:port"
                    pattern="(.*):([0-9]{0,6}$)"
                    required={onPremNuanceSttCheck}
                    value={onPremNuanceSttUrl}
                    onChange={(e) => {
                      setOnPremNuanceSttUrl(e.target.value);
                    }}
                  />
                </Checkzone>
              </>
            </fieldset>
          </>
        )}
        {vendor === VENDOR_AWS && (
          <fieldset>
            <label htmlFor="aws_access_key">
              Access key ID<span>*</span>
            </label>
            <input
              id="aws_access_key"
              required
              type="text"
              name="aws_access_key"
              placeholder="Access Key ID"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              disabled={credential ? true : false}
            />
            <label htmlFor="aws_secret_key">
              Secret access key<span>*</span>
            </label>
            <Passwd
              id="aws_secret_key"
              required
              name="aws_secret_key"
              placeholder="Secret Access Key"
              value={
                secretAccessKey
                  ? getObscuredSecret(secretAccessKey)
                  : secretAccessKey
              }
              onChange={(e) => setSecretAccessKey(e.target.value)}
              disabled={credential ? true : false}
            />
          </fieldset>
        )}
        {(vendor === VENDOR_WELLSAID ||
          vendor === VENDOR_DEEPGRAM ||
          vendor === VENDOR_ASSEMBLYAI ||
          vendor == VENDOR_ELEVENLABS ||
          vendor === VENDOR_WHISPER ||
          vendor === VENDOR_SONIOX) && (
          <fieldset>
            <label htmlFor={`${vendor}_apikey`}>
              API key<span>*</span>
            </label>
            <Passwd
              id={`${vendor}_apikey`}
              required
              name={`${vendor}_apikey`}
              placeholder="API key"
              value={apiKey ? getObscuredSecret(apiKey) : apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={credential ? true : false}
            />
          </fieldset>
        )}
        {(vendor == VENDOR_ELEVENLABS || vendor == VENDOR_WHISPER) &&
          ttsModels.length > 0 && (
            <fieldset>
              <label htmlFor={`${vendor}_tts_model_id`}>Model</label>
              <Selector
                id={"tts_model_id"}
                name={"tts_model_id"}
                value={ttsModelId}
                options={ttsModels}
                onChange={(e) => {
                  setTtsModelId(e.target.value);
                }}
              />
            </fieldset>
          )}
        {vendor === VENDOR_ELEVENLABS && (
          <fieldset>
            <Checkzone
              hidden
              name="cz_speech_credential_options"
              label="Extra Options"
              initialCheck={optionsInitialChecked}
              handleChecked={(e) => {
                if (e.target.checked) {
                  setOptions(
                    tmpOptions
                      ? tmpOptions
                      : JSON.stringify(DEFAULT_ELEVENLABS_OPTIONS, null, 2)
                  );
                }
                if (!e.target.checked) {
                  setTmpOptions(options);
                  setOptions("");
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center", // Align items vertically in the center
                  }}
                >
                  <a
                    href="https://elevenlabs.io/docs/api-reference/streaming"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: "10px", fontSize: "16px" }}
                  >
                    Docs
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (options) {
                        setOptions((prev) => {
                          try {
                            return JSON.stringify(JSON.parse(options), null, 2);
                          } catch (err) {
                            return prev;
                          }
                        });
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "green",
                      fontSize: "16px",
                    }}
                  >
                    Beautify
                  </button>
                </div>

                <textarea
                  id="input_speech_credential_options"
                  name="speech_credential_options"
                  rows={6}
                  cols={55}
                  placeholder="extra options in Json"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                />
              </div>
            </Checkzone>
          </fieldset>
        )}
        {regions &&
          regions[vendor as keyof RegionVendors] &&
          vendor !== VENDOR_IBM &&
          vendor !== VENDOR_MICROSOFT && (
            <fieldset>
              <label htmlFor="region">
                Region<span>*</span>
              </label>
              <Selector
                id="region"
                name="region"
                value={region}
                required
                options={[
                  {
                    name: "Select a region",
                    value: "",
                  },
                ].concat(regions[vendor as keyof RegionVendors])}
                onChange={(e) => setRegion(e.target.value)}
              />
            </fieldset>
          )}
        {vendor === VENDOR_IBM &&
          regions &&
          regions[vendor as keyof RegionVendors] && (
            <fieldset>
              <label htmlFor="tts_region">
                TTS region {ttsCheck && <span>*</span>}
              </label>
              <Selector
                id="tts_region"
                name="tts_region"
                value={ttsRegion}
                required={ttsCheck}
                options={[
                  {
                    name: "Select a region",
                    value: "",
                  },
                ].concat(regions[vendor as keyof RegionVendors])}
                onChange={(e) => setTtsRegion(e.target.value)}
              />
              <label htmlFor={`${vendor}_tts_apikey`}>
                TTS API key {ttsCheck && <span>*</span>}
              </label>
              <Passwd
                id={`${vendor}_tts_apikey`}
                required={ttsCheck}
                name={`${vendor}_tts_apikey`}
                placeholder="TTS API key"
                value={ttsApiKey ? getObscuredSecret(ttsApiKey) : ttsApiKey}
                onChange={(e) => setTtsApiKey(e.target.value)}
                disabled={credential ? true : false}
              />
              <label htmlFor="stt_region">
                STT region {sttCheck && <span>*</span>}
              </label>
              <Selector
                id="stt_region"
                name="stt_region"
                value={sttRegion}
                required={sttCheck}
                options={[
                  {
                    name: "Select a region",
                    value: "",
                  },
                ].concat(regions[vendor as keyof RegionVendors])}
                onChange={(e) => setSttRegion(e.target.value)}
              />
              <label htmlFor={`${vendor}_sst_apikey`}>
                SST API key {sttCheck && <span>*</span>}
              </label>
              <Passwd
                id={`${vendor}_stt_apikey`}
                required={sttCheck}
                name={`${vendor}_stt_apikey`}
                placeholder="STT API key"
                value={sttApiKey ? getObscuredSecret(sttApiKey) : sttApiKey}
                onChange={(e) => setSttApiKey(e.target.value)}
                disabled={credential ? true : false}
              />
              <label htmlFor="instance_id">
                Speech instance ID {sttCheck && <span>*</span>}
              </label>
              <input
                id="instance_id"
                required={sttCheck}
                type="text"
                name="instance_id"
                placeholder="Instance ID"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
              />
            </fieldset>
          )}
        {vendor === VENDOR_MICROSOFT && (
          <React.Fragment>
            <fieldset>
              <Checkzone
                hidden
                name="use_hosted_azure_service"
                label="Use hosted Azure service"
                initialCheck={!initialCheckOnpremAzureService}
                handleChecked={(e) => {
                  setInitialCheckOnpremAzureService(!e.target.checked);
                }}
              >
                {regions && (
                  <>
                    <label htmlFor="region">
                      Region<span>*</span>
                    </label>
                    <Selector
                      id="region"
                      name="region"
                      value={region}
                      required
                      options={[
                        {
                          name: "Select a region",
                          value: "",
                        },
                      ].concat(regions[vendor as keyof RegionVendors])}
                      onChange={(e) => setRegion(e.target.value)}
                    />
                  </>
                )}
                <label htmlFor={`${vendor}_apikey`}>
                  API key<span>*</span>
                </label>
                <Passwd
                  id={`${vendor}_apikey`}
                  required
                  name={`${vendor}_apikey`}
                  placeholder="API key"
                  value={apiKey ? getObscuredSecret(apiKey) : apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={credential ? true : false}
                />
              </Checkzone>

              <Checkzone
                hidden
                name="use_azure_docker_container_on_prem"
                label="Use Azure Docker container (on-prem)"
                initialCheck={initialCheckOnpremAzureService}
                handleChecked={(e) => {
                  setInitialCheckOnpremAzureService(e.target.checked);

                  if (e.target.checked && tmpCustomTtsEndpointUrl) {
                    setCustomTtsEndpointUrl(tmpCustomTtsEndpointUrl);
                  }

                  if (!e.target.checked) {
                    setTmpCustomTtsEndpointUrl(customTtsEndpointUrl);
                    setCustomTtsEndpointUrl("");
                  }

                  if (e.target.checked && tmpCustomSttEndpointUrl) {
                    setCustomSttEndpointUrl(tmpCustomSttEndpointUrl);
                  }

                  if (!e.target.checked) {
                    setTmpCustomSttEndpointUrl(customSttEndpointUrl);
                    setCustomSttEndpointUrl("");
                  }
                }}
              >
                <label htmlFor="container_url_for_tts">
                  Container URL for TTS<span>*</span>
                </label>
                <input
                  id="container_url_for_tts"
                  required
                  type="text"
                  name="container_url_for_tts"
                  placeholder="Container URL for TTS"
                  value={customTtsEndpointUrl}
                  onChange={(e) => setCustomTtsEndpointUrl(e.target.value)}
                />
                <label htmlFor="container_url_for_stt">
                  Container URL for STT<span>*</span>
                </label>
                <input
                  id="container_url_for_stt"
                  required
                  type="text"
                  name="container_url_for_stt"
                  placeholder="Container URL for STT"
                  value={customSttEndpointUrl}
                  onChange={(e) => setCustomSttEndpointUrl(e.target.value)}
                />
                <label htmlFor={`${vendor}_apikey`}>
                  Subscription key (if required)
                </label>
                <Passwd
                  id={`${vendor}_apikey`}
                  name={`${vendor}_apikey`}
                  placeholder="API key"
                  value={apiKey ? getObscuredSecret(apiKey) : apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={credential ? true : false}
                />
              </Checkzone>
            </fieldset>
            <fieldset>
              <Checkzone
                hidden
                name="use_custom_tts_endpoint_id"
                label="I want to use a custom voice for TTS"
                initialCheck={initialCheckCustomTts}
                handleChecked={(e) => {
                  setUseCustomTts(e.target.checked);

                  if (e.target.checked && tmpCustomTtsEndpoint) {
                    setCustomTtsEndpoint(tmpCustomTtsEndpoint);
                  }

                  if (!e.target.checked) {
                    setTmpCustomTtsEndpoint(customTtsEndpoint);
                    setCustomTtsEndpoint("");
                  }
                }}
              >
                <label htmlFor="use_custom_tts_id">
                  Custom voice deployment ID<span>*</span>
                  <Tooltip text="This is the value shown as the deploymentId parameter in the custom URL generated when you deploy a custom voice">
                    {" "}
                  </Tooltip>
                </label>
                <input
                  id="custom_tts_endpoint_id"
                  required
                  disabled={initialCheckOnpremAzureService}
                  type="text"
                  name="custom_tts_endpoint_id"
                  placeholder="Custom voice endpoint id"
                  value={customTtsEndpoint}
                  onChange={(e) => setCustomTtsEndpoint(e.target.value)}
                />
              </Checkzone>
              <Checkzone
                hidden
                name="use_custom_stt_endpoint_id"
                label="I want to use a custom speech model for STT"
                initialCheck={initialCheckCustomStt}
                handleChecked={(e) => {
                  setUseCustomStt(e.target.checked);

                  if (e.target.checked && tmpCustomSttEndpoint) {
                    setCustomSttEndpoint(tmpCustomSttEndpoint);
                  }

                  if (!e.target.checked) {
                    setTmpCustomSttEndpoint(customSttEndpoint);
                    setCustomSttEndpoint("");
                  }
                }}
              >
                <label htmlFor="use_custom_stt_id">
                  Custom speech endpoint ID<span>*</span>
                  <Tooltip text="This is the value shown as the Endpoint ID when you deploy a custom speech model">
                    {" "}
                  </Tooltip>
                </label>
                <input
                  id="custom_stt_endpoint_id"
                  required={useCustomStt}
                  disabled={initialCheckOnpremAzureService}
                  type="text"
                  name="custom_stt_endpoint_id"
                  placeholder="Custom speech endpoint ID"
                  value={customSttEndpoint}
                  onChange={(e) => setCustomSttEndpoint(e.target.value)}
                />
              </Checkzone>
            </fieldset>
          </React.Fragment>
        )}
        {vendor === VENDOR_NVIDIA && (
          <React.Fragment>
            <fieldset>
              <label htmlFor="riva_server_uri">
                Riva Server Uri<span>*</span>
              </label>
              <input
                id="riva_server_uri"
                type="text"
                name="riva_server_uri"
                placeholder="Riva Server Uri"
                value={rivaServerUri}
                onChange={(e) => setRivaServerUri(e.target.value)}
              />
            </fieldset>
          </React.Fragment>
        )}

        <fieldset>
          <ButtonGroup left>
            <Button small subStyle="grey" as={Link} to={ROUTE_INTERNAL_SPEECH}>
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
