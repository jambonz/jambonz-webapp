import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "./subscription";
import ManagePaymentForm from "./manage-payment-form";
import React from "react";

export const ManagePayment = () => {
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
        <ManagePaymentForm />
      </Elements>
    </>
  );
};

export default ManagePayment;
