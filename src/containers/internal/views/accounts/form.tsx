import React, { useState, useEffect } from "react";
import { P, Button, ButtonGroup, MS } from "jambonz-ui";
import { Link, useNavigate } from "react-router-dom";

import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  putAccount,
  postAccount,
  getAccountWebhook,
  useApiData,
  postAccountLimits,
} from "src/api";
import { ClipBoard, Icons, Modal, Section, Tooltip } from "src/components";
import {
  Selector,
  Checkzone,
  Passwd,
  Message,
  ApplicationSelect,
} from "src/components/forms";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { DEFAULT_WEBHOOK, WEBHOOK_METHODS, LIMITS } from "src/api/constants";
import { MSG_REQUIRED_FIELDS, MSG_WEBHOOK_FIELDS } from "src/constants";
import { hasLength } from "src/utils";

import type {
  WebHook,
  Account,
  Application,
  WebhookMethod,
  UseApiDataMap,
  Limit,
} from "src/api/types";

type AccountFormProps = {
  apps?: Application[];
  limits?: UseApiDataMap<Limit[]>;
  account?: UseApiDataMap<Account>;
};

export const AccountForm = ({ apps, limits, account }: AccountFormProps) => {
  const navigate = useNavigate();
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accounts] = useApiData<Account[]>("Accounts");
  const [name, setName] = useState("");
  const [realm, setRealm] = useState("");
  const [appId, setAppId] = useState("");
  const [recId, setRecId] = useState("");
  const [regHook, setRegHook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [queueHook, setQueueHook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [modal, setModal] = useState(false);
  const [message, setMessage] = useState("");
  const [initialRegHook, setInitialRegHook] = useState(false);
  const [initialQueueHook, setInitialQueueHook] = useState(false);
  const [localLimits, setLocalLimits] = useState<Limit[]>();

  /** This lets us map and render the same UI for each... */
  const webhooks = [
    {
      label: "Registration",
      prefix: "registration_hook",
      stateVal: regHook,
      stateSet: setRegHook,
      initialCheck: initialRegHook,
    },
    {
      label: "Queue event",
      prefix: "queue_event_hook",
      stateVal: queueHook,
      stateSet: setQueueHook,
      initialCheck: initialQueueHook,
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

  const updateLimits = (sid: string) => {
    if (localLimits) {
      Promise.all(
        localLimits.map((limit) => {
          return postAccountLimits(sid, limit);
        })
      )
        .then(() => {
          if (limits) {
            limits.refetch();
          }
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

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
        device_calling_application_sid: appId || null,
      })
        .then(() => {
          account.refetch();
          toastSuccess("Account updated successfully");
        })
        .catch((error) => {
          toastError(error.msg);
        });

      updateLimits(account.data.account_sid);
    } else if (currentServiceProvider) {
      postAccount({
        name,
        sip_realm: realm || null,
        queue_event_hook: queueHook || null,
        registration_hook: regHook || null,
        service_provider_sid: currentServiceProvider.service_provider_sid,
      })
        .then(({ json }) => {
          toastSuccess("Account created successfully");
          navigate(`${ROUTE_INTERNAL_ACCOUNTS}/${json.sid}/edit`);
          updateLimits(json.sid);
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
    }

    if (limits && limits.data && hasLength(limits.data)) {
      setLocalLimits(limits.data);
    } else {
      setLocalLimits(
        LIMITS.map(({ category }) => ({
          category,
          quantity: 0,
        }))
      );
    }
  }, [account, limits]);

  return (
    <>
      <Section slim>
        <form className="form form--internal" onSubmit={handleSubmit}>
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
          </fieldset>
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
            <label htmlFor="name">
              Account name<span>*</span>
            </label>
            <input
              id="name"
              required
              type="text"
              name="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>
          <fieldset>
            {hasLength(localLimits) && (
              <>
                {LIMITS.map(({ category, label }) => {
                  return (
                    <React.Fragment key={category}>
                      <label htmlFor={category}>{label}</label>
                      <input
                        id={category}
                        type="number"
                        name={category}
                        placeholder={category}
                        min="0"
                        value={
                          localLimits.find((l) => l.category === category)
                            ?.quantity
                        }
                        onChange={(e) => {
                          setLocalLimits(
                            localLimits.map((l) =>
                              l.category === category
                                ? { ...l, quantity: Number(e.target.value) }
                                : l
                            )
                          );
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </>
            )}
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
                  className="btnty"
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
                  <ApplicationSelect
                    id={application.id}
                    label={
                      application.tooltip ? (
                        <Tooltip text={application.tooltip}>
                          {application.label}
                        </Tooltip>
                      ) : (
                        application.label
                      )
                    }
                    defaultOption="None"
                    application={[application.stateVal, application.stateSet]}
                    applications={apps.filter(
                      (app) => app.account_sid === account.data!.account_sid
                    )}
                  />
                </fieldset>
              );
            })}
          {webhooks.map((webhook) => {
            const selectOptions = WEBHOOK_METHODS.filter((wm) =>
              webhook.prefix === "queue_event_hook" ? wm.name !== "GET" : true
            );

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
                      value={webhook.stateVal.url}
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
                      value={webhook.stateVal.method}
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
                    <MS>{MSG_WEBHOOK_FIELDS}</MS>
                    <label htmlFor={`${webhook.prefix}_username`}>
                      Username
                    </label>
                    <input
                      id={`${webhook.prefix}_username`}
                      type="text"
                      name={`${webhook.prefix}_username`}
                      placeholder="Optional"
                      value={webhook.stateVal.username || ""}
                      onChange={(e) => {
                        webhook.stateSet({
                          ...webhook.stateVal,
                          username: e.target.value,
                        });
                      }}
                      required={
                        webhook.stateVal.password && !webhook.stateVal.username
                          ? true
                          : false
                      }
                    />
                    <label htmlFor={`${webhook.prefix}_password`}>
                      Password
                    </label>
                    <Passwd
                      id={`${webhook.prefix}_password`}
                      name={`${webhook.prefix}_password`}
                      value={webhook.stateVal.password || ""}
                      placeholder="Optional"
                      onChange={(e) => {
                        webhook.stateSet({
                          ...webhook.stateVal,
                          password: e.target.value,
                        });
                      }}
                      required={
                        webhook.stateVal.username && !webhook.stateVal.password
                          ? true
                          : false
                      }
                    />
                  </Checkzone>
                </div>
              </fieldset>
            );
          })}
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
