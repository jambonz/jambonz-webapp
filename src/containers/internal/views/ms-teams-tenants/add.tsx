import React from "react";
import { H1 } from "jambonz-ui";

import { useApiData } from "src/api";
import { MsTeamsTenantForm } from "./form";

import type { Account, Application, MSTeamsTenant } from "src/api/types";

export const AddMsTeamsTenant = () => {
  const [accounts] = useApiData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");
  const [msTeamsTenants] = useApiData<MSTeamsTenant[]>("MicrosoftTeamsTenants");

  return (
    <>
      <H1>Add a Microsoft Teams Tenant</H1>
      <MsTeamsTenantForm
        accounts={accounts}
        applications={applications}
        msTeamsTenants={msTeamsTenants}
      />
    </>
  );
};

export default AddMsTeamsTenant;
