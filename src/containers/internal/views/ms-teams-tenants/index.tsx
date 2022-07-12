import React from "react";
import { H1 } from "jambonz-ui";

import { withAccessControl } from "src/utils";

import type { ACLGetIMessage } from "src/utils/with-access-control";

export const MSTeamsTenants = () => {
  return <H1>MS Teams Tenants</H1>;
};

const getAclIMessage: ACLGetIMessage = (currentServiceProvider) => {
  return (
    <>
      <strong>{currentServiceProvider.name}</strong> does not have a fully
      qualified domain name for MS Teams
    </>
  );
};

export default withAccessControl(
  "hasMSTeamsFqdn",
  getAclIMessage
)(MSTeamsTenants);
