import React, { useState, useEffect } from "react";
import { P, Button, ButtonGroup, MS, Icon } from "@jambonz/ui-kit";
import { Link, useNavigate } from "react-router-dom";

import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  putAccount,
  postAccount,
  getAccountWebhook,
  useApiData,
  postAccountLimit,
  deleteAccountLimit,
  postAccountBucketCredentialTest,
} from "src/api";
import { ClipBoard, Icons, Modal, Section, Tooltip } from "src/components";
import {
  Selector,
  Checkzone,
  Passwd,
  Message,
  ApplicationSelect,
  LocalLimits,
} from "src/components/forms";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import {
  BUCKET_VENDOR_OPTIONS,
  CRED_OK,
  DEFAULT_WEBHOOK,
  ENABLE_RECORD_ALL_CALLS,
  USER_ACCOUNT,
  WEBHOOK_METHODS,
} from "src/api/constants";
import { MSG_REQUIRED_FIELDS, MSG_WEBHOOK_FIELDS } from "src/constants";

import type {
  WebHook,
  Account,
  Application,
  WebhookMethod,
  UseApiDataMap,
  Limit,
  BucketCredential,
  AwsTag,
} from "src/api/types";
import { hasLength, hasValue } from "src/utils";

type AccountFormProps = {
  apps?: Application[];
  limits?: UseApiDataMap<Limit[]>;
  account?: UseApiDataMap<Account>;
};

