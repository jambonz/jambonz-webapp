import React, { useEffect, useMemo, useState } from "react";
import { Button, H1, Icon, M } from "@jambonz/ui-kit";
import { Link } from "react-router-dom";

import { USER_ACCOUNT } from "src/api/constants";
import { AccountFilter, Icons, Section, Spinner } from "src/components";
import { useSelectState, toastError, toastSuccess } from "src/store";
import {
  deleteSpeechService,
  useServiceProviderData,
  useApiData,
} from "src/api";
import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import {
  getHumanDateTime,
  isUserAccountScope,
  hasLength,
  hasValue,
  useFilteredResults,
} from "src/utils";
import DeleteSpeechService from "./delete";
import { getUsage } from "./utils";
import { CredentialStatus } from "./status";

import type { SpeechCredential, Account } from "src/api/types";
import { ScopedAccess } from "src/components/scoped-access";
import { Scope } from "src/store/types";
import { getAccountFilter, setLocation } from "src/store/localStore";
import { VENDOR_CUSTOM } from "src/vendor";

export const SpeechServices = () => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [apiUrl, setApiUrl] = useState("");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [credential, setCredential] = useState<SpeechCredential | null>(null);
  const [credentials, refetch] = useApiData<SpeechCredential[]>(apiUrl);
  const [filter] = useState("");

  const credentialsFiltered = useMemo(() => {
    setAccountSid(getAccountFilter());
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
      return credentials;
    }

    return credentials
      ? credentials.filter((credential) =>
          accountSid
            ? credential.account_sid === accountSid
            : credential.account_sid === null,
        )
      : [];
  }, [accountSid, accounts, credentials]);

  const filteredCredentials = useFilteredResults<SpeechCredential>(
    filter,
    credentialsFiltered,
  );

  const handleDelete = () => {
    if (credential && currentServiceProvider) {
      if (isUserAccountScope(accountSid, user)) {
        toastError(
          "You do not have permissions to delete these Speech Credentials",
        );
        return;
      }
      deleteSpeechService(
        currentServiceProvider.service_provider_sid,
        credential.speech_credential_sid,
      )
        .then(() => {
          setCredential(null);
          refetch();
          toastSuccess(
            <>
              Deleted speech service{" "}
              <strong>
                {credential.vendor}
                {credential.label ? ` (${credential.label})` : ""}
              </strong>{" "}
            </>,
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    setLocation();

    if (user?.scope !== USER_ACCOUNT && accountSid) {
      setApiUrl(`Accounts/${accountSid}/SpeechCredentials`);
    } else {
      setApiUrl(
        `ServiceProviders/${currentServiceProvider?.service_provider_sid}/SpeechCredentials`,
      );
    }
  }, [currentServiceProvider, accountSid]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Speech services</H1>
        <Link to={`${ROUTE_INTERNAL_SPEECH}/add`} title="Add a speech service">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters filters--multi">
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            label="Used by"
            defaultOption
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(filteredCredentials) && { slim: true })}>
        <div className="list">
          {!hasValue(filteredCredentials) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(filteredCredentials) ? (
            filteredCredentials.map((credential) => {
              return (
                <div className="item" key={credential.speech_credential_sid}>
                  <div className="item__info">
                    <div className="item__title">
                      <ScopedAccess
                        user={user}
                        scope={
                          !credential.account_sid
                            ? Scope.service_provider
                            : Scope.account
                        }
                      >
                        <Link
                          to={`${ROUTE_INTERNAL_SPEECH}/${credential.speech_credential_sid}/edit`}
                          title="Edit application"
                          className="i"
                        >
                          <strong>
                            Vendor:{" "}
                            {credential.vendor.startsWith(VENDOR_CUSTOM)
                              ? credential.vendor.substring(
                                  VENDOR_CUSTOM.length + 1,
                                )
                              : credential.vendor}
                          </strong>
                          <Icons.ArrowRight />
                        </Link>
                      </ScopedAccess>
                      {!credential.account_sid &&
                        user?.scope === USER_ACCOUNT && (
                          <strong>Vendor: {credential.vendor}</strong>
                        )}
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
                      {credential.label && (
                        <div>
                          <div className="i txt--teal">
                            <Icons.Tag />
                            <span>{credential.label}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <ScopedAccess
                    user={user}
                    scope={
                      !credential.account_sid
                        ? Scope.service_provider
                        : Scope.account
                    }
                  >
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
                  </ScopedAccess>
                </div>
              );
            })
          ) : (
            <M>No speech services.</M>
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
