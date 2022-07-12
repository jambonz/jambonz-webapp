import React, { useEffect, useState } from "react";
import { Button, H1, Icon, M } from "jambonz-ui";
import { Link } from "react-router-dom";

import { API_ACCOUNTS, API_SERVICE_PROVIDERS } from "src/api/constants";
import { AccountFilter, Icons, Section, Spinner } from "src/components";
import { useSelectState, toastError, toastSuccess } from "src/store";
import { getFetch, deleteSpeechService, useServiceProviderData } from "src/api";
import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import { getHumanDateTime, hasLength, hasValue } from "src/utils";
import DeleteSpeechService from "./delete";
import { getUsage } from "./utils";
import { CredentialStatus } from "./status";

import type { SpeechCredential, Account } from "src/api/types";

export const SpeechServices = () => {
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [credential, setCredential] = useState<SpeechCredential | null>(null);
  const [credentials, setCredentials] = useState<SpeechCredential[]>();

  const getSpeechCredentials = (url: string) => {
    getFetch<SpeechCredential[]>(url)
      .then(({ json }) => {
        setCredentials(json);
      })
      .catch((error) => {
        toastError(error.msg);
      });
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
        <H1 className="h2">Speech Services</H1>
        <Link to={`${ROUTE_INTERNAL_SPEECH}/add`} title="Add a speech service">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters filters--ender">
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={accounts}
          label="Used by"
          defaultOption
        />
      </section>
      <Section {...(hasLength(credentials) ? { slim: true } : {})}>
        <div className="list">
          {!hasValue(credentials) && <Spinner />}
          {hasLength(credentials) ? (
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
                    <div className="item__meta">
                      <div>
                        <div
                          className={`i txt--${
                            credential.use_for_tts || credential.use_for_stt
                              ? "teal"
                              : "grey"
                          }`}
                        >
                          {credential.use_for_tts || credential.use_for_stt ? (
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
                        <CredentialStatus cred={credential} />
                      </div>
                    </div>
                  </div>
                  <div className="item__actions">
                    <Link
                      to={`${ROUTE_INTERNAL_SPEECH}/${credential.speech_credential_sid}/edit`}
                      title="Edit speech service"
                    >
                      <Icons.Edit3 />
                    </Link>
                    <button
                      type="button"
                      title="Delete speech service"
                      onClick={() => setCredential(credential)}
                      className="btnty"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <M>No speech services yet.</M>
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
