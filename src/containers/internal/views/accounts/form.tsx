import React, { useState, useEffect, useRef } from "react";
import { P, Button, ButtonGroup } from "jambonz-ui";
import { Link, useNavigate } from "react-router-dom";

import {
  toastError,
  toastSuccess,
  useFeatureFlag,
  useSelectState,
} from "src/store";
import {
  putAccount,
  postAccount,
  getAccountWebhook,
  useApiData,
} from "src/api";
import { ClipBoard, Icons, Modal, Section, Tooltip } from "src/components";
import { Selector, Checkzone, Passwd, Message } from "src/components/forms";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { DEFAULT_WEBHOOK } from "src/api/constants";
import { Subspace } from "./subspace";

import type {
  WebHook,
  Account,
  FetchError,
  Application,
  WebhookMethod,
} from "src/api/types";

export type UseAccountData = {
  data: Account | null;
  error: FetchError | null;
  refetch: () => void;
};

type AccountFormProps = {
  apps?: null | Application[];
  account?: null | UseAccountData;
};

export const AccountForm = ({
  apps = null,
  account = null,
}: AccountFormProps) => {
  const navigate = useNavigate();
  const subspace = useFeatureFlag("subspace");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const refRegHookUser = useRef<HTMLInputElement>(null);
  const refRegHookPass = useRef<HTMLInputElement>(null);
  const refQueueHookUser = useRef<HTMLInputElement>(null);
  const refQueueHookPass = useRef<HTMLInputElement>(null);
  const [accounts] = useApiData<Account[]>("Accounts");
  const [name, setName] = useState("");
  const [realm, setRealm] = useState("");
  const [appId, setAppId] = useState("");
  const [recId, setRecId] = useState("");
  const [regHook, setRegHook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [queueHook, setQueueHook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [subspaceId, setSubspaceId] = useState("");
  const [subspaceSecret, setSubspaceSecret] = useState("");
  const [modal, setModal] = useState(false);
  const [message, setMessage] = useState("");
  const [initialRegHook, setInitialRegHook] = useState(false);
  const [initialQueueHook, setInitialQueueHook] = useState(false);

  /** This lets us map and render the same UI for each... */
  const webhooks = [
    {
      label: "Registration",
      prefix: "registration_hook",
      stateVal: regHook,
      stateSet: setRegHook,
      initialCheck: initialRegHook,
      refUser: refRegHookUser,
      refPass: refRegHookPass,
    },
    {
      label: "Queue event",
      prefix: "queue_event_hook",
      stateVal: queueHook,
      stateSet: setQueueHook,
      initialCheck: initialQueueHook,
      refUser: refQueueHookUser,
      refPass: refQueueHookPass,
    },
  ];
  const applications = [
    {
      id: "device_calling_application_sid",
      label: "Application for SIP device calls",
      tooltip:
        "This application is used to handle incoming calls from SIP users who have registered to the Account's SIP Realm.",
      stateVal: appId,
      stateSet: setAppId,
    },
    {
      id: "siprec_hook_sid",
      label: "Application for SIPREC calls",
      stateVal: recId,
      stateSet: setRecId,
    },
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(true);
  };

  const handleCancel = () => {
    setModal(false);
  };

  const handleRefresh = () => {
    if (account && account.data) {
      getAccountWebhook(account.data.account_sid)
        .then(() => {
          account.refetch();
          setModal(false);
          toastSuccess("Webhook signing secret was successfully generated");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (
      (regHook.username && !regHook.password) ||
      (!regHook.username && regHook.password)
    ) {
      setMessage(
        "Registration webhook username and password must be either both filled out or both empty."
      );
      !regHook.username && refRegHookUser.current?.focus();
      !regHook.password && refRegHookPass.current?.focus();
      return;
    }

    if (
      (queueHook.username && !queueHook.password) ||
      (!queueHook.username && queueHook.password)
    ) {
      setMessage(
        "Queue event webhook username and password must be either both filled out or both empty."
      );
      !queueHook.username && refQueueHookUser.current?.focus();
      !queueHook.password && refQueueHookPass.current?.focus();
      return;
    }

    if (accounts) {
      const filtered =
        account && account.data
          ? accounts.filter((a) => a.account_sid !== account.data!.account_sid)
          : accounts;

      if (filtered.find((a) => a.name === name)) {
        setMessage(
          "The name you have entered is already in use on another one of your accounts."
        );
        return;
      }

      if (filtered.find((a) => a.sip_realm === realm)) {
        setMessage(
          "The SIP Realm you have entered is already in use on another one of your accounts."
        );
        return;
      }
    }

    if (account && account.data) {
      putAccount(account.data.account_sid, {
        name,
        sip_realm: realm || null,
        webhook_secret: account.data.webhook_secret,
        siprec_hook_sid: recId || null,
        queue_event_hook: queueHook || account.data.queue_event_hook,
        registration_hook: regHook || account.data.registration_hook,
        subspace_client_id: subspaceId || null,
        subspace_client_secret: subspaceSecret || null,
        device_calling_application_sid: appId || null,
      })
        .then(() => {
          account.refetch();
          toastSuccess("Account updated successfully");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    } else {
      postAccount({
        name,
        sip_realm: realm || null,
        queue_event_hook: queueHook || null,
        registration_hook: regHook || null,
        service_provider_sid: currentServiceProvider?.service_provider_sid,
      })
        .then(({ json }) => {
          toastSuccess("Account created successfully");
          navigate(`${ROUTE_INTERNAL_ACCOUNTS}/${json.sid}/edit`);
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  /** Set current account data values if applicable -- e.g. "edit mode" */
  useEffect(() => {
    if (account && account.data) {
      setName(account.data.name);

      if (account.data.sip_realm) {
        setRealm(account.data.sip_realm);
      }

      if (account.data.device_calling_application_sid) {
        setAppId(account.data.device_calling_application_sid);
      }

      if (account.data.siprec_hook_sid) {
        setRecId(account.data.siprec_hook_sid);
      }

      if (account.data.registration_hook) {
        setRegHook(account.data.registration_hook);

        if (
          account.data.registration_hook.username ||
          account.data.registration_hook.password
        ) {
          setInitialRegHook(true);
        } else {
          setInitialRegHook(false);
        }
      }

      if (account.data.queue_event_hook) {
        setQueueHook(account.data.queue_event_hook);

        if (
          account.data.queue_event_hook.username ||
          account.data.queue_event_hook.password
        ) {
          setInitialQueueHook(true);
        } else {
          setInitialQueueHook(false);
        }
      }

      if (account.data.subspace_client_id) {
        setSubspaceId(account.data.subspace_client_id);
      }

      if (account.data.subspace_client_secret) {
        setSubspaceSecret(account.data.subspace_client_secret);
      }
    }
  }, [account]);

  return (
    <>
      <Section slim>
        <form onSubmit={handleSubmit}>
          {account && account.data && (
            <fieldset>
              <label htmlFor="account_sid">Account SID</label>
              <ClipBoard
                id="account_sid"
                name="account_sid"
                text={account.data.account_sid}
              />
            </fieldset>
          )}
          <fieldset>
            <label htmlFor="name">Account name</label>
            <input
              id="name"
              required
              type="text"
              name="name"
              placeholder="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="sip_realm">SIP realm</label>
            <input
              id="sip_realm"
              type="text"
              name="sip_realm"
              placeholder="The domain name that SIP devices will register with"
              value={realm}
              onChange={(e) => setRealm(e.target.value)}
            />
          </fieldset>
          {account && account.data && (
            <fieldset>
              <label htmlFor="webhook_secret">
                Webhook secret
                <button
                  type="button"
                  title="Generate new secret"
                  onClick={handleConfirm}
                  className="btn--type"
                >
                  <Icons.RefreshCw />
                </button>
              </label>
              <ClipBoard
                id="webhook_secret"
                name="webhook_secret"
                text={account.data.webhook_secret}
              />
            </fieldset>
          )}
          {account &&
            account.data &&
            apps &&
            applications.map((application) => {
              return (
                <fieldset key={application.id}>
                  <label htmlFor={application.id}>
                    {application.tooltip ? (
                      <Tooltip text={application.tooltip}>
                        {application.label}
                      </Tooltip>
                    ) : (
                      application.label
                    )}
                  </label>
                  <Selector
                    id={application.id}
                    name={application.id}
                    value={application.stateVal}
                    options={[
                      {
                        name: "None",
                        value: "",
                      },
                    ].concat(
                      apps
                        .filter(
                          (app) => app.account_sid === account.data!.account_sid
                        )
                        .map((app) => ({
                          name: app.name,
                          value: app.application_sid,
                        }))
                    )}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      application.stateSet(e.target.value)
                    }
                  />
                </fieldset>
              );
            })}
          {webhooks.map((webhook) => {
            const selectOptions = [
              {
                name: "POST",
                value: "POST",
              },
            ];

            if (webhook.label === "Registration") {
              selectOptions.push({
                name: "GET",
                value: "GET",
              });
            }

            return (
              <fieldset key={webhook.prefix}>
                <div className="multi">
                  <div className="inp">
                    <label htmlFor={`${webhook.prefix}_url`}>
                      {webhook.label} webhook
                    </label>
                    <input
                      id={`${webhook.prefix}_url`}
                      type="text"
                      name={`${webhook.prefix}_url`}
                      placeholder={`${webhook.label} webhook`}
                      value={webhook.stateVal?.url}
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
                      value={webhook.stateVal?.method}
                      onChange={(e) => {
                        webhook.stateSet({
                          ...webhook.stateVal,
                          method: e.target.value as WebhookMethod,
                        });
                      }}
                      options={selectOptions}
                    />
                  </div>
                </div>
                <div>
                  <Checkzone
                    hidden
                    name={webhook.prefix}
                    label="Use HTTP Basic Authentication"
                    initialCheck={webhook.initialCheck}
                  >
                    <label htmlFor={`${webhook.prefix}_username`}>
                      Username
                    </label>
                    <input
                      ref={webhook.refUser}
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
                    />
                    <label htmlFor={`${webhook.prefix}_password`}>
                      Password
                    </label>
                    <Passwd
                      ref={webhook.refPass}
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
                    />
                  </Checkzone>
                </div>
              </fieldset>
            );
          })}
          {account && account.data && subspace && (
            <Subspace
              id={[subspaceId, setSubspaceId]}
              secret={[subspaceSecret, setSubspaceSecret]}
              account={account}
              sipRealm={realm}
            />
          )}
          {message && (
            <fieldset>
              <Message message={message} />
            </fieldset>
          )}
          <fieldset>
            <ButtonGroup left>
              <Button
                small
                subStyle="grey"
                as={Link}
                to={ROUTE_INTERNAL_ACCOUNTS}
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
      {modal && (
        <Modal handleSubmit={handleRefresh} handleCancel={handleCancel}>
          <P>
            Confirm generating a new webhook signing secret. Note: this will
            immediately invalidate the old webhook signing secret.
          </P>
        </Modal>
      )}
    </>
  );
};
