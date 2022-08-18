import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import { ApplicationForm } from "./form";

import type { Application, Account } from "src/api/types";

export const EditApplication = () => {
  const params = useParams();
  const [data, refetch, error] = useApiData<Application>(
    `Applications/${params.application_sid}`
  );
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1>Edit Application</H1>
      <ApplicationForm
        accounts={accounts}
        application={{ data, refetch, error }}
        applications={applications}
      />
    </>
  );
};

export default EditApplication;