export const AccountForm = ({ apps, limits, account }: AccountFormProps) => {
  const navigate = useNavigate();
  const user = useSelectState("user");
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
  const [localLimits, setLocalLimits] = useState<Limit[]>([]);
  const [recordAllCalls, setRecordAllCalls] = useState(false);
  const [bucketVendor, setBucketVendor] = useState("");
  const [tmpBucketVendor, setTmpBucketVendor] = useState("");
  const [bucketRegion, setBucketRegion] = useState("us-east-1");
  const [tmpBucketRegion, setTmpBucketRegion] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [tmpBucketName, setTmpBucketName] = useState("");
  const [bucketAccessKeyId, setBucketAccessKeyId] = useState("");
  const [tmpBucketAccessKeyId, setTmpBucketAccessKeyId] = useState("");
  const [bucketSecretAccessKey, setBucketSecretAccessKey] = useState("");
  const [tmpBucketSecretAccessKey, setTmpBucketSecretAccessKey] = useState("");
  const [bucketCredentialChecked, setBucketCredentialChecked] = useState(false);
  const [bucketTags, setBucketTags] = useState<AwsTag[]>([]);

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

  const handleTestBucketCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !account.data) return;
    const cred: BucketCredential = {
      vendor: bucketVendor,
      region: bucketRegion,
      name: bucketName,
      access_key_id: bucketAccessKeyId,
      secret_access_key: bucketSecretAccessKey,
    };

    postAccountBucketCredentialTest(account?.data?.account_sid, cred).then(
      ({ json }) => {
        if (json.status === CRED_OK) {
          toastSuccess("Bucket Credential is valid.");
        } else {
          toastError(json.reason);
        }
      }
    );
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
    if (hasLength(localLimits)) {
      Promise.all(
        localLimits.map((limit) => {
          return limit.quantity === ""
            ? deleteAccountLimit(sid, limit.category)
            : postAccountLimit(sid, limit);
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

    if (
      user?.scope === USER_ACCOUNT &&
      user.account_sid !== account?.data?.account_sid
    ) {
      toastError("You do not have permissions to make changes to this Account");
      return;
    }

    setMessage("");

    if (accounts) {
      const filtered =
        account && account.data
          ? accounts.filter((a) => a.account_sid !== account.data!.account_sid)
          : accounts;

      if (
        account &&
        filtered.find(
          (a) =>
            a.service_provider_sid !== account.data!.service_provider_sid &&
            a.name === name
        )
      ) {
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
        record_all_calls: recordAllCalls ? 1 : 0,
        ...(bucketVendor === "aws_s3" && {
          bucket_credential: {
            vendor: bucketVendor || null,
            region: bucketRegion || "us-east-1",
            name: bucketName || null,
            access_key_id: bucketAccessKeyId || null,
            secret_access_key: bucketSecretAccessKey || null,
            ...(hasLength(bucketTags) && { tags: bucketTags }),
          },
        }),
        ...(!bucketCredentialChecked && {
          bucket_credential: {
            vendor: "none",
          },
        }),
      })
        .then(() => {
          account.refetch();
          toastSuccess("Account updated successfully");
          if (user?.scope !== USER_ACCOUNT) {
            navigate(ROUTE_INTERNAL_ACCOUNTS);
          }
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

      setBucketVendor(
        tmpBucketVendor
          ? tmpBucketVendor
          : account.data.bucket_credential?.vendor || ""
      );
      setTmpBucketVendor(bucketVendor);
      setBucketName(
        tmpBucketName
          ? tmpBucketName
          : account.data.bucket_credential?.name || ""
      );
      setTmpBucketName(bucketName);
      setBucketAccessKeyId(
        tmpBucketAccessKeyId
          ? tmpBucketAccessKeyId
          : account.data.bucket_credential?.access_key_id || ""
      );
      setTmpBucketAccessKeyId(bucketAccessKeyId);
      setBucketSecretAccessKey(
        tmpBucketSecretAccessKey
          ? tmpBucketSecretAccessKey
          : account.data.bucket_credential?.secret_access_key || ""
      );
      setTmpBucketSecretAccessKey(bucketSecretAccessKey);
      setBucketRegion(
        tmpBucketRegion
          ? tmpBucketRegion
          : account.data.bucket_credential?.region || "us-east-1"
      );
      setTmpBucketRegion(bucketRegion);
      setRecordAllCalls(account.data.record_all_calls ? true : false);
      setBucketCredentialChecked(
        hasValue(bucketVendor) && bucketVendor.length !== 0
      );
      setBucketTags(account.data.bucket_credential?.tags || []);
    }
  }, [account]);

  const updateBucketTags = (
    index: number,
    key: string,
    value: typeof bucketTags[number][keyof AwsTag]
  ) => {
    setBucketTags(
      bucketTags.map((b, i) => (i === index ? { ...b, [key]: value } : b))
    );
  };

  const addBucketTag = () => {
    setBucketTags((curr) => [
      ...curr,
      {
        Key: "",
        Value: "",
      },
    ]);
  };

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
            <LocalLimits
              data={limits && limits.data}
              limits={[localLimits, setLocalLimits]}
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
                    label="Use HTTP basic authentication"
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
                    />
                  </Checkzone>
                </div>
              </fieldset>
            );
          })}
          {ENABLE_RECORD_ALL_CALLS && (
            <>
              <fieldset>
                <Checkzone
                  hidden
                  name="bucket_credential"
                  label="Enable call recording"
                  initialCheck={
                    hasValue(bucketVendor) && bucketVendor.length !== 0
                  }
                  handleChecked={(e) => {
                    setBucketCredentialChecked(e.target.checked);
                  }}
                >
                  <div>
                    <label htmlFor="vendor">
                      Bucket Vendor{recordAllCalls && <span>*</span>}
                    </label>
                    <Selector
                      required={recordAllCalls}
                      id={"record_bucket_vendor"}
                      name={"record_bucket_vendor"}
                      value={bucketVendor}
                      options={BUCKET_VENDOR_OPTIONS}
                      onChange={(e) => {
                        setBucketVendor(e.target.value);
                        setTmpBucketVendor(e.target.value);
                      }}
                    />
                  </div>
                  {bucketVendor === "aws_s3" && (
                    <>
                      <label htmlFor="bucket_name">
                        Bucket Name<span>*</span>
                      </label>
                      <input
                        id="bucket_name"
                        required
                        type="text"
                        name="bucket_name"
                        placeholder="Bucket"
                        value={bucketName}
                        onChange={(e) => {
                          setBucketName(e.target.value);
                          setTmpBucketName(e.target.value);
                        }}
                      />
                      <label htmlFor="bucket_aws_region">
                        Region<span>*</span>
                      </label>
                      <input
                        id="bucket_aws_region"
                        required
                        type="text"
                        name="bucket_aws_region"
                        placeholder="us-east-1"
                        value={bucketRegion}
                        onChange={(e) => {
                          setBucketRegion(e.target.value);
                          setTmpBucketRegion(e.target.value);
                        }}
                      />
                      <label htmlFor="bucket_aws_access_key">
                        Access key ID<span>*</span>
                      </label>
                      <input
                        id="bucket_aws_access_key"
                        required
                        type="text"
                        name="bucket_aws_access_key"
                        placeholder="Access Key ID"
                        value={bucketAccessKeyId}
                        onChange={(e) => {
                          setBucketAccessKeyId(e.target.value);
                          setTmpBucketAccessKeyId(e.target.value);
                        }}
                      />
                      <label htmlFor="bucket_aws_secret_key">
                        Secret access key<span>*</span>
                      </label>
                      <Passwd
                        id="bucket_aws_secret_key"
                        required
                        name="bucketaws_secret_key"
                        placeholder="Secret Access Key"
                        value={bucketSecretAccessKey}
                        onChange={(e) => {
                          setBucketSecretAccessKey(e.target.value);
                          setTmpBucketSecretAccessKey(e.target.value);
                        }}
                      />
                      <label htmlFor="aws_s3_tags">S3 Tags</label>
                      {hasLength(bucketTags) &&
                        bucketTags.map((b, i) => (
                          <div key={`s3_tags_${i}`} className="bucket_tag">
                            <div>
                              <div>
                                <input
                                  id={`bucket_tag_name_${i}`}
                                  name={`bucket_tag_name_${i}`}
                                  type="text"
                                  placeholder="Name"
                                  required
                                  value={b.Key}
                                  onChange={(e) => {
                                    updateBucketTags(i, "Key", e.target.value);
                                  }}
                                />
                              </div>
                              <div>
                                <input
                                  id={`bucket_tag_value_${i}`}
                                  name={`bucket_tag_value_${i}`}
                                  type="text"
                                  placeholder="Value"
                                  required
                                  value={b.Value}
                                  onChange={(e) => {
                                    updateBucketTags(
                                      i,
                                      "Value",
                                      e.target.value
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <button
                              className="btnty"
                              title="Delete Aws Tag"
                              type="button"
                              onClick={() => {
                                setBucketTags(
                                  bucketTags.filter((g2, i2) => i2 !== i)
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
                          onClick={addBucketTag}
                          title="Add S3 Tags"
                        >
                          <Icon subStyle="teal">
                            <Icons.Plus />
                          </Icon>
                        </button>
                      </ButtonGroup>

                      <ButtonGroup left>
                        <Button
                          onClick={handleTestBucketCredential}
                          small
                          disabled={
                            !bucketName ||
                            !bucketAccessKeyId ||
                            !bucketSecretAccessKey
                          }
                        >
                          Test
                        </Button>
                      </ButtonGroup>
                    </>
                  )}
                </Checkzone>
              </fieldset>
              <fieldset>
                <label htmlFor="record_all_call" className="chk">
                  <input
                    id="record_all_call"
                    name="record_all_call"
                    type="checkbox"
                    onChange={(e) => setRecordAllCalls(e.target.checked)}
                    checked={recordAllCalls}
                  />
                  <div></div>
                  <Tooltip
                    text="You can also record calls only to specific applications"
                    subStyle="info"
                  >
                    Record all calls for this account
                  </Tooltip>
                </label>
              </fieldset>
            </>
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
