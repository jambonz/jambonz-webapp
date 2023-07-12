import { Button, ButtonGroup, H1, P } from "@jambonz/ui-kit";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiData } from "src/api";
import { CurrencySymbol } from "src/api/constants";
import { CurrentUserData, PriceInfo, ServiceData } from "src/api/types";
import { Section } from "src/components";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { hasValue } from "src/utils";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { Passwd } from "src/components/forms";

export const Subscription = () => {
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const [priceInfo] = useApiData<PriceInfo[]>("/Prices");
  const [total, setTotal] = useState(0);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    focus: "",
  });

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
      min: 1,
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

  function clearNumber(value = "") {
    return value.replace(/\D+/g, "");
  }

  function formatExpirationDate(value: string) {
    const clearValue = clearNumber(value);

    if (clearValue.length >= 3) {
      return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`;
    }

    return clearValue;
  }

  function formatCVC(value: string) {
    const clearValue = clearNumber(value);
    const maxLength = 4;

    return clearValue.slice(0, maxLength);
  }

  function formatCreditCardNumber(value: string) {
    if (!value) {
      return value;
    }
    const clearValue = clearNumber(value);
    const nextValue = `${clearValue.slice(0, 4)} ${clearValue.slice(
      4,
      8
    )} ${clearValue.slice(8, 12)} ${clearValue.slice(12, 16)}`;

    return nextValue.trim();
  }

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
      <H1 className="h2">Upgrade your Subscription</H1>
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
            <fieldset>
              <label htmlFor="total">Payment Information</label>
              <div className="grid__row">
                <div>
                  <input
                    style={{ margin: "5px" }}
                    type="text"
                    name="number"
                    placeholder="Card Number"
                    value={cardInfo.number}
                    onChange={(e) => {
                      setCardInfo((prev) => ({
                        ...prev,
                        number: formatCreditCardNumber(e.target.value),
                      }));
                    }}
                  />
                  <input
                    style={{ margin: "5px" }}
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={cardInfo.name}
                    onChange={(e) => {
                      setCardInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                  />
                  <div style={{ display: "flex" }}>
                    <input
                      style={{ margin: "5px", width: "50%" }}
                      type="text"
                      name="valid"
                      placeholder="DD/MM"
                      value={cardInfo.expiry}
                      onChange={(e) => {
                        setCardInfo((prev) => ({
                          ...prev,
                          expiry: formatExpirationDate(e.target.value),
                        }));
                      }}
                    />
                    <Passwd
                      style={{ margin: "5px" }}
                      id={`cvc`}
                      name={`cvc`}
                      value={cardInfo.cvc}
                      placeholder="CVC"
                      onChange={(e) => {
                        setCardInfo((prev) => ({
                          ...prev,
                          cvc: formatCVC(e.target.value),
                        }));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Cards
                    number={cardInfo.number}
                    expiry={cardInfo.expiry}
                    cvc={cardInfo.cvc}
                    name={cardInfo.name}
                  />
                </div>
              </div>
            </fieldset>
          </div>
          <fieldset>
            <ButtonGroup right>
              <Button
                subStyle="grey"
                as={Link}
                to={`${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`}
              >
                Cancel
              </Button>

              <Button
                as={Link}
                to={`${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`}
              >
                Pay {CurrencySymbol[serviceData[0].currency || "usd"]}
                {total} and Upgrade to Paid Plan
              </Button>
            </ButtonGroup>
          </fieldset>
        </form>
      </Section>
    </>
  );
};

export default Subscription;
