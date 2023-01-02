import React, { useEffect, useState } from "react";
import { H1 } from "jambonz-ui";

import { useApiData } from "src/api";
import { toastError, useSelectState } from "src/store";
import { SpeechServiceForm } from "./form";

import type { SpeechCredential } from "src/api/types";
import { USER_ACCOUNT } from "src/api/constants";
import { useScopedRedirect } from "src/utils/use-scoped-redirect";
import { Scope } from "src/store/types";
import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import { useParams } from "react-router-dom";

export const EditSpeechService = () => {
  const params = useParams();
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [url, setUrl] = useState("");
  const [data, refetch, error] = useApiData<SpeechCredential>(url);

  useScopedRedirect(
    Scope.account,
    ROUTE_INTERNAL_SPEECH,
    user,
    "You do not have access to this resource",
    data
  );

  const getUrlForSpeech = () => {
    if (user && user?.scope === USER_ACCOUNT) {
      setUrl(
        `Accounts/${user?.account_sid}/SpeechCredentials/${params.speech_credential_sid}`
      );
    } else {
      setUrl(
        `ServiceProviders/${currentServiceProvider?.service_provider_sid}/SpeechCredentials/${params.speech_credential_sid}`
      );
    }
  };

  useEffect(() => {
    getUrlForSpeech();
    if (error) {
      toastError(error.msg);
    }
  }, [error, data, url]);

  return (
    <>
      <H1 className="h2">Edit Speech Service</H1>
      <SpeechServiceForm credential={{ data, refetch, error }} />
    </>
  );
};

export default EditSpeechService;
