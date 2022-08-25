import React from "react";
import { H1 } from "jambonz-ui";

import { useApiData, useServiceProviderData } from "src/api";
import { PhoneNumberForm } from "./form";

import type { Account, Application, PhoneNumber, Carrier } from "src/api/types";

export const AddPhoneNumber = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");
  const [phoneNumbers] = useServiceProviderData<PhoneNumber[]>("PhoneNumbers");
  const [carriers] = useApiData<Carrier[]>("VoipCarriers");

  return (
    <>
      <H1>Add a phone number</H1>
      <PhoneNumberForm
        accounts={accounts}
        applications={applications}
        phoneNumbers={phoneNumbers}
        carriers={carriers}
      />
    </>
  );
};

export default AddPhoneNumber;
