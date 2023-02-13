import React from "react";
import { H1 } from "@jambonz/ui-kit";

import { MsTeamsTenantForm } from "./form";

export const AddMsTeamsTenant = () => {
  return (
    <>
      <H1 className="h2">Add a Microsoft Teams Tenant</H1>
      <MsTeamsTenantForm />
    </>
  );
};

export default AddMsTeamsTenant;
