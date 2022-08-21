import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import { PhoneNumberForm } from "./form";

import { Account, PhoneNumber } from "src/api/types";

export const EditPhoneNumber = () => {
  const params = useParams();

  // const [data, refetch, error] = useServiceProviderData<SpeechCredential>(
  //   `SpeechCredentials/${params.speech_credential_sid}`
  // );
  const [data, refetch, error] = useApiData<PhoneNumber>(
    `PhoneNumbers/${params.sid}`
  );
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1>Edit Application</H1>
      <PhoneNumberForm
        accounts={accounts}
        phoneNumber={{ data, refetch, error }}
      />
    </>
  );
};

export default EditPhoneNumber;
