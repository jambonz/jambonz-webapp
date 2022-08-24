import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import { PhoneNumberForm } from "./form";

import type {
  Account,
  Application,
  PhoneNumber,
  VoipCarrier,
} from "src/api/types";

export const EditPhoneNumber = () => {
  const params = useParams();

  const [data, refetch, error] = useApiData<PhoneNumber>(
    `PhoneNumbers/${params.phone_number_sid}`
  );

  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");
  const [phoneNumbers] = useServiceProviderData<PhoneNumber[]>("PhoneNumbers");
  const [voipCarriers] = useApiData<VoipCarrier[]>("VoipCarriers");

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1>Edit phone number</H1>
      <PhoneNumberForm
        accounts={accounts}
        applications={applications}
        phoneNumber={{ data, refetch, error }}
        phoneNumbers={phoneNumbers}
        voipCarriers={voipCarriers}
      />
    </>
  );
};

export default EditPhoneNumber;
