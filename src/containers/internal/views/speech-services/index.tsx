import React, { useEffect, useState } from "react";
import { Button, H1, Icon } from "jambonz-ui";

import { API_ACCOUNTS, API_SERVICE_PROVIDERS } from "src/api/constants";
import { useSelectState } from "src/store";
import { AccountFilter, Icons, Section, Spinner } from "src/components";
import { toastError, toastSuccess } from "src/store";

import { getFetch, deleteSpeechService } from "src/api";
import { SpeechCredential } from "src/api/types";
import { Link } from "react-router-dom";
import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import DeleteSpeechService from "./delete";

export const SpeechServices = () => {
  const currentServiceProvider = useSelectState("currentServiceProvider");

  const [credential, setCredential] = useState<SpeechCredential | null>(null);
  const [credentials, setCredentials] = useState<SpeechCredential[] | null>(
    null
  );

  const [accountSid, setAccountSid] = useState("");

  const getAccountSpeechCredentials = () => {
    getFetch<SpeechCredential[]>(
      `${API_ACCOUNTS}/${accountSid}/SpeechCredentials/`
    )
      .then(({ json }) => setCredentials(json))
      .catch((error) => toastError(error.msg));
  };

  const getServiceProviderSpeechCredentials = () => {
    getFetch<SpeechCredential[]>(
      `${API_SERVICE_PROVIDERS}/${currentServiceProvider?.service_provider_sid}/SpeechCredentials`
    )
      .then(({ json }) => setCredentials(json))
      .catch((error) => toastError(error.msg));
  };

  // TODO test responses

  const handleDelete = () => {
    if (credential && currentServiceProvider) {
      deleteSpeechService(
        currentServiceProvider.service_provider_sid,
        credential.speech_credential_sid
      )
        .then(() => {
          if (accountSid) {
            getAccountSpeechCredentials();
          } else {
            getServiceProviderSpeechCredentials();
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
      getAccountSpeechCredentials();
    } else {
      getServiceProviderSpeechCredentials();
    }
  }, [accountSid]);

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
                          <strong>{credential.vendor}</strong>
                          <Icons.ArrowRight />
                        </Link>
                      </div>
                      <div className="item__sid">
                        <strong>SID:</strong>{" "}
                        <code>{credential.speech_credential_sid}</code>
                      </div>
                      {/**probaby will be removed but here is what it looks like */}
                      <div className="item__usedby">
                        <strong>{`${
                          credential.account_sid ? "" : "NOT"
                        } IN USE`}</strong>
                      </div>
                      <div className="item__lastused">
                        <strong>
                          {credential.last_used
                            ? `Last used: ${credential.last_used}`
                            : "Never used"}
                        </strong>
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
              <div>No speech services yet.</div>
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
