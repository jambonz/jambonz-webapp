import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, MS } from "jambonz-ui";
import { Link, useNavigate } from "react-router-dom";

import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import { Section } from "src/components";
import {
  FileUpload,
  Selector,
  Passwd,
  AccountSelect,
} from "src/components/forms";
import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  postSpeechService,
  putSpeechService,
  useServiceProviderData,
} from "src/api";
import {
  useRegionVendors,
  vendors,
  VENDOR_AWS,
  VENDOR_GOOGLE,
  VENDOR_MICROSOFT,
  VENDOR_WELLSAID,
} from "src/vendor";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { getObscuredSecret } from "src/utils";
import { getObscuredGoogleServiceKey } from "./utils";
import { CredentialStatus } from "./status";

import type { RegionVendors, GoogleServiceKey, Vendor } from "src/vendor/types";
import type { Account, SpeechCredential, UseApiDataMap } from "src/api/types";

type SpeechServiceFormProps = {
  credential?: UseApiDataMap<SpeechCredential>;
};

export const SpeechServiceForm = ({ credential }: SpeechServiceFormProps) => {
  const navigate = useNavigate();
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const regions = useRegionVendors();
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [ttsCheck, setTtsCheck] = useState(false);
  const [sttCheck, setSttCheck] = useState(false);
  const [vendor, setVendor] = useState<Lowercase<Vendor>>(
    "" as Lowercase<Vendor>
  );
  const [region, setRegion] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [googleServiceKey, setGoogleServiceKey] =
    useState<GoogleServiceKey | null>(null);
  const [useCustomTts, setUseCustomTts] = useState(false);
  const [useCustomStt, setUseCustomStt] = useState(false);
  const [customTtsEndpoint, setCustomTtsEndpoint] = useState("");
  const [tmpCustomTtsEndpoint, setTmpCustomTtsEndpoint] = useState("");
  const [customSttEndpoint, setCustomSttEndpoint] = useState("");
  const [tmpCustomSttEndpoint, setTmpCustomSttEndpoint] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentServiceProvider) {
      const payload: Partial<SpeechCredential> = {
        vendor,
        account_sid: accountSid || null,
        service_provider_sid:
          currentServiceProvider.service_provider_sid || null,
        use_for_tts: ttsCheck ? 1 : 0,
        use_for_stt: sttCheck ? 1 : 0,
        ...(vendor === VENDOR_AWS && {
          aws_region: region || null,
        }),
        ...(vendor === VENDOR_MICROSOFT && {
          region: region || null,
          use_custom_tts: useCustomTts ? 1 : 0,
          custom_tts_endpoint: customTtsEndpoint || null,
          use_custom_stt: useCustomStt ? 1 : 0,
          custom_stt_endpoint: customSttEndpoint || null,
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
              toastSuccess("Speech credential updated successfully");
              credential.refetch();
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
          api_key:
            vendor === VENDOR_MICROSOFT || vendor === VENDOR_WELLSAID
              ? apiKey
              : null,
        })
          .then(({ json }) => {
            toastSuccess("Speech credential created successfully");
            navigate(`${ROUTE_INTERNAL_SPEECH}/${json.sid}/edit`);
          })
          .catch((error) => {
            toastError(error.msg);
          });
      }
    }
  };

  useEffect(() => {
    if (credential && credential.data) {
      if (credential.data.vendor) {
        setVendor(credential.data.vendor);
      }

      if (credential.data.account_sid) {
        setAccountSid(credential.data.account_sid);
      }

      if (credential.data.use_for_stt) {
        setSttCheck(true);
      } else {
        setSttCheck(false);
      }

      if (credential.data.use_for_tts) {
        setTtsCheck(true);
      } else {
        setTtsCheck(false);
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

      setUseCustomTts(credential.data.use_custom_tts > 0 ? true : false);
      setUseCustomStt(credential.data.use_custom_stt > 0 ? true : false);
      setCustomTtsEndpoint(credential.data.custom_tts_endpoint || "");
      setCustomSttEndpoint(credential.data.custom_stt_endpoint || "");
      setTmpCustomTtsEndpoint(credential.data.custom_tts_endpoint || "");
      setTmpCustomSttEndpoint(credential.data.custom_stt_endpoint || "");
    }
  }, [credential]);

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
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
            ].concat(vendors)}
            onChange={(e) => {
              setVendor(e.target.value as Lowercase<Vendor>);
              setRegion("");
              setApiKey("");
              setGoogleServiceKey(null);
            }}
            disabled={credential ? true : false}
            required
          />
        </fieldset>
        <fieldset>
          <AccountSelect
            accounts={accounts}
            account={[accountSid, setAccountSid]}
            required={false}
            defaultOption
            disabled={credential ? true : false}
          />
        </fieldset>
        {vendor && (
          <fieldset>
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
          </>
        )}
        {vendor === VENDOR_AWS && (
          <fieldset>
            <label htmlFor="aws_access_key">
              Access Key ID<span>*</span>
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
              Secret Access Key<span>*</span>
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
        {/* Single API key state var is used for both Microsoft and WellSaid */}
        {(vendor === VENDOR_MICROSOFT || vendor === VENDOR_WELLSAID) && (
          <fieldset>
            <label htmlFor={`${vendor}_apikey`}>
              API Key<span>*</span>
            </label>
            <Passwd
              id={`${vendor}_apikey`}
              required
              name={`${vendor}_apikey`}
              placeholder="API Key"
              value={apiKey ? getObscuredSecret(apiKey) : apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={credential ? true : false}
            />
          </fieldset>
        )}
        {/* Single region state var is used for both Microsoft and AWS */}
        {regions && regions[vendor as keyof RegionVendors] && (
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
        {vendor === VENDOR_MICROSOFT && (
          <React.Fragment>
            <fieldset>
              <label htmlFor="use_custom_tts" className="chk">
                <input
                  id="use_custom_tts"
                  name="use_custom_tts"
                  type="checkbox"
                  onChange={(e) => {
                    setUseCustomTts(e.target.checked);

                    if (e.target.checked && tmpCustomTtsEndpoint) {
                      setCustomTtsEndpoint(tmpCustomTtsEndpoint);
                    }

                    if (!e.target.checked) {
                      setTmpCustomTtsEndpoint(customTtsEndpoint);
                      setCustomTtsEndpoint("");
                    }
                  }}
                  checked={useCustomTts}
                />
                <div>Use for Custom text-to-speech</div>
              </label>
              <label htmlFor="use_custom_tts">
                Custom voice endpoint{useCustomTts && <span>*</span>}
              </label>
              <input
                id="custom_tts_endpoint"
                required={useCustomTts}
                disabled={!useCustomTts}
                type="text"
                name="custom_tts_endpoint"
                placeholder="Custom voice endpoint"
                value={customTtsEndpoint}
                onChange={(e) => setCustomTtsEndpoint(e.target.value)}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="use_custom_stt" className="chk">
                <input
                  id="use_custom_stt"
                  name="use_custom_stt"
                  type="checkbox"
                  onChange={(e) => {
                    setUseCustomStt(e.target.checked);

                    if (e.target.checked && tmpCustomSttEndpoint) {
                      setCustomSttEndpoint(tmpCustomSttEndpoint);
                    }

                    if (!e.target.checked) {
                      setTmpCustomSttEndpoint(customSttEndpoint);
                      setCustomSttEndpoint("");
                    }
                  }}
                  checked={useCustomStt}
                />
                <div>Use for Custom speech-to-text</div>
              </label>
              <label htmlFor="use_custom_stt">
                Custom speech endpoint{useCustomStt && <span>*</span>}
              </label>
              <input
                id="custom_stt_endpoint"
                required={useCustomStt}
                disabled={!useCustomStt}
                type="text"
                name="custom_stt_endpoint"
                placeholder="Custom speech endpoint"
                value={customSttEndpoint}
                onChange={(e) => setCustomSttEndpoint(e.target.value)}
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
