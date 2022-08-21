import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useNavigate } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { PhoneNumberForm } from "./form";

import type { Account, Application, PhoneNumber } from "src/api/types"; // voip type also
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_CARRIERS,
} from "src/router/routes";
import { toastError } from "src/store";

export const AddPhoneNumber = () => {
  const navigate = useNavigate();

  const voipCarriers = 1;
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");
  // this can definitely be moved to the form because it repeats itself in the edit page as well
  const [phoneNumbers] = useServiceProviderData<PhoneNumber[]>("PhoneNumbers");

  useEffect(() => {
    // this logic is handled in the form for application page
    // maybe we can move here instead so add page has more things to do?
    // not only that, it will look less buried in comparison as
    // form inherits lots of stuff, let the higher level do the stuff?
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
        applications={applications}
        phoneNumbers={phoneNumbers}
        // voipCarriers={voipCarriers}
      />
    </>
  );
};

export default AddPhoneNumber;
