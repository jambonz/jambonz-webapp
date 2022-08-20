import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError, useSelectState } from "src/store";
import { SpeechServiceForm } from "./form";

import type { Account, SpeechCredential } from "src/api/types";

export const EditSpeechService = () => {
  const params = useParams();
  const currentServiceProvider = useSelectState("currentServiceProvider");

  const [data, refetch, error] = useApiData<SpeechCredential>(
    `ServiceProviders/${currentServiceProvider?.service_provider_sid}/SpeechCredentials/${params.speech_credential_sid}`
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
        currentServiceProvider={currentServiceProvider}
        credential={{ data, refetch, error }}
      />
    </>
  );
};

export default EditSpeechService;
