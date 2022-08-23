import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError, useSelectState } from "src/store";
import { MsTeamsTenantForm } from "./form";

import type { Application, Account, MSTeamsTenant } from "src/api/types";

export const EditMsTeamsTenant = () => {
  const params = useParams();

  const [data, refetch, error] = useApiData<MSTeamsTenant>(
    `MicrosoftTeamsTenants/${params.ms_teams_tenant_sid}`
  );
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");
  const [msTeamsTenants] = useApiData<MSTeamsTenant[]>("MicrosoftTeamsTenants");

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1>Edit Microsoft Teams Tenant</H1>
      <MsTeamsTenantForm
        accounts={accounts}
        applications={applications}
        msTeamsTenants={msTeamsTenants}
        currentServiceProvider={currentServiceProvider}
        msTeamsTenant={{ data, refetch, error }}
      />
    </>
  );
};

export default EditMsTeamsTenant;
