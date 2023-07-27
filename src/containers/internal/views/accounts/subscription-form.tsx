import { Button, ButtonGroup, H1, P } from "@jambonz/ui-kit";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteAccount, postSubscriptions, useApiData } from "src/api";
import { CurrencySymbol } from "src/api/constants";
import {
  CurrentUserData,
  PriceInfo,
  ServiceData,
  StripeCustomerId,
  Subscription,
} from "src/api/types";
import { Modal, Section } from "src/components";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { hasValue } from "src/utils";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { PaymentMethod } from "@stripe/stripe-js";
import { toastError, toastSuccess } from "src/store";
import { Passwd } from "src/components/forms";
import { useAuth } from "src/router/auth";
import { ModalLoader } from "src/components/modal";

const SubscriptionForm = () => {
  const { signout } = useAuth();
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const [priceInfo] = useApiData<PriceInfo[]>("/Prices");
  const [userStripeInfo] = useApiData<StripeCustomerId>("/StripeCustomerId");
  const [total, setTotal] = useState(0);
  const [cardErrorCase, setCardErrorCase] = useState(false);
  const [isReviewChanges, setIsReviewChanges] = useState(false);
  const [isReturnToFreePlan, setIsReturnToFreePlan] = useState(false);
  const [isDeleteAccount, setIsDeleteAccount] = useState(false);
  const [deleteAccountPasswd, setDeleteAccountPasswd] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const deleteMessageRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isModifySubscription = location.pathname.includes(
    "modify-subscription"
  );
  const [billingCharge, setBillingCharge] = useState<Subscription | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(true);
  const [isShowModalLoader, setIsShowModalLoader] = useState(false);
  const [isDisableSubmitButton, setIsDisableSubmitButton] =
    useState(isModifySubscription);
  const [isDisableDeleteAccountButton, setIsDisableDeleteAccountButton] =
    useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const createSubscription = async (paymentMethod: PaymentMethod) => {
    let body: Subscription = {};

    if (cardErrorCase) {
      body = {
        action: "update-payment-method",
        payment_method_id: paymentMethod.id,
      };
    } else {
      body = {
        action: "upgrade-to-paid",
        payment_method_id: paymentMethod.id,
        stripe_customer_id: userStripeInfo?.stripe_customer_id,
        products: serviceData.map((service) => ({
          price_id: service.stripe_price_id,
          product_sid: service.product_sid,
          quantity: service.capacity || 0,
        })),
      };
    }

    postSubscriptions(body)
      .then(({ json }) => {
        if (json.status === "success") {
          toastSuccess("Payment completed successfully");
          navigate(
            `${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`
          );
        } else if (json.status === "action required") {
          if (stripe) {
            const location = window.location;
            stripe
              .confirmPayment({
                clientSecret: json.client_secret || "",
                confirmParams: {
                  return_url: `${location.protocol}//${location.host}${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`,
                },
              })
              .then((error) => {
                if (error) {
                  toastError(error.error.message || "");
                  return;
                }
              })
              .finally(() => {
                setIsDisableSubmitButton(false);
                setIsShowModalLoader(false);
              });
          }
        } else if (json.status === "card error") {
          setIsDisableSubmitButton(false);
          setIsShowModalLoader(false);
          setCardErrorCase(true);
        }
      })
      .catch((error) => {
        setIsDisableSubmitButton(false);
        setIsShowModalLoader(false);
        toastError(error.msg || "Something went wrong, please try again.");
      });
  };

  const retrieveBillingChanges = async () => {
    const updatedProducts = serviceData.map((product) => ({
      price_id: product.stripe_price_id,
      product_sid: product.product_sid,
      quantity: product.capacity || 0,
    }));

    postSubscriptions({
      action: "update-quantities",
      dry_run: true,
      products: updatedProducts,
    })
      .then(({ json }) => {
        setBillingCharge(json);
        setIsReviewChanges(true);
      })
      .catch((error) => {
        toastError(error.msg || "Something went wrong, please try again.");
        setIsDisableSubmitButton(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsDisableSubmitButton(true);
    if (isModifySubscription) {
      retrieveBillingChanges();
      return;
    }
    setIsShowModalLoader(true);
    const { error: elementsError } = await elements.submit();
    if (elementsError) {
      setIsDisableSubmitButton(false);
      setIsShowModalLoader(false);
      toastError(elementsError.message || "");
      return;
    }
    const card = elements.getElement(PaymentElement);
    if (!card) {
      setIsDisableSubmitButton(false);
      setIsShowModalLoader(false);
      return;
    }
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      element: card,
    });
    if (error) {
      setIsDisableSubmitButton(false);
      setIsShowModalLoader(false);
      toastError(error.message || "");
      return;
    }

    createSubscription(paymentMethod);
  };

  const handleReturnToFreePlan = () => {
    setIsReturnToFreePlan(false);
    setIsShowModalLoader(true);
    const body: Subscription = {
      action: "downgrade-to-free",
    };

    postSubscriptions(body)
      .then(() => {
        toastSuccess("Downgrade to free plan completed successfully");
        navigate(
          `${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`
        );
      })
      .catch((error) => {
        toastError(error.msg);
      })
      .finally(() => setIsShowModalLoader(false));
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteMessage !== "delete my account") {
      toastError(
        "You must type the delete message correctly in order to delete your account."
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

  const handleReviewChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsShowModalLoader(true);

    const updatedProducts = serviceData.map((product) => ({
      price_id: product.stripe_price_id,
      product_sid: product.product_sid,
      quantity: product.capacity,
    }));

    postSubscriptions({
      action: "update-quantities",
      products: updatedProducts,
    })
      .then(() => {
        toastSuccess(
          "Your subscription capacity has been successfully modified."
        );
        navigate(
          `${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`
        );
      })
      .catch(() => {
        toastError(
          `The additional capacity you that you requested could not be granted due to a failure processing payment.
          Please configure a valid credit card for your account and the upgrade will be automatically processed`
        );
      })
      .finally(() => {
        setIsShowModalLoader(false);
        setIsDisableSubmitButton(false);
      });
  };
  // subscription categories
  const [serviceData, setServiceData] = useState<ServiceData[]>([
    {
      category: "voice_call_session",
      name: "concurrent call session",
      service: "Maximum concurrent call sessions",
      fees: 0,
      feesLabel: "",
      cost: 0,
      capacity: 0,
      invalid: false,
      currency: "usd",
      min: 5,
      max: 1000,
      dirty: false,
      visible: true,
      required: true,
    },
    {
      category: "device",
      name: "registered device",
      service: "Additional device registrations",
      fees: 0,
      feesLabel: "",
      cost: 0,
      capacity: 0,
      invalid: false,
      currency: "usd",
      min: 0,
      max: 200,
      dirty: false,
      visible: false,
      required: false,
    },
  ]);
  const [originalServiceData, setOriginalServiceData] = useState<ServiceData[]>(
    []
  );

  const initFeesAndCost = (priceData: PriceInfo[]) => {
    serviceData.forEach((service) => {
      const record = priceData.find(
        (item) => item.category === service.category
      );
      console.log(record);

      if (record) {
        const price = record.prices.find(
          (item) => item.currency === service.currency
        );

        if (price) {
          let fees = 0;
          switch (price.billing_scheme) {
            case "per_unit":
              fees = (price.unit_amount * 1) / 100;
              break;
            default:
              break;
          }
          service.billing_scheme = price.billing_scheme;
          service.stripe_price_id = price.stripe_price_id;
          service.unit_label = record.unit_label;
          service.product_sid = record.product_sid;
          service.stripe_product_id = record.stripe_product_id;
          service.fees = fees;
          service.feesLabel = `${
            CurrencySymbol[service.currency || "usd"]
          }${fees} per ${
            record.unit_label?.slice(0, 3) === "per"
              ? record.unit_label.slice(3)
              : record.unit_label
          }`;
        }
      }
    });

    setServiceData([...serviceData]);
  };

  const getServicePrice = (
    service: ServiceData,
    capacity: number
  ): [number, string, number] => {
    let fees = 0;
    let feesLabel = "";
    let cost = 0;
    const capacityNum = capacity;
    if (service.billing_scheme === "per_unit") {
      fees = service.fees;
      cost = fees * capacityNum;
    } else if (service.billing_scheme === "tiered") {
      const filteredTiers = service.tiers
        ? service.tiers.filter(
            (item) => !item.up_to || item.up_to >= capacityNum
          )
        : [];
      if (filteredTiers.length) {
        const tier = filteredTiers[0];
        if (typeof tier.flat_amount === "number") {
          fees = tier.flat_amount / 100;
          cost = fees;
        } else {
          fees = tier.unit_amount / 100;
          cost = fees * capacityNum;
        }
      }
    }
    feesLabel = `${CurrencySymbol[service.currency || "usd"]}${fees} per ${
      service.unit_label && service.unit_label.slice(0, 3) === "per"
        ? service.unit_label.slice(3)
        : service.unit_label
    }`;

    return [fees, feesLabel, cost];
  };

  const setProductsInfo = (data: CurrentUserData) => {
    const { products } = data.subscription || {};

    const services = serviceData.map((service) => {
      const { quantity } = products
        ? products.find((item) => item.name === service.name) || {}
        : { quantity: null };
      const [fees, feesLabel, cost] = getServicePrice(service, quantity || 0);
      return {
        ...service,
        capacity: quantity || 0,
        invalid: false,
        fees,
        feesLabel,
        cost,
        visible: hasValue(quantity) && quantity > 0,
      };
    });

    setServiceData(services);
    setOriginalServiceData([...services]);
  };

  const updateServiceData = (
    index: number,
    key: string,
    value: typeof serviceData[number][keyof ServiceData]
  ) => {
    setServiceData(
      serviceData.map((g, i) =>
        i === index
          ? {
              ...g,
              [key]: value,
              ...(key === "capacity" && { cost: Number(value) * g.fees }),
            }
          : g
      )
    );
  };

  useEffect(() => {
    if (priceInfo) {
      initFeesAndCost(priceInfo);
    }

    if (userData && priceInfo) {
      setProductsInfo(userData);
    }

    if (userData) {
      setRequiresPassword(userData.user.provider === "local");
    }
  }, [priceInfo, userData]);

  useEffect(() => {
    if (isModifySubscription && originalServiceData.length > 0) {
      console.log(originalServiceData);
      setIsDisableSubmitButton(
        serviceData[0].capacity === originalServiceData[0].capacity &&
          serviceData[1].capacity === originalServiceData[1].capacity
      );
    }
    setTotal(serviceData.reduce((res, service) => res + service.cost || 0, 0));
  }, [serviceData]);

  return (
    <>
      <H1 className="h2">
        {isModifySubscription
          ? "Configure Your Subscription"
          : "Upgrade your Subscription"}
      </H1>
      {isShowModalLoader && (
        <ModalLoader>
          <P>
            Your requested changes are being processed. Please do not leave the
            page or hit the back button until complete.
          </P>
        </ModalLoader>
      )}
      {isReviewChanges && !isShowModalLoader && (
        <Modal
          handleCancel={() => {
            setIsReviewChanges(false);
            setIsDisableSubmitButton(false);
          }}
          handleSubmit={handleReviewChangeSubmit}
        >
          <H1 className="h4">Confirm Changes</H1>
          <P>
            By pressing{" "}
            <span>
              <strong>Confirm</strong>
            </span>{" "}
            below, your plan will be immediately adjusted to the following
            levels:
          </P>
          <ul className="m">
            <li>{`- ${serviceData[0].capacity} simultaneous calls`}</li>
            {userData?.account && userData?.account.device_to_call_ratio && (
              <li>{`- ${
                userData?.account.device_to_call_ratio *
                (serviceData[0].capacity + serviceData[1].capacity)
              } registered devices`}</li>
            )}
          </ul>
          <P>
            {(billingCharge?.prorated_cost || 0) > 0 &&
              `Your new monthly charge will be $${
                (billingCharge?.monthly_cost || 0) / 100
              }, and you will immediately be charged a one-time prorated amount of $${
                (billingCharge?.prorated_cost || 0) / 100
              } to cover the remainder of the current billing period.`}
            {billingCharge?.prorated_cost === 0 &&
              `Your monthly charge will be $${
                (billingCharge.monthly_cost || 0) / 100
              }.`}
            {(billingCharge?.prorated_cost || 0) < 0 &&
              `Your new monthly charge will be $${
                (billingCharge?.monthly_cost || 0) / 100
              }, and you will receive a credit of $${
                -(billingCharge?.prorated_cost || 0) / 100
              } on your next invoice to reflect changes made during the current billing period.`}
          </P>
        </Modal>
      )}
      {isReturnToFreePlan && !isShowModalLoader && (
        <Modal
          handleCancel={() => setIsReturnToFreePlan(false)}
          handleSubmit={handleReturnToFreePlan}
        >
          <H1 className="h4">Return to Free Plan</H1>
          <P>
            Returning to the free plan will reduce your capacity to a maximum of
            1 simultaneous call session and 1 registered device. Your current
            plan and capacity will continue through the rest of the billing
            cycle and your plan change will take effect at the beginning of the
            next billing cycle. Are you sure you want to continue?
          </P>
        </Modal>
      )}
      <Section slim>
        <form className="form form--internal" onSubmit={handleSubmit}>
          <div className="grid grid--col4--users">
            <div className="grid__row grid__th">
              <div>Service</div>
              <div>Capacity</div>
              <div>Price</div>
              <div>Cost</div>
            </div>

            {serviceData &&
              serviceData
                .filter((service) => service.visible)
                .map((service, idx) => (
                  <React.Fragment key={`subscription-${idx}`}>
                    <div className="grid__row">
                      <div>
                        <label htmlFor={service.name || ""}>
                          {service.service}
                          <span>*</span>
                        </label>
                      </div>
                      <div>
                        <input
                          id="tech_prefix"
                          name="tech_prefix"
                          type="number"
                          value={service.capacity}
                          required
                          min={service.min}
                          max={service.max}
                          onChange={(e) => {
                            updateServiceData(
                              idx,
                              "capacity",
                              Number(e.target.value) || ""
                            );
                          }}
                        />
                      </div>

                      <div>
                        <em>{service.feesLabel}</em>
                      </div>

                      <div>
                        <P>
                          <strong>
                            {CurrencySymbol[service.currency || "usd"]}
                            {service.cost}
                          </strong>
                        </P>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
            {serviceData[0].capacity !== 0 && !serviceData[1].visible && (
              <>
                <div className="grid__row">
                  <label htmlFor="max_concurrent_call_sessons">
                    {`With ${
                      serviceData[0].capacity
                    } call sessions you can register ${
                      serviceData[0].capacity *
                      (userData?.account?.device_to_call_ratio || 0)
                    } concurrent devices`}
                  </label>

                  <div>
                    <Button
                      mainStyle="hollow"
                      onClick={() =>
                        setServiceData((prev) => {
                          prev[1].visible = true;
                          return [...prev];
                        })
                      }
                    >
                      Would you like to purchase additional device
                      registrations?
                    </Button>
                  </div>
                </div>
              </>
            )}
            <div className="grid__row">
              <div>
                <label htmlFor="total">Total Monthly Cost</label>
              </div>
              <div></div>
              <div></div>
              <div>
                <P>
                  <strong>
                    {CurrencySymbol[serviceData[0].currency || "usd"]}
                    {total}
                  </strong>
                </P>
              </div>
            </div>
            {!isModifySubscription && (
              <fieldset>
                <label htmlFor="total">Payment Information</label>
                <div className="grid__row">
                  <div></div>
                  <div>
                    <PaymentElement />
                  </div>
                </div>
              </fieldset>
            )}
          </div>
          <fieldset>
            <>
              <div className={isModifySubscription ? "mast" : ""}>
                {isModifySubscription && (
                  <ButtonGroup right>
                    <Button
                      type="button"
                      subStyle="grey"
                      mainStyle="hollow"
                      onClick={() => setIsReturnToFreePlan(true)}
                      small
                    >
                      Return to free plan
                    </Button>

                    <Button
                      type="button"
                      mainStyle="hollow"
                      subStyle="grey"
                      onClick={() => setIsDeleteAccount(true)}
                      small
                    >
                      Delete Account
                    </Button>
                  </ButtonGroup>
                )}

                <ButtonGroup right>
                  <Button
                    subStyle="grey"
                    as={Link}
                    to={`${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`}
                    small
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={isDisableSubmitButton} small>
                    {isModifySubscription
                      ? "Review Changes"
                      : `Pay ${CurrencySymbol[serviceData[0].currency || "usd"]}
                ${total} and Upgrade to Paid Plan`}
                  </Button>
                </ButtonGroup>
              </div>
            </>
          </fieldset>
        </form>
      </Section>
      {isDeleteAccount && (
        <Section slim>
          <form className="form form--internal" onSubmit={handleDeleteAccount}>
            <fieldset>
              <H1 className="h4">Delete Account</H1>
              <P>
                <span>
                  <strong>Warning!</strong>
                </span>{" "}
                This will permantly delete all of your data from our database.
                You will not be able to restore your account. You must{" "}
                {requiresPassword && "provide your password and"} type “delete
                my account” into the Delete Message field.
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
    </>
  );
};

export default SubscriptionForm;
