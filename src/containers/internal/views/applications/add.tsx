import React from "react";
import { H1 } from "jambonz-ui";

import { useApiData, useServiceProviderData } from "src/api";
import { ApplicationForm } from "./form";

import type { Application, Account } from "src/api/types";

export const AddApplication = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");

  return (
    <>
      <H1>Add an application</H1>
      <ApplicationForm accounts={accounts} applications={applications} />
    </>
  );
};

export default AddApplication;
