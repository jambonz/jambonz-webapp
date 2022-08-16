import React, { useEffect } from "react";
import { P } from "jambonz-ui";

import { Modal } from "src/components";
import { useApiData } from "src/api";
import { toastError } from "src/store";

import type { Application, Account } from "src/api/types";

type DeleteProps = {
  application: Application;
  handleCancel: () => void;
  handleSubmit: () => void;
};

const DeleteInfo = ({
  label,
  text,
}: {
  label: string;
  text: string | null | undefined;
}) => {
  return (
    <ul className="m">
      <li>
        <strong>{label}:</strong>
      </li>
      <li className="txt--teal">{text}</li>
    </ul>
  );
};

export const DeleteApplication = ({
  application,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  const [account, , error] = useApiData<Account>(
    `Accounts/${application.account_sid}`
  );

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
        <P>
          Are you sure you want to delete the application{" "}
          <strong>{application.name}</strong>?
        </P>
        {account && <DeleteInfo label="Account" text={account.name} />}
        {application && (
          <>
            <DeleteInfo
              label="Calling Webhook"
              text={application.call_hook?.webhook_sid || "[None]"}
            />
            <DeleteInfo
              label="Call Status Webhook"
              text={application.call_status_hook?.webhook_sid || "[None]"}
            />
            <DeleteInfo
              label="Messaging Webhook"
              text={application.messaging_hook?.webhook_sid || "[None]"}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default DeleteApplication;
