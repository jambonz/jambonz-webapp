import { Button, ButtonGroup, H1, P } from "@jambonz/ui-kit";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postSubscriptions, useApiData } from "src/api";
import { CurrentUserData, Subscription } from "src/api/types";
import { Section } from "src/components";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { PaymentMethod } from "@stripe/stripe-js";
import { ModalLoader } from "src/components/modal";

export const ManagePaymentForm = () => {
  const user = useSelectState("user");
  const stripe = useStripe();
  const elements = useElements();
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const [isChangePayment, setIsChangePayment] = useState(false);
  const [isSavingNewCard, setIsSavingNewCard] = useState(false);
  const [isShowModalLoader, setIsShowModalLoader] = useState(false);
  const navigate = useNavigate();

  const createSubscription = async (paymentMethod: PaymentMethod) => {
    const body: Subscription = {
      action: "update-payment-method",
      payment_method_id: paymentMethod.id,
    };

    postSubscriptions(body)
      .then(({ json }) => {
        if (json.status === "success") {
          toastSuccess("Payment completed successfully");
          navigate(
            `${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`,
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
                setIsSavingNewCard(false);
                setIsShowModalLoader(false);
              });
          }
        } else if (json.status === "card error") {
          setIsSavingNewCard(false);
          setIsShowModalLoader(false);
          toastError(json.reason || "Something went wrong, please try again.");
        }
      })
      .catch((error) => {
        toastError(error.msg || "Something went wrong, please try again.");
      })
      .finally(() => {
        setIsSavingNewCard(false);
        setIsShowModalLoader(false);
      });
  };

  const handleSaveNewCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const card = elements.getElement(PaymentElement);
    if (!card) {
      return;
    }
    const { error: elementsError } = await elements.submit();
    if (elementsError) {
      toastError(elementsError.message || "");
      return;
    }
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      element: card,
    });

    if (error) {
      toastError(error.message || "Something went wrong, please try again.");
      return;
    }
    setIsSavingNewCard(true);
    setIsShowModalLoader(true);
    createSubscription(paymentMethod);
  };
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
              small
            >
              Cancel
            </Button>
            <Button onClick={() => setIsChangePayment(true)} small>
              Change Payment Info
            </Button>
          </ButtonGroup>
        </Section>
      )}
      {isChangePayment && (
        <Section>
          <div className="grid--col4--users">
            <H1 className="h3">New Payment Information</H1>
            <div className="grid__row">
              <div></div>
              <div>
                <PaymentElement
                  options={{
                    paymentMethodOrder: ["card"],
                  }}
                />
              </div>
            </div>
          </div>
          <ButtonGroup right>
            <Button
              type="button"
              subStyle="grey"
              onClick={() => setIsChangePayment(false)}
              small
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveNewCard}
              disabled={!stripe || isSavingNewCard}
              small
            >
              Save New Card
            </Button>
          </ButtonGroup>
        </Section>
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

export default ManagePaymentForm;
