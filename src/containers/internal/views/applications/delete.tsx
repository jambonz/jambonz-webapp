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

type DeleteInfoParameter = {
  item: Application | Account;
  key1: string;
  key2?: string;
  label: string;
};

const DeleteInfo = ({ item, key1, key2, label }: DeleteInfoParameter) => {
  return (
    <ul className="m">
      <li>
        <strong>{label}:</strong>
      </li>
      <li className="txt--teal">
        {
          // this is getting out of hand
          (item &&
            ((item[key1 as keyof typeof item] &&
              key2 &&
              item[key1 as keyof typeof item]![
                key2 as keyof typeof item[keyof typeof item]
              ]) ||
              item[key1 as keyof typeof item])) ||
            "[None]"
        }
      </li>
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
        {account && <DeleteInfo item={account} key1="name" label="Account" />}
        <DeleteInfo
          item={application}
          key1="call_hook"
          key2="webhook_sid"
          label="Calling Webhook"
        />
        <DeleteInfo
          item={application}
          key1="call_status_hook"
          key2="webhook_sid"
          label="Call Status Webhook"
        />
        <DeleteInfo
          item={application}
          key1="messaging_hook"
          key2="webhook_sid"
          label="Messaging Webhook"
        />
      </Modal>
    </>
  );
};

export default DeleteApplication;
