import React from "react";
import { P } from "jambonz-ui";
import { Modal } from "src/components";
import type { User } from "src/api/types";

type DeleteProps = {
  user: User;
  handleCancel: () => void;
  handleSubmit: () => void;
};

export const DeleteUser = ({
  user,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  return (
    <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
      <P>
        Are you sure you want to delete the user <strong>{user.name}</strong>?
      </P>
    </Modal>
  );
};

export default DeleteUser;
