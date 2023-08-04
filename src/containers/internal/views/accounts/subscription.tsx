import React from "react";
import {
  ENABLE_HOSTED_SYSTEM,
  STRIPE_PUBLISHABLE_KEY,
} from "src/api/constants";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionForm from "./subscription-form";

export const stripePromise = ENABLE_HOSTED_SYSTEM
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

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
