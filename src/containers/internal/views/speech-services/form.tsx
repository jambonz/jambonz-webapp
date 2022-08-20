import React, { useEffect, useState, ChangeEvent } from "react";
import { Button, ButtonGroup, MS } from "jambonz-ui";
import { Link, useNavigate } from "react-router-dom";

import { Section } from "src/components";
import {
  Checkzone,
  FileUpload,
  Passwd,
  Selector,
  Message,
} from "src/components/forms";
import {
  vendors,
  VENDOR_AWS,
  VENDOR_GOOGLE,
  VENDOR_MICROSOFT,
  VENDOR_WELLSAID,
} from "src/vendor";
import { toastError, toastSuccess } from "src/store";
import { postSpeechService, putSpeechService } from "src/api";

import type { RegionVendors, GoogleServiceKey } from "src/vendor/types";
import type {
  Account,
  SpeechCredential,
  ServiceProvider,
  FetchError,
} from "src/api/types";
import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";

export type UseCredentialData = {
  data: SpeechCredential | null;
  error: FetchError | null;
  refetch: () => void;
};

type SpeechServiceFormProps = {
  credential?: UseCredentialData;
  accounts: null | Account[];
  currentServiceProvider: null | ServiceProvider;
};

export const SpeechServiceForm = ({
  accounts,
  credential,
  currentServiceProvider,
}: SpeechServiceFormProps) => {
  const navigate = useNavigate();

  const [accountSid, setAccountSid] = useState("");

  const [ttsCheck, setTtsCheck] = useState(false);
  const [sttCheck, setSttCheck] = useState(false);

  const [vendor, setVendor] = useState("");

  const [region, setRegion] = useState("");
  const [regions, setRegions] = useState<RegionVendors | null>(null);

  const [apiKey, setApiKey] = useState("");
  const [apiKey2, setApiKey2] = useState("");

  const [googleServiceKey, setGoogleServiceKey] =
    useState<GoogleServiceKey | null>(null);

  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // so far, there is no need for these

    setMessage("");

    if (currentServiceProvider) {
      const payload = {
        vendor,
        account_sid: accountSid || null,
        service_provider_sid:
          currentServiceProvider.service_provider_sid || null,
        use_for_tts: ttsCheck,
        use_for_stt: sttCheck,

        service_key:
          vendor === VENDOR_GOOGLE ? JSON.stringify(googleServiceKey) : null,

        access_key_id: vendor === VENDOR_AWS ? apiKey : null,
        secret_access_key: vendor === VENDOR_AWS ? apiKey2 : null,
        aws_region: vendor === VENDOR_AWS ? region : null,

        api_key:
          vendor === VENDOR_MICROSOFT || vendor === VENDOR_WELLSAID // borked: api_key is probably not what WELLSAID is using as it is not rendering, also on main webapp
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
            credential.refetch();
            toastSuccess("Speech service updated successfully");
          })
          .catch((error) => {
            toastError(error.msg);
          });
      } else {
        postSpeechService(currentServiceProvider.service_provider_sid, payload)
          .then(({ json }) => {
            toastSuccess("Speech service created successfully");
            navigate(`${ROUTE_INTERNAL_SPEECH}/${json.sid}/edit`);
          })
          .catch((error) => {
            toastError(error.msg);
          });
      }
    }
  };

  const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "use_stt") {
      sttCheck ? setSttCheck(false) : setSttCheck(true);
    }
    if (e.target.name === "use_tts") {
      ttsCheck ? setTtsCheck(false) : setTtsCheck(true);
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
        setGoogleServiceKey(credential.data.service_key);
      }

      if (credential.data.access_key_id) {
        setApiKey(credential.data.access_key_id);
      }
      if (credential.data.secret_access_key) {
        setApiKey2(credential.data.secret_access_key);
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
    <>
      <Section slim>
        <form className="form form--internal" onSubmit={handleSubmit}>
          <fieldset>
            <MS>
              Fields marked with an asterisk<span>*</span> are required.
            </MS>
          </fieldset>
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
                // setGoogleServiceKey(null); // not sure if this is needed because payload will handle what will get submitted, this will mess up with edit page when accessing local, which got wiped by this
              }}
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
              <Checkzone
                name={`use_tts`}
                label={`Use for text-to-speech`}
                initialCheck={ttsCheck}
                handleChecked={handleCheck}
              />
              {vendor !== VENDOR_WELLSAID && (
                <Checkzone
                  name={`use_stt`}
                  label={`Use for speech-to-text`}
                  initialCheck={sttCheck}
                  handleChecked={handleCheck}
                />
              )}
            </fieldset>
          )}
          {vendor &&
            vendor === VENDOR_GOOGLE &&
            ((!credential && (
              <fieldset>
                <label htmlFor="google_service_key">
                  Service key<span>*</span>
                </label>
                <FileUpload
                  id="google_service_key"
                  name="google_service_key"
                  handleFile={(file) => {
                    const handleError = () => {
                      setGoogleServiceKey(null);
                      toastError(
                        "Invalid service key file, could not parse as JSON."
                      );
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
                  }}
                />
              </fieldset>
            )) || // this doesnt show yet for some reasons, maybe i am trynig to hard to make it smart, will get this dumb down later
              (googleServiceKey && (
                <fieldset>
                  <div className="p">
                    Selected service key:{" "}
                    {googleServiceKey ? (
                      <pre>{JSON.stringify(googleServiceKey, null, 2)}</pre> // there are escapes for yet to understandable reasons
                    ) : (
                      <strong>undefined</strong>
                    )}
                  </div>
                </fieldset>
              )))}
          {vendor && vendor === VENDOR_AWS && (
            <>
              <fieldset>
                <label htmlFor="aws_access_key">
                  Access Key ID<span>*</span>
                </label>
                <input
                  id="aws_access_key"
                  required
                  type="text"
                  name="aws_access_key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={credential ? true : false} // no style yet
                />
                <label htmlFor="aws_access_key">
                  Secret Access Key<span>*</span>
                </label>
                <Passwd // it is not aligning and not hidden
                  id="aws_secret_key"
                  required
                  type="text"
                  name="aws_secret_key"
                  value={apiKey2}
                  onChange={(e) => setApiKey2(e.target.value)}
                  disabled={credential ? true : false}
                />
              </fieldset>
            </>
          )}
          {vendor && vendor === VENDOR_MICROSOFT && (
            <fieldset>
              <label htmlFor="microsoft_apikey">
                API Key<span>*</span>
              </label>
              <input
                id="microsoft_apikey"
                required
                type="text"
                name="microsoft_apikey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={credential ? true : false}
              />
            </fieldset>
          )}
          {vendor && vendor === VENDOR_WELLSAID && (
            <fieldset>
              <label htmlFor="wellsaid_apikey">
                API Key<span>*</span>
              </label>
              <input
                id="wellsaid_apikey"
                required
                type="text"
                name="wellsaid_apikey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={credential ? true : false}
              />
            </fieldset>
          )}
          {regions && regions[vendor as keyof RegionVendors] && (
            <fieldset>
              <label htmlFor="region">Region</label>
              <Selector
                id="region"
                name="region"
                value={region}
                options={[
                  {
                    name:
                      vendor === VENDOR_AWS ? "Select a region" : "All regions",
                    value: "",
                  },
                ].concat(regions[vendor as keyof RegionVendors])}
                onChange={(e) => setRegion(e.target.value)}
              />
            </fieldset>
          )}
          {message && <fieldset>{<Message message={message} />}</fieldset>}
          <fieldset>
            <ButtonGroup left>
              <Button
                small
                subStyle="grey"
                as={Link}
                to={ROUTE_INTERNAL_SPEECH}
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
    </>
  );
};

export default SpeechServiceForm;
