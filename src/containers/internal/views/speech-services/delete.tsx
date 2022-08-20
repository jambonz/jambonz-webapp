import React from "react";
import { P } from "jambonz-ui";

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
    <>
      {1 && (
        <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
          <P>
            Are you sure you want to delete the speech service{" "}
            <strong>{credential.vendor}</strong>?
          </P>
        </Modal>
      )}
    </>
  );
};

export default DeleteSpeechService;
