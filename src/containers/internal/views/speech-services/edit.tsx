import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import { SpeechServiceForm } from "./form";

import type { SpeechCredential } from "src/api/types";

export const EditSpeechService = () => {
  const params = useParams();
  const [data, refetch, error] = useServiceProviderData<SpeechCredential>(
    `SpeechCredentials/${params.speech_credential_sid}`
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
