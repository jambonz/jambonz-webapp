import React, { useState, useEffect, useRef } from "react";
import { P, Button, ButtonGroup, MS, Icon, H1 } from "@jambonz/ui-kit";
import { Link, useNavigate, useParams } from "react-router-dom";

import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  putAccount,
  postAccount,
  getAccountWebhook,
  useApiData,
  postAccountLimit,
  deleteAccountLimit,
  deleteAccountTtsCache,
  postAccountBucketCredentialTest,
  deleteAccount,
} from "src/api";
import {
  ClipBoard,
  Icons,
  Modal,
  ScopedAccess,
  Section,
  Tooltip,
} from "src/components";
import {
  Selector,
  Checkzone,
  Passwd,
  Message,
  ApplicationSelect,
  LocalLimits,
  FileUpload,
} from "src/components/forms";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import {
  AUDIO_FORMAT_OPTIONS,
  BUCKET_VENDOR_AWS,
  BUCKET_VENDOR_S3_COMPATIBLE,
  BUCKET_VENDOR_AZURE,
  BUCKET_VENDOR_GOOGLE,
  BUCKET_VENDOR_OPTIONS,
  CRED_OK,
  CurrencySymbol,
  DEFAULT_WEBHOOK,
  DISABLE_CALL_RECORDING,
  ENABLE_HOSTED_SYSTEM,
  PlanType,
  USER_ACCOUNT,
  WEBHOOK_METHODS,
  STRIPE_PUBLISHABLE_KEY,
} from "src/api/constants";
import { MSG_REQUIRED_FIELDS, MSG_WEBHOOK_FIELDS } from "src/constants";

import {
  WebHook,
  Account,
  Application,
  WebhookMethod,
  UseApiDataMap,
  Limit,
  TtsCache,
  BucketCredential,
  AwsTag,
  Invoice,
  CurrentUserData,
  Carrier,
  SpeechCredential,
} from "src/api/types";
import { hasLength, hasValue } from "src/utils";
import { useRegionVendors } from "src/vendor";
import { GoogleServiceKey } from "src/vendor/types";
import { getObscuredGoogleServiceKey } from "../speech-services/utils";
import dayjs from "dayjs";
import { EditBoard } from "src/components/editboard";
import { ModalLoader } from "src/components/modal";
import { useAuth } from "src/router/auth";
import { Scope } from "src/store/types";

type AccountFormProps = {
  apps?: Application[];
  limits?: UseApiDataMap<Limit[]>;
  account?: UseApiDataMap<Account>;
  ttsCache?: UseApiDataMap<TtsCache>;
};

