import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData } from "src/api";
import { toastError } from "src/store";
import { ApplicationForm } from "./form";

import type { Application } from "src/api/types";

export const EditApplication = () => {
  const params = useParams();
  const [data, refetch, error] = useApiData<Application>(
    `Applications/${params.application_sid}`
  );

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit Application</H1>
      <ApplicationForm application={{ data, refetch, error }} />
    </>
  );
};

export default EditApplication;
