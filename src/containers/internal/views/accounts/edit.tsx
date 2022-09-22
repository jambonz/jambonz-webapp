import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { ApiKeys } from "src/containers/internal/api-keys";
import { useApiData } from "src/api";
import { toastError } from "src/store";
import { AccountForm } from "./form";

import type { Account, Application, Limit } from "src/api/types";

export const EditAccount = () => {
  const params = useParams();
  const [data, refetch, error] = useApiData<Account>(
    `Accounts/${params.account_sid}`
  );
  const [limitsData, refetchLimits] = useApiData<Limit[]>(
    `Accounts/${params.account_sid}/Limits`
  );
  const [apps] = useApiData<Application[]>("Applications");

  /** Handle error toast at top level... */
  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit account</H1>
      <AccountForm
        apps={apps}
        account={{ data, refetch, error }}
        limits={{ data: limitsData, refetch: refetchLimits }}
      />
      <ApiKeys
        path={`Accounts/${params.account_sid}/ApiKeys`}
        post={{ account_sid: params.account_sid }}
        label="Account"
      />
    </>
  );
};

export default EditAccount;
