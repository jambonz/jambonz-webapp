import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import { SpeechServiceForm } from "./form";

import type { Account, SpeechCredential } from "src/api/types";

export const EditSpeechService = () => {
  const params = useParams();

  const [data, refetch, error] = useServiceProviderData<SpeechCredential>(
    `SpeechCredentials/${params.speech_credential_sid}`
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
      <SpeechServiceForm
        accounts={accounts}
        credential={{ data, refetch, error }}
      />
    </>
  );
};

export default EditSpeechService;