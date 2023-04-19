import React from "react";
import { P } from "@jambonz/ui-kit";
import { Modal } from "src/components";
import { Lcr } from "src/api/types";

type DeleteProps = {
  lcr: Lcr;
  handleCancel: () => void;
  handleSubmit: () => void;
};

export const DeleteLcr = ({ lcr, handleCancel, handleSubmit }: DeleteProps) => {
  return (
    <>
      <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
        <P>
          Are you sure you want to delete least cost routing{" "}
          <strong>{lcr.name}</strong>?
        </P>
      </Modal>
    </>
  );
};

export default DeleteLcr;
