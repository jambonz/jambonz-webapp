import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError, useSelectState } from "src/store";
import { SpeechServiceForm } from "./form";

import type { SpeechCredential } from "src/api/types";
import { USER_ACCOUNT } from "src/api/constants";
import { useScopedRedirect } from "src/utils/use-scoped-redirect";
import { Scope } from "src/store/types";
import { ROUTE_INTERNAL_SPEECH } from "src/router/routes";
import { useNavigate, useParams } from "react-router-dom";

export const EditSpeechService = () => {
  const params = useParams();
  const navigate = useNavigate();
  const user = useSelectState("user");

  const [data, refetch, error] =
    user && user.scope !== USER_ACCOUNT
      ? useServiceProviderData<SpeechCredential>(
          `SpeechCredentials/${params.speech_credential_sid}`
        )
      : useApiData<SpeechCredential>(
          `Accounts/${user?.account_sid}/SpeechCredentials/${params.speech_credential_sid}`
        );

  useScopedRedirect(
    Scope.account,
    ROUTE_INTERNAL_SPEECH,
    user,
    "You do not have access to this resource",
    data
  );

  useEffect(() => {
    if (error) {
      toastError(error.msg || "No access.");
      navigate(ROUTE_INTERNAL_SPEECH);
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
