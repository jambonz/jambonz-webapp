import React from "react";
import { P } from "jambonz-ui";

import { Modal } from "src/components";

import type { MSTeamsTenant } from "src/api/types";

type DeleteProps = {
  msTeamsTenant: MSTeamsTenant;
  handleCancel: () => void;
  handleSubmit: () => void;
};

export const DeleteMsTeamsTenant = ({
  msTeamsTenant,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  return (
    <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
      <P>
        Are you sure you want to delete the{" "}
        <strong>{msTeamsTenant.tenant_fqdn}</strong> Microsoft Teams Tenant?
      </P>
    </Modal>
  );
};

export default DeleteMsTeamsTenant;
