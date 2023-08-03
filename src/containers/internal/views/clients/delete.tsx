import { P } from "@jambonz/ui-kit";
import React from "react";
import { Client } from "src/api/types";
import { Modal } from "src/components";

type ClientsDeleteProps = {
  client: Client;
  handleCancel: () => void;
  handleSubmit: () => void;
};
export const ClientsDelete = ({
  client,
  handleCancel,
  handleSubmit,
}: ClientsDeleteProps) => {
  return (
    <>
      <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
        <P>
          Are you sure you want to delete the sip client{" "}
          <strong>{client.username}</strong>?
        </P>
      </Modal>
    </>
  );
};

export default ClientsDelete;
