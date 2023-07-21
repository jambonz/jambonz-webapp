import React from "react";
import { STRIPE_PUBLISHABLE_KEY } from "src/api/constants";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionForm from "./subscription-form";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const Subscription = () => {
  return (
    <>
      <Elements
        stripe={stripePromise}
        options={{
          mode: "setup",
          currency: "usd",
          paymentMethodCreation: "manual",
        }}
      >
        <SubscriptionForm />
      </Elements>
    </>
  );
};

export default Subscription;
