import React from "react";
import { H1 } from "jambonz-ui";

import { useApiData, useServiceProviderData } from "src/api";
import { PhoneNumberForm } from "./form";

import { Account, Application, PhoneNumber, VoipCarrier } from "src/api/types";

export const AddPhoneNumber = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");
  const [phoneNumbers] = useServiceProviderData<PhoneNumber[]>("PhoneNumbers");
  const [voipCarriers] = useApiData<VoipCarrier[]>("VoipCarriers");

  return (
    <>
      <H1>Add a phone number</H1>
      <PhoneNumberForm
        accounts={accounts}
        applications={applications}
        phoneNumbers={phoneNumbers}
        voipCarriers={voipCarriers}
      />
    </>
  );
};

export default AddPhoneNumber;
