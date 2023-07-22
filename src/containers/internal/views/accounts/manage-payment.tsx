import { Button, ButtonGroup, H1 } from "@jambonz/ui-kit";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApiData } from "src/api";
import { CurrentUserData } from "src/api/types";
import { Section } from "src/components";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { useSelectState } from "src/store";
import { stripePromise } from "./subscription";

export const ManagePayment = () => {
  const user = useSelectState("user");
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const [isChangePayment, setIsChangePayment] = useState(false);
  return (
    <>
      <H1 className="h2">Manage Payment Information</H1>
      {userData?.subscription && (
        <Section>
          <H1 className="h3">Current Payment Information</H1>
          <div className="item__details">
            <div className="pre-grid-white">
              <div>Card Type:</div>
              <div>{userData.subscription.card_type}</div>
              <div>Card Number:</div>
              <div>
                {userData.subscription.last4
                  ? `**** **** **** ${userData.subscription.last4}`
                  : ""}
              </div>
              <div>Expiration:</div>
              <div>
                {userData.subscription.exp_year
                  ? `${userData.subscription.exp_month}/${userData.subscription.exp_year}`
                  : ""}
              </div>
            </div>
          </div>
          <ButtonGroup right>
            <Button
              type="button"
              subStyle="grey"
              as={Link}
              to={`${ROUTE_INTERNAL_ACCOUNTS}/${user?.account_sid}/edit`}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsChangePayment(true)}>
              Change Payment Info
            </Button>
          </ButtonGroup>
        </Section>
      )}
      {isChangePayment && (
        <Section>
          <Elements
            stripe={stripePromise}
            options={{
              mode: "setup",
              currency: "usd",
              paymentMethodCreation: "manual",
            }}
          >
            <div className="grid--col4--users">
              <H1 className="h3">New Payment Information</H1>
              <div className="grid__row">
                <div></div>
                <div>
                  <PaymentElement />
                </div>
              </div>
            </div>
          </Elements>
          <ButtonGroup right>
            <Button
              type="button"
              subStyle="grey"
              onClick={() => setIsChangePayment(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsChangePayment(true)}>
              Save New Card
            </Button>
          </ButtonGroup>
        </Section>
      )}
    </>
  );
};

export default ManagePayment;
