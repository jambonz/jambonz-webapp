import React, { useEffect, useState } from "react";
import { Button, H1, Icon, M } from "jambonz-ui";
import { Link } from "react-router-dom";

import { API_ACCOUNTS, API_SERVICE_PROVIDERS } from "src/api/constants";
import { AccountFilter, Icons, Section, Spinner } from "src/components";
import { useSelectState, toastError, toastSuccess } from "src/store";
import { getFetch, deleteSpeechService } from "src/api";
import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import { getHumanDateTime } from "src/utils";
import DeleteSpeechService from "./delete";

import type { SpeechCredential } from "src/api/types";

export const SpeechServices = () => {
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accountSid, setAccountSid] = useState("");
  const [credential, setCredential] = useState<SpeechCredential | null>(null);
  const [credentials, setCredentials] = useState<SpeechCredential[] | null>(
    null
  );

  const getSpeechCredentials = (url: string) => {
    getFetch<SpeechCredential[]>(url)
      .then(({ json }) => {
        setCredentials(json);
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  const getUsage = (cred: SpeechCredential) => {
    return cred.use_for_tts && cred.use_for_stt
      ? "TTS & STT"
      : cred.use_for_tts
      ? "TTS"
      : cred.use_for_stt
      ? "STT"
      : "TTS/STT";
  };

  const handleDelete = () => {
    if (credential && currentServiceProvider) {
      deleteSpeechService(
        currentServiceProvider.service_provider_sid,
        credential.speech_credential_sid
      )
        .then(() => {
          if (accountSid) {
            getSpeechCredentials(
              `${API_ACCOUNTS}/${accountSid}/SpeechCredentials`
            );
          } else {
            getSpeechCredentials(
              `${API_SERVICE_PROVIDERS}/${currentServiceProvider.service_provider_sid}/SpeechCredentials`
            );
          }
          setCredential(null);
          toastSuccess(
            <>
              Deleted speech service <strong>{credential.vendor}</strong>
            </>
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    if (accountSid) {
      getSpeechCredentials(`${API_ACCOUNTS}/${accountSid}/SpeechCredentials`);
    } else if (currentServiceProvider) {
      getSpeechCredentials(
        `${API_SERVICE_PROVIDERS}/${currentServiceProvider.service_provider_sid}/SpeechCredentials`
      );
    }
  }, [accountSid, currentServiceProvider]);

  return (
    <>
      <section className="mast">
        <H1>Speech Services</H1>
        <Link to={`${ROUTE_INTERNAL_SPEECH}/add`} title="Add an application">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters">
        <AccountFilter account={[accountSid, setAccountSid]} defaultOption />
      </section>
      <Section
        {...(credentials && credentials.length > 0 ? { slim: true } : {})}
      >
        <div className="list">
          {credentials ? (
            credentials.length > 0 ? (
              credentials.map((credential) => {
                return (
                  <div className="item" key={credential.speech_credential_sid}>
                    <div className="item__info">
                      <div className="item__title">
                        <Link
                          to={`${ROUTE_INTERNAL_SPEECH}/${credential.speech_credential_sid}/edit`}
                          title="Edit application"
                          className="i"
                        >
                          <strong>Vendor: {credential.vendor}</strong>
                          <Icons.ArrowRight />
                        </Link>
                      </div>
                      <div className="item__sid">
                        <strong>SID:</strong>{" "}
                        <code>{credential.speech_credential_sid}</code>
                      </div>
                      <div className="item__meta">
                        <div>
                          <div
                            className={`i txt--${
                              credential.use_for_tts || credential.use_for_stt
                                ? "teal"
                                : "grey"
                            }`}
                          >
                            {credential.use_for_tts ||
                            credential.use_for_stt ? (
                              <Icons.CheckCircle />
                            ) : (
                              <Icons.XCircle />
                            )}
                            <span>{getUsage(credential)}</span>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`i txt--${
                              credential.last_used ? "teal" : "grey"
                            }`}
                          >
                            {credential.last_used ? (
                              <Icons.CheckCircle />
                            ) : (
                              <Icons.XCircle />
                            )}
                            <span>
                              {credential.last_used
                                ? getHumanDateTime(credential.last_used)
                                : "Never used"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="i txt--grey">
                            <Icons.XCircle />
                            <span>Status test?</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="item__actions">
                      <Link
                        to={`${ROUTE_INTERNAL_SPEECH}/${credential.speech_credential_sid}/edit`}
                        title="Edit speech service"
                        className=""
                      >
                        <Icons.Edit3 />
                      </Link>
                      <button
                        type="button"
                        title="Delete speech service"
                        onClick={() => setCredential(credential)}
                        className="btn--type"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <M>No speech services yet.</M>
            )
          ) : (
            <Spinner />
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_SPEECH}/add`}>
          Add speech service
        </Button>
      </Section>
      {credential && (
        <DeleteSpeechService
          credential={credential}
          handleCancel={() => setCredential(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default SpeechServices;
