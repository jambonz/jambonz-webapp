import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError, useSelectState } from "src/store";
import { SpeechServiceForm } from "./form";

import type { SpeechCredential } from "src/api/types";
import { USER_ACCOUNT } from "src/api/constants";

export const EditSpeechService = () => {
  const params = useParams();
  const user = useSelectState("user");

  const [data, refetch, error] =
    user && user.scope !== USER_ACCOUNT
      ? useServiceProviderData<SpeechCredential>(
          `SpeechCredentials/${params.speech_credential_sid}`
        )
      : useApiData<SpeechCredential>(
          `Accounts/${user?.account_sid}/SpeechCredentials/${params.speech_credential_sid}`
        );

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit Speech Service</H1>
      <SpeechServiceForm credential={{ data, refetch, error }} />
    </>
  );
};

export default EditSpeechService;
