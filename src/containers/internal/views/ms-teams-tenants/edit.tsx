import React, { useEffect } from "react";
import { H1 } from "@jambonz/ui-kit";
import { useParams } from "react-router-dom";

import { useApiData } from "src/api";
import { MsTeamsTenantForm } from "./form";

import type { MSTeamsTenant } from "src/api/types";
import { useToast } from "src/components/toast/toast-provider";

export const EditMsTeamsTenant = () => {
  const { toastError } = useToast();
  const params = useParams();
  const [data, refetch, error] = useApiData<MSTeamsTenant>(
    `MicrosoftTeamsTenants/${params.ms_teams_tenant_sid}`,
  );

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit Microsoft Teams Tenant</H1>
      <MsTeamsTenantForm msTeamsTenant={{ data, refetch, error }} />
    </>
  );
};

export default EditMsTeamsTenant;
