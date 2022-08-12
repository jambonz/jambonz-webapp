import React from "react";
import { P } from "jambonz-ui";

import { Modal } from "src/components";

import type { Application } from "src/api/types";

type DeleteProps = {
  application: Application;
  handleCancel: () => void;
  handleSubmit: () => void;
};

export const DeleteApplication = ({
  application,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  return (
    <>
      <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
        <P>
          Are you sure you want to delete the application{" "}
          <strong>{application.name}</strong>?
        </P>
        <table>
          <tr>
            <th>Account:</th>
            <th>{application.account_sid}</th>
          </tr>
          <tr>
            <th>Calling webhook:</th>
            <th>{application.call_hook?.url || "[None]"}</th>
          </tr>
        </table>
      </Modal>
    </>
  );
};

export default DeleteApplication;
