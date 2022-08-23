import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, MS } from "jambonz-ui";
import { Link, useNavigate } from "react-router-dom";

import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import { Section } from "src/components";
import { FileUpload, Selector } from "src/components/forms";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { postSpeechService, putSpeechService } from "src/api";
import {
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

import type { RegionVendors, GoogleServiceKey } from "src/vendor/types";
import type { Account, SpeechCredential, FetchError } from "src/api/types";

export type UseCredentialData = {
  data: SpeechCredential | null;
  error: FetchError | null;
  refetch: () => void;
};

type SpeechServiceFormProps = {
  credential?: UseCredentialData;
  accounts: null | Account[];
};

export const SpeechServiceForm = ({
  accounts,
  credential,
}: SpeechServiceFormProps) => {
  const navigate = useNavigate();
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accountSid, setAccountSid] = useState("");
  const [ttsCheck, setTtsCheck] = useState(false);
  const [sttCheck, setSttCheck] = useState(false);
  const [vendor, setVendor] = useState("");
  const [region, setRegion] = useState("");
  const [regions, setRegions] = useState<RegionVendors | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [googleServiceKey, setGoogleServiceKey] =
    useState<GoogleServiceKey | null>(null);

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
      const payload = {
        vendor,
        account_sid: accountSid || null,
        service_provider_sid:
          currentServiceProvider.service_provider_sid || null,
        use_for_tts: ttsCheck ? 1 : 0,
        use_for_stt: sttCheck ? 1 : 0,
        service_key:
          vendor === VENDOR_GOOGLE ? JSON.stringify(googleServiceKey) : null,
        access_key_id: vendor === VENDOR_AWS ? accessKeyId : null,
        secret_access_key: vendor === VENDOR_AWS ? secretAccessKey : null,
        aws_region: vendor === VENDOR_AWS ? region : null,
        api_key:
          vendor === VENDOR_MICROSOFT || vendor === VENDOR_WELLSAID
            ? apiKey
            : null,
        region: vendor === VENDOR_MICROSOFT ? region : null,
      };

      if (credential && credential.data) {
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
        postSpeechService(currentServiceProvider.service_provider_sid, payload)
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
    }
  }, [credential]);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      import("src/vendor/regions/aws-regions"),
      import("src/vendor/regions/ms-azure-regions"),
    ]).then(([{ default: awsRegions }, { default: msRegions }]) => {
      if (!ignore) {
        setRegions({
          aws: awsRegions,
          microsoft: msRegions,
        });
      }
    });

    return function cleanup() {
      ignore = true;
    };
  }, []);

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        {credential && credential.data && (
          <fieldset>
            <div className="m med">Credential status</div>
            <CredentialStatus
              cred={credential.data}
              serviceProvider={currentServiceProvider}
            />
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
              setVendor(e.target.value);
              setRegion("");
              setApiKey("");
              setGoogleServiceKey(null);
            }}
            disabled={credential ? true : false}
          />
        </fieldset>
        {accounts && (
          <fieldset>
            <label htmlFor="account_name">Account</label>
            <Selector
              id="account_name"
              name="account_name"
              value={accountSid}
              options={[
                {
                  name: "All accounts",
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
            <fieldset>
              <label htmlFor="google_service_key">
                Service key<span>*</span>
              </label>
              <FileUpload
                id="google_service_key"
                name="google_service_key"
                required={!googleServiceKey}
                handleFile={handleFile}
              />
            </fieldset>
            {googleServiceKey && (
              <fieldset>
                <pre>
                  {JSON.stringify(
                    getObscuredGoogleServiceKey(googleServiceKey),
                    null,
                    2
                  )}
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
            />
            <label htmlFor="aws_secret_key">
              Secret Access Key<span>*</span>
            </label>
            <input
              id="aws_secret_key"
              required
              type="text"
              name="aws_secret_key"
              placeholder="Secret Access Key"
              value={
                secretAccessKey
                  ? getObscuredSecret(secretAccessKey)
                  : secretAccessKey
              }
              onChange={(e) => setSecretAccessKey(e.target.value)}
            />
          </fieldset>
        )}
        {/* Single API key state var is used for both Microsoft and WellSaid */}
        {(vendor === VENDOR_MICROSOFT || vendor === VENDOR_WELLSAID) && (
          <fieldset>
            <label htmlFor={`${vendor}_apikey`}>
              API Key<span>*</span>
            </label>
            <input
              id={`${vendor}_apikey`}
              required
              type="text"
              name={`${vendor}_apikey`}
              placeholder="API Key"
              value={apiKey ? getObscuredSecret(apiKey) : apiKey}
              onChange={(e) => setApiKey(e.target.value)}
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
