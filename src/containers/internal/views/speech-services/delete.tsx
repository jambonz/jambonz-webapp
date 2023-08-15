import React from "react";
import { P } from "@jambonz/ui-kit";

import { Modal } from "src/components";

import type { SpeechCredential } from "src/api/types";

type DeleteProps = {
  credential: SpeechCredential;
  handleCancel: () => void;
  handleSubmit: () => void;
};

export const DeleteSpeechService = ({
  credential,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  return (
    <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
      <P>
        Are you sure you want to delete the{" "}
        <strong>
          {credential.vendor}
          {credential.label ? ` (${credential.label})` : ""}
        </strong>{" "}
        speech service?
      </P>
    </Modal>
  );
};

export default DeleteSpeechService;
