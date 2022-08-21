import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useNavigate } from "react-router-dom";

import { useServiceProviderData } from "src/api";
import { PhoneNumberForm } from "./form";

import type { Account } from "src/api/types"; // voip type also
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_CARRIERS,
} from "src/router/routes";
import { toastError } from "src/store";

export const AddPhoneNumber = () => {
  const navigate = useNavigate();

  const voipCarriers = 1;
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  useEffect(() => {
    if (accounts) {
      if (accounts.length === 0) {
        toastError(
          "You must create an account before you can create a phone number."
        );
        navigate(ROUTE_INTERNAL_ACCOUNTS);
      }

      if (!voipCarriers) {
        toastError(
          "You must create a SIP trunk before you can create a phone number."
        );
        navigate(ROUTE_INTERNAL_CARRIERS);
      }
    }
  }, [accounts]);

  return (
    <>
      <H1>Add a phone number</H1>
      <PhoneNumberForm
        accounts={accounts}
        // voipCarriers={voipCarriers}
      />
    </>
  );
};

export default AddPhoneNumber;