export const AccountForm = ({
  apps,
  limits,
  account,
  ttsCache,
}: AccountFormProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accounts] = useApiData<Account[]>("Accounts");
  // Dont get Invoices if the environment is self-hosted
  const [invoice] = STRIPE_PUBLISHABLE_KEY
    ? useApiData<Invoice>("Invoices")
    : [undefined];
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const [userCarriers] = useApiData<Carrier[]>(`VoipCarriers`);
  const [userSpeechs] = useApiData<SpeechCredential[]>(
    `/Accounts/${params.account_sid}/SpeechCredentials`,
  );
  const [name, setName] = useState("");
  const [realm, setRealm] = useState("");
  const [appId, setAppId] = useState("");
  const [recId, setRecId] = useState("");
  const { signout } = useAuth();
  const [regHook, setRegHook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [queueHook, setQueueHook] = useState<WebHook>(DEFAULT_WEBHOOK);
  const [modal, setModal] = useState(false);
  const [message, setMessage] = useState("");
  const [initialRegHook, setInitialRegHook] = useState(false);
  const [initialQueueHook, setInitialQueueHook] = useState(false);
  const [localLimits, setLocalLimits] = useState<Limit[]>([]);
  const [clearTtsCacheFlag, setClearTtsCacheFlag] = useState(false);
  const [recordAllCalls, setRecordAllCalls] = useState(false);
  const [initialCheckRecordAllCall, setInitialCheckRecordAllCall] =
    useState(false);
  const [bucketVendor, setBucketVendor] = useState("");
  const [tmpBucketVendor, setTmpBucketVendor] = useState("");
  const [recordFormat, setRecordFormat] = useState("mp3");
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
  const [bucketGoogleServiceKey, setBucketGoogleServiceKey] =
    useState<GoogleServiceKey | null>(null);
  const [tmpBucketGoogleServiceKey, setTmpBucketGoogleServiceKey] =
    useState<GoogleServiceKey | null>(null);
  const regions = useRegionVendors();
  const [subscriptionDescription, setSubscriptionDescription] = useState("");
  const [isDeleteAccount, setIsDeleteAccount] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(true);
  const [deleteAccountPasswd, setDeleteAccountPasswd] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDisableDeleteAccountButton, setIsDisableDeleteAccountButton] =
    useState(false);
  const deleteMessageRef = useRef<HTMLInputElement | null>(null);
  const [isShowModalLoader, setIsShowModalLoader] = useState(false);
  const [azureConnectionString, setAzureConnectionString] = useState("");
  const [tmpAzureConnectionString, setTmpAzureConnectionString] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [tmpEndpoint, setTmpEndpoint] = useState("");
  const [s3CompatibleRegion, setS3CompatibleRegion] = useState("");
  const [tmpS3CompatibleRegion, setTmpS3CompatibleRegion] = useState("");
  const [enableDebugLog, setEnableDebugLog] = useState(false);

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

  useEffect(() => {
    if (
      isDeleteAccount &&
      deleteMessageRef.current &&
      deleteMessageRef.current !== document.activeElement
    ) {
      deleteMessageRef.current.focus();
    }
  }, [isDeleteAccount]);

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteMessage !== "delete my account") {
      toastError(
        "You must type the delete message correctly in order to delete your account.",
      );
      if (
        deleteMessageRef.current &&
        deleteMessageRef.current !== document.activeElement
      ) {
        deleteMessageRef.current.focus();
      }
      return;
    }
    setIsDisableDeleteAccountButton(true);
    setIsShowModalLoader(true);

    deleteAccount(userData?.account?.account_sid || "", {
      password: deleteAccountPasswd,
    })
      .then(() => {
        signout();
      })
      .catch((error) => {
        toastError(error.msg);
      })
      .finally(() => {
        setIsDisableDeleteAccountButton(false);
        setIsShowModalLoader(false);
      });
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(true);
  };

  const handleCancel = () => {
    setModal(false);
  };

  const handleFile = (file: File) => {
    const handleError = () => {
      setBucketGoogleServiceKey(null);
      setTmpBucketGoogleServiceKey(null);
      toastError("Invalid service key file, could not parse as JSON.");
    };

    file
      .text()
      .then((text) => {
        try {
          const json: GoogleServiceKey = JSON.parse(text);

          if (json.private_key && json.client_email) {
            setBucketGoogleServiceKey(json);
            setTmpBucketGoogleServiceKey(json);
          } else {
            setBucketGoogleServiceKey(null);
            setTmpBucketGoogleServiceKey(null);
          }
        } catch (error) {
          handleError();
        }
      })
      .catch(() => {
        handleError();
      });
  };

  const handleTestBucketCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !account.data) return;
    const cred: BucketCredential = {
      vendor: bucketVendor,
      name: bucketName,
      ...(bucketVendor === BUCKET_VENDOR_AWS && {
        region: bucketRegion,
        access_key_id: bucketAccessKeyId,
        secret_access_key: bucketSecretAccessKey,
      }),
      ...(bucketVendor === BUCKET_VENDOR_GOOGLE && {
        service_key: JSON.stringify(bucketGoogleServiceKey),
      }),
      ...(bucketVendor === BUCKET_VENDOR_AZURE && {
        connection_string: azureConnectionString,
      }),
      ...(bucketVendor === BUCKET_VENDOR_S3_COMPATIBLE && {
        endpoint: endpoint,
        access_key_id: bucketAccessKeyId,
        secret_access_key: bucketSecretAccessKey,
        ...(s3CompatibleRegion && { s3_compatible_region: s3CompatibleRegion }),
      }),
    };

    postAccountBucketCredentialTest(account?.data?.account_sid, cred).then(
      ({ json }) => {
        if (json.status === CRED_OK) {
          toastSuccess("Bucket Credential is valid.");
        } else {
          toastError(json.reason);
        }
      },
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
        }),
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

  const handleClearCache = () => {
    deleteAccountTtsCache(account?.data?.account_sid || "")
      .then(() => {
        if (ttsCache) {
          ttsCache.refetch();
        }
        setClearTtsCacheFlag(false);
        toastSuccess("Tts Cache successfully cleaned");
      })
      .catch((error) => {
        toastError(error.msg);
      });
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
            a.name === name,
        )
      ) {
        setMessage(
          "The name you have entered is already in use on another one of your accounts.",
        );
        return;
      }

      if (filtered.find((a) => a.sip_realm === realm)) {
        setMessage(
          "The SIP Realm you have entered is already in use on another one of your accounts.",
        );
        return;
      }
    }

    if (account && account.data) {
      putAccount(account.data.account_sid, {
        name,
        enable_debug_log: enableDebugLog,
        ...(!ENABLE_HOSTED_SYSTEM && { sip_realm: realm || null }),
        webhook_secret: account.data.webhook_secret,
        siprec_hook_sid: recId || null,
        queue_event_hook: queueHook || account.data.queue_event_hook,
        registration_hook: regHook || account.data.registration_hook,
        device_calling_application_sid: appId || null,
        record_all_calls: recordAllCalls ? 1 : 0,
        record_format: recordFormat ? recordFormat : "mp3",
        ...(bucketVendor === BUCKET_VENDOR_AWS && {
          bucket_credential: {
            vendor: bucketVendor || null,
            region: bucketRegion || "us-east-1",
            name: bucketName || null,
            access_key_id: bucketAccessKeyId || null,
            secret_access_key: bucketSecretAccessKey || null,
            ...(hasLength(bucketTags) && { tags: bucketTags }),
          },
        }),
        ...(bucketVendor === BUCKET_VENDOR_GOOGLE && {
          bucket_credential: {
            vendor: bucketVendor || null,
            service_key: JSON.stringify(bucketGoogleServiceKey),
            name: bucketName || null,
            ...(hasLength(bucketTags) && { tags: bucketTags }),
          },
        }),
        ...(bucketVendor === BUCKET_VENDOR_AZURE && {
          bucket_credential: {
            vendor: bucketVendor || null,
            name: bucketName || null,
            connection_string: azureConnectionString || null,
          },
        }),
        ...(bucketVendor === BUCKET_VENDOR_S3_COMPATIBLE && {
          bucket_credential: {
            vendor: bucketVendor || null,
            endpoint: endpoint || null,
            name: bucketName || null,
            access_key_id: bucketAccessKeyId || null,
            secret_access_key: bucketSecretAccessKey || null,
            ...(hasLength(bucketTags) && { tags: bucketTags }),
            ...(s3CompatibleRegion && {
              s3_compatible_region: s3CompatibleRegion,
            }),
          },
        }),
        ...(!bucketCredentialChecked && {
          record_all_calls: 0,
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
        enable_debug_log: enableDebugLog,
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
      setEnableDebugLog(account.data.enable_debug_log);
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

      if (tmpBucketVendor) {
        setBucketVendor(tmpBucketVendor);
      } else if (account.data.bucket_credential?.vendor) {
        setBucketVendor(account.data.bucket_credential?.vendor);
      }

      if (tmpBucketName) {
        setBucketName(tmpBucketName);
      } else if (account.data.bucket_credential?.name) {
        setBucketName(account.data.bucket_credential?.name);
      }

      if (tmpBucketAccessKeyId) {
        setBucketAccessKeyId(tmpBucketAccessKeyId);
      } else if (account.data.bucket_credential?.access_key_id) {
        setBucketAccessKeyId(account.data.bucket_credential?.access_key_id);
      }
      if (tmpBucketSecretAccessKey) {
        setBucketSecretAccessKey(tmpBucketSecretAccessKey);
      } else if (account.data.bucket_credential?.secret_access_key) {
        setBucketSecretAccessKey(
          account.data.bucket_credential?.secret_access_key,
        );
      }
      if (tmpBucketRegion) {
        setBucketRegion(tmpBucketRegion);
      } else if (account.data.bucket_credential?.region) {
        setBucketRegion(account.data.bucket_credential?.region);
      }

      if (tmpAzureConnectionString) {
        setAzureConnectionString(tmpAzureConnectionString);
      } else if (account.data.bucket_credential?.connection_string) {
        setAzureConnectionString(
          account.data.bucket_credential.connection_string,
        );
      }
      if (tmpEndpoint) {
        setEndpoint(tmpEndpoint);
      } else if (account.data.bucket_credential?.endpoint) {
        setEndpoint(account.data.bucket_credential.endpoint);
      }
      if (tmpS3CompatibleRegion) {
        setS3CompatibleRegion(tmpS3CompatibleRegion);
      } else if (account.data.bucket_credential?.s3_compatible_region) {
        setS3CompatibleRegion(
          account.data.bucket_credential?.s3_compatible_region,
        );
      }
      if (account.data.record_all_calls) {
        setRecordAllCalls(account.data.record_all_calls ? true : false);
      }
      setBucketCredentialChecked(
        hasValue(bucketVendor) && bucketVendor.length !== 0,
      );
      if (account.data.bucket_credential?.tags) {
        setBucketTags(account.data.bucket_credential?.tags);
      }
      if (account.data.record_format) {
        setRecordFormat(account.data.record_format || "mp3");
      }
      if (tmpBucketGoogleServiceKey) {
        setBucketGoogleServiceKey(tmpBucketGoogleServiceKey);
      } else if (account.data.bucket_credential?.service_key) {
        setBucketGoogleServiceKey(
          JSON.parse(account.data.bucket_credential?.service_key),
        );
      }
      setInitialCheckRecordAllCall(
        hasValue(bucketVendor) && bucketVendor.length !== 0,
      );
    }
  }, [account]);

  if (ENABLE_HOSTED_SYSTEM) {
    useEffect(() => {
      if (userData && userData.user) {
        setRequiresPassword(userData.user.provider === "local");
      }
      if (userData && userData.account) {
        const pType = userData.account.plan_type;
        const { products } = userData.subscription || {};
        const registeredDeviceRecord = products
          ? products.find((item) => item.name === "registered device") || {
              quantity: 0,
            }
          : { quantity: 0 };
        const callSessionRecord = products
          ? products.find(
              (item) => item.name === "concurrent call session",
            ) || { quantity: 0 }
          : { quantity: 0 };
        const quantity =
          (userData.account.device_to_call_ratio || 0) *
            (callSessionRecord.quantity || 0) +
          (registeredDeviceRecord.quantity || 0);
        const { trial_end_date, is_active } = userData.account || {};
        switch (pType) {
          case PlanType.TRIAL:
            setSubscriptionDescription(
              `You are currently on the Free plan (trial period). You are limited to ${
                callSessionRecord.quantity
              } simultaneous calls and ${quantity} registered devices.${
                trial_end_date
                  ? ` Your free trial will end on ${dayjs(
                      trial_end_date,
                    ).format("MMM DD, YYYY")}.`
                  : ""
              }`,
            );
            break;
          case PlanType.PAID:
            if (invoice) {
              setSubscriptionDescription(
                `Your paid subscription includes capacity for ${
                  callSessionRecord.quantity
                } simultaneous calls, and ${quantity} registered devices. You are billed ${
                  CurrencySymbol[invoice.currency || "usd"]
                }${(invoice.total || 0) / 100} on ${dayjs
                  .unix(Number(invoice.next_payment_attempt))
                  .format("MMM DD, YYYY")}.`,
              );
            }

            break;
          case PlanType.FREE:
            if (is_active) {
              setSubscriptionDescription(
                `You are currently on the Free plan (trial period expired). You are limited to ${callSessionRecord.quantity} simultaneous calls and ${quantity} registered devices`,
              );
            } else {
              setSubscriptionDescription(
                "Your free trial has expired.  Please upgrade your subscription to a paid plan to continue service",
              );
            }
            break;
        }
        // Make sure Account page is alway scroll to top to see subscription
        window.scrollTo(0, 0);
      }
    }, [userData, invoice]);
  }

  const updateBucketTags = (
    index: number,
    key: string,
    value: (typeof bucketTags)[number][keyof AwsTag],
  ) => {
    setBucketTags(
      bucketTags.map((b, i) => (i === index ? { ...b, [key]: value } : b)),
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
      {ENABLE_HOSTED_SYSTEM && (
        <>
          <Section>
            <H1 className="h5">Your Subscription</H1>
            <P>{subscriptionDescription}</P>
            <br />

            <div className="mast">
              <ButtonGroup left>
                <Button
                  type="button"
                  mainStyle="hollow"
                  subStyle="grey"
                  small
                  onClick={() => setIsDeleteAccount(true)}
                >
                  Delete Account
                </Button>
              </ButtonGroup>
              <ButtonGroup right>
                {userData?.account?.plan_type === PlanType.PAID ? (
                  <>
                    <Button
                      small
                      as={Link}
                      to={`${ROUTE_INTERNAL_ACCOUNTS}/${user?.account_sid}/manage-payment`}
                    >
                      Manage Payment Info
                    </Button>
                    <Button
                      small
                      as={Link}
                      to={`${ROUTE_INTERNAL_ACCOUNTS}/${user?.account_sid}/modify-subscription`}
                    >
                      Modify My Subscription
                    </Button>
                  </>
                ) : (
                  <Button
                    as={Link}
                    to={`${ROUTE_INTERNAL_ACCOUNTS}/${user?.account_sid}/subscription`}
                  >
                    Upgrade to a Paid Subscription
                  </Button>
                )}
              </ButtonGroup>
            </div>
          </Section>
          {isDeleteAccount && (
            <Section slim>
              <form
                className={`form form--internal ${
                  !account?.data && account?.refetch ? "form--blur" : ""
                }`}
                onSubmit={handleDeleteAccount}
              >
                <fieldset>
                  <H1 className="h4">Delete Account</H1>
                  <P>
                    <span>
                      <strong>Warning!</strong>
                    </span>{" "}
                    This will permantly delete all of your data from our
                    database. You will not be able to restore your account. You
                    must {requiresPassword && "provide your password and"} type
                    “delete my account” into the Delete Message field.
                  </P>
                </fieldset>
                <fieldset>
                  {requiresPassword && (
                    <>
                      <label htmlFor="password">
                        Password<span>*</span>
                      </label>
                      <Passwd
                        id="delete_account_password"
                        name="delete_account_password"
                        value={deleteAccountPasswd}
                        placeholder="Password"
                        required
                        onChange={(e) => {
                          setDeleteAccountPasswd(e.target.value);
                        }}
                      />
                    </>
                  )}
                  <label htmlFor="deleteMessage">
                    Delete Message<span>*</span>
                  </label>
                  <input
                    id="deleteMessage"
                    required
                    type="text"
                    name="deleteMessage"
                    placeholder="Delete Message"
                    value={deleteMessage}
                    ref={deleteMessageRef}
                    onChange={(e) => setDeleteMessage(e.target.value)}
                  />
                </fieldset>
                <fieldset>
                  <ButtonGroup right>
                    <Button
                      subStyle="grey"
                      type="button"
                      onClick={() => setIsDeleteAccount(false)}
                      small
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={isDisableDeleteAccountButton}
                      small
                    >
                      PERMANENTLY DELETE MY ACCOUNT
                    </Button>
                  </ButtonGroup>
                </fieldset>
              </form>
            </Section>
          )}
          {(!userCarriers ||
            userCarriers.length === 0 ||
            !userSpeechs ||
            userSpeechs.length === 0) && (
            <Section>
              <H1 className="h5">Finish Account Setup</H1>
              <H1 className="h6">To do</H1>
              {(!userCarriers || userCarriers.length === 0) && (
                <>
                  <br />
                  <div>
                    <span>
                      <Icons.Edit />
                      Add a <Link to="/internal/carriers">carrier</Link> to
                      route calls
                    </span>
                  </div>
                </>
              )}
              {(!userSpeechs || userSpeechs.length === 0) && (
                <>
                  <br />
                  <div>
                    <span>
                      <Icons.Edit />
                      Add <Link to="/internal/speech-services">
                        speech
                      </Link>{" "}
                      credentials for text-to-speech and speech-to-text
                    </span>
                  </div>
                </>
              )}
            </Section>
          )}
        </>
      )}
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
          {!ENABLE_HOSTED_SYSTEM && (
            <fieldset>
              <LocalLimits
                data={limits && limits.data}
                limits={[localLimits, setLocalLimits]}
              />
            </fieldset>
          )}
          <fieldset>
            <label htmlFor="sip_realm">SIP realm</label>
            {ENABLE_HOSTED_SYSTEM ? (
              <EditBoard
                id="sip_realm"
                name="sip_realm"
                text={realm}
                title="Change SIP Realm"
                path={`/internal/accounts/${user?.account_sid}/sip-realm/edit`}
              />
            ) : (
              <input
                id="sip_realm"
                type="text"
                name="sip_realm"
                placeholder="The domain name that SIP devices will register with"
                value={realm}
                onChange={(e) => setRealm(e.target.value)}
              />
            )}
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
                      (app) => app.account_sid === account.data!.account_sid,
                    )}
                  />
                </fieldset>
              );
            })}
          {webhooks.map((webhook) => {
            const selectOptions = WEBHOOK_METHODS.filter((wm) =>
              webhook.prefix === "queue_event_hook" ? wm.name !== "GET" : true,
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
          {ttsCache && (
            <fieldset>
              <ButtonGroup left>
                <Button
                  onClick={(e: React.FormEvent) => {
                    e.preventDefault();
                    setClearTtsCacheFlag(true);
                  }}
                  small
                  disabled={ttsCache.data?.size === 0}
                >
                  Clear TTS Cache
                </Button>
              </ButtonGroup>
              <MS>{`There are ${
                ttsCache.data ? ttsCache.data.size : 0
              } cached TTS prompts`}</MS>
            </fieldset>
          )}
          <ScopedAccess scope={Scope.admin} user={user}>
            <fieldset>
              <label htmlFor="enable_debug_log" className="chk">
                <input
                  id="enable_debug_log"
                  name="enable_debug_log"
                  type="checkbox"
                  onChange={(e) => setEnableDebugLog(e.target.checked)}
                  checked={enableDebugLog}
                />
                <Tooltip text="You can enable debug log for calls only to this account">
                  Enable debug log for this account
                </Tooltip>
              </label>
            </fieldset>
          </ScopedAccess>
          {!DISABLE_CALL_RECORDING && (
            <>
              <fieldset>
                <Checkzone
                  hidden
                  name="bucket_credential"
                  label="Enable call recording"
                  initialCheck={initialCheckRecordAllCall}
                  handleChecked={(e) => {
                    setBucketCredentialChecked(e.target.checked);
                  }}
                >
                  <div>
                    <label htmlFor="audio_format">Audio Format</label>
                    <Selector
                      id={"audio_format"}
                      name={"audio_format"}
                      value={recordFormat}
                      options={AUDIO_FORMAT_OPTIONS}
                      onChange={(e) => {
                        setRecordFormat(e.target.value);
                      }}
                    />
                  </div>
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
                  {bucketVendor === BUCKET_VENDOR_S3_COMPATIBLE && (
                    <>
                      <label htmlFor="endpoint">
                        Endpoint URI<span>*</span>
                      </label>
                      <input
                        id="endpoint"
                        required
                        type="text"
                        name="endpoint"
                        placeholder="https://domain.com"
                        value={endpoint}
                        onChange={(e) => {
                          setEndpoint(e.target.value);
                          setTmpEndpoint(e.target.value);
                        }}
                      />
                      <label htmlFor="endpoint">Region (Optional)</label>
                      <input
                        id="aws_compatible_region"
                        type="text"
                        name="aws_compatible_region"
                        placeholder="us-east-1"
                        value={s3CompatibleRegion}
                        onChange={(e) => {
                          setS3CompatibleRegion(e.target.value);
                          setTmpS3CompatibleRegion(e.target.value);
                        }}
                      />
                    </>
                  )}
                  <label htmlFor="bucket_name">
                    {bucketVendor === BUCKET_VENDOR_AZURE
                      ? "Container"
                      : "Bucket"}{" "}
                    Name<span>*</span>
                  </label>
                  <input
                    id="bucket_name"
                    required
                    type="text"
                    name="bucket_name"
                    placeholder={
                      bucketVendor === BUCKET_VENDOR_AZURE
                        ? "Container"
                        : "Bucket"
                    }
                    value={bucketName}
                    onChange={(e) => {
                      setBucketName(e.target.value);
                      setTmpBucketName(e.target.value);
                    }}
                  />
                  {(bucketVendor === BUCKET_VENDOR_AWS ||
                    bucketVendor === BUCKET_VENDOR_S3_COMPATIBLE) && (
                    <>
                      {bucketVendor === BUCKET_VENDOR_AWS &&
                        regions &&
                        regions["aws"] && (
                          <>
                            <label htmlFor="bucket_aws_region">
                              Region<span>*</span>
                            </label>
                            <Selector
                              id="region"
                              name="region"
                              value={bucketRegion}
                              required
                              options={[
                                {
                                  name: "Select a region",
                                  value: "",
                                },
                              ].concat(regions["aws"])}
                              onChange={(e) => {
                                setBucketRegion(e.target.value);
                                setTmpBucketRegion(e.target.value);
                              }}
                            />
                          </>
                        )}
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
                    </>
                  )}
                  {bucketVendor === BUCKET_VENDOR_GOOGLE && (
                    <>
                      <label htmlFor="google_service_key">
                        Service key<span>*</span>
                        <Tooltip text="Provide a JSON key for a Service Account with APIs enabled for Cloud Storage and Storage Transfer API">
                          {" "}
                        </Tooltip>
                      </label>
                      <FileUpload
                        id="google_service_key"
                        name="google_service_key"
                        handleFile={handleFile}
                        placeholder="Choose a file"
                        required={!bucketGoogleServiceKey}
                      />
                      {bucketGoogleServiceKey && (
                        <pre>
                          <code>
                            {JSON.stringify(
                              getObscuredGoogleServiceKey(
                                bucketGoogleServiceKey,
                              ),
                              null,
                              2,
                            )}
                          </code>
                        </pre>
                      )}
                    </>
                  )}
                  {bucketVendor === BUCKET_VENDOR_AZURE && (
                    <>
                      <label htmlFor="bucket_azure_connection_string">
                        Connection String<span>*</span>
                      </label>
                      <input
                        id="bucket_azure_connection_string"
                        required
                        type="text"
                        name="bucket_azure_connection_string"
                        placeholder="Connection string"
                        value={azureConnectionString}
                        onChange={(e) => {
                          setAzureConnectionString(e.target.value);
                          setTmpAzureConnectionString(e.target.value);
                        }}
                      />
                    </>
                  )}
                  <label htmlFor="aws_s3_tags">
                    {bucketVendor === BUCKET_VENDOR_AWS ||
                    bucketVendor === BUCKET_VENDOR_S3_COMPATIBLE
                      ? "S3"
                      : bucketVendor === BUCKET_VENDOR_GOOGLE
                        ? "Google Cloud Storage"
                        : bucketVendor === BUCKET_VENDOR_AZURE
                          ? "Azure Cloud Storage"
                          : ""}{" "}
                    Tags
                  </label>
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
                                updateBucketTags(i, "Value", e.target.value);
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
                              bucketTags.filter((g2, i2) => i2 !== i),
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
                        (bucketVendor === BUCKET_VENDOR_AWS &&
                          (!bucketAccessKeyId || !bucketSecretAccessKey)) ||
                        (bucketVendor === BUCKET_VENDOR_GOOGLE &&
                          !bucketGoogleServiceKey) ||
                        (bucketVendor === BUCKET_VENDOR_AZURE &&
                          !azureConnectionString) ||
                        (bucketVendor === BUCKET_VENDOR_S3_COMPATIBLE &&
                          (!endpoint ||
                            !bucketAccessKeyId ||
                            !bucketSecretAccessKey))
                      }
                    >
                      Test
                    </Button>
                  </ButtonGroup>
                  <label htmlFor="record_all_call" className="chk">
                    <input
                      id="record_all_call"
                      name="record_all_call"
                      type="checkbox"
                      onChange={(e) => setRecordAllCalls(e.target.checked)}
                      checked={recordAllCalls}
                    />
                    <Tooltip text="You can also record calls only to specific applications">
                      Record all calls for this account
                    </Tooltip>
                  </label>
                </Checkzone>
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
              {user?.scope != USER_ACCOUNT && (
                <Button
                  small
                  subStyle="grey"
                  as={Link}
                  to={ROUTE_INTERNAL_ACCOUNTS}
                >
                  Cancel
                </Button>
              )}

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
      {clearTtsCacheFlag && (
        <Modal
          handleSubmit={handleClearCache}
          handleCancel={() => setClearTtsCacheFlag(false)}
        >
          <P>Are you sure you want to clean TTS cache for this account?</P>
        </Modal>
      )}
      {isShowModalLoader && (
        <ModalLoader>
          <P>
            Your requested changes are being processed. Please do not leave the
            page or hit the back button until complete.
          </P>
        </ModalLoader>
      )}
    </>
  );
};
