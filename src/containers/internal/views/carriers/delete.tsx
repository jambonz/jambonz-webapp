import React from "react";
import { P } from "jambonz-ui";

import { Modal } from "src/components";

import type { Carrier } from "src/api/types";

type DeleteProps = {
  carrier: Carrier;
  handleCancel: () => void;
  handleSubmit: () => void;
};

export const DeleteCarrier = ({
  carrier,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  return (
    <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
      <P>
        Are you sure you want to delete carrier <strong>{carrier.name}</strong>?
      </P>
    </Modal>
  );
};

export default DeleteCarrier;
