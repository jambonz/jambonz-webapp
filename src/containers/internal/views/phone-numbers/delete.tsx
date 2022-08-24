import React from "react";
import { P } from "jambonz-ui";

import { Modal } from "src/components";

import type { PhoneNumber } from "src/api/types";

type DeleteProps = {
  phoneNumber: PhoneNumber;
  handleCancel: () => void;
  handleSubmit: () => void;
};

export const DeletePhoneNumber = ({
  phoneNumber,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  return (
    <>
      {1 && (
        <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
          <P>
            Are you sure you want to delete the phone number{" "}
            <strong>{phoneNumber.number}</strong>?
          </P>
        </Modal>
      )}
    </>
  );
};
