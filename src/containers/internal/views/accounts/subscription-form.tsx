import { Button, ButtonGroup, H1, P } from "@jambonz/ui-kit";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { postSubscriptions, useApiData } from "src/api";
import { CurrencySymbol } from "src/api/constants";
import {
  BillingChange,
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

const SubscriptionForm = () => {
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const [priceInfo] = useApiData<PriceInfo[]>("/Prices");
  const [userStripeInfo] = useApiData<StripeCustomerId>("/StripeCustomerId");
  const [total, setTotal] = useState(0);
  const [cardErrorCase, setCardErrorCase] = useState(false);
  const [isReviewChanges, setIsReviewChanges] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isModifySubscription = location.pathname.includes(
    "modify-subscription"
  );
  const [billingChange] = useState<BillingChange>({
    prorated_cost: 10,
    monthly_cost: 10,
  });

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
            stripe
              .confirmPayment({
                clientSecret: json.client_secret || "",
                confirmParams: {
                  return_url: `${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`,
                },
              })
              .then((error) => {
                if (error) {
                  toastError(error.error.message || "");
                  return;
                }
              });
          }
        } else if (json.status === "card error") {
          setCardErrorCase(true);
        }
      })
      .catch((error) => {
        toastError(error.msg || "Something went wrong, please try again.");
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isModifySubscription) {
      setIsReviewChanges(true);
      return;
    }
    if (!stripe || !elements) {
      return;
    }
    const { error: elementsError } = await elements.submit();
    if (elementsError) {
      toastError(elementsError.message || "");
    }
    const card = elements.getElement(PaymentElement);
    if (!card) {
      return;
    }
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      element: card,
    });
    if (error) {
      toastError(error.message || "");
      return;
    }

    createSubscription(paymentMethod);
  };

  const handleReturnToFreePlan = () => {
    console.log("will implement soon");
  };

  const handleDeleteAccount = () => {
    console.log("will implement soon");
  };

  const handleReviewChangeSubmit = () => {
    console.log("will implement soon");
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

  const initFeesAndCost = (priceData: PriceInfo[]) => {
    serviceData.forEach((service) => {
      const record = priceData.find(
        (item) => item.category === service.category
      );

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
  }, [priceInfo, userData]);

  useEffect(() => {
    setTotal(serviceData.reduce((res, service) => res + service.cost || 0, 0));
  }, [serviceData]);

  return (
    <>
      <H1 className="h2">
        {isModifySubscription
          ? "Configure Your Subscription"
          : "Upgrade your Subscription"}
      </H1>
      {isReviewChanges && (
        <Modal
          handleCancel={() => setIsReviewChanges(false)}
          handleSubmit={handleReviewChangeSubmit}
        >
          <H1 className="h4">Confirm Changes</H1>
          <P>
            By pressing &ldquo;Confirm Changes&rdquo; below, your plan will be
            immediately adjusted to the following levels:
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
            {billingChange.prorated_cost > 0 &&
              `Your new monthly charge will be $${
                billingChange.monthly_cost / 100
              }, and you will immediately be charged a one-time prorated amount of $${
                billingChange.prorated_cost / 100
              } to cover the remainder of the current billing period.`}
            {billingChange.prorated_cost === 0 &&
              `Your monthly charge will be $${
                billingChange.monthly_cost / 100
              }.`}
            {billingChange.prorated_cost < 0 &&
              `Your new monthly charge will be $${
                billingChange.monthly_cost / 100
              }, and you will receive a credit of $${
                -billingChange.prorated_cost / 100
              } on your next invoice to reflect changes made during the current billing period.`}
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
                              Number(e.target.value)
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
                      subStyle="grey"
                      mainStyle="hollow"
                      onClick={handleReturnToFreePlan}
                    >
                      Return to free plan
                    </Button>

                    <Button
                      mainStyle="hollow"
                      subStyle="grey"
                      onClick={handleDeleteAccount}
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
                  >
                    Cancel
                  </Button>

                  <Button type="submit">
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
    </>
  );
};

export default SubscriptionForm;
