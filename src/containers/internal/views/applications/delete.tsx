import React, { useEffect, useState } from "react";
import { P } from "jambonz-ui";

import { Modal, ModalClose } from "src/components";
import { useApiData, getFetch } from "src/api";
import { toastError } from "src/store";

import type { Application, Account, MSTeamsTenant } from "src/api/types";
import { API_ACCOUNTS, API_MS_TEAMS_TENANTS } from "src/api/constants";

type DeleteProps = {
  application: Application;
  handleCancel: () => void;
  handleSubmit: () => void;
};

type InUseProps = {
  items: Account[] | MSTeamsTenant[];
  sidKey: string;
  labelKey: string;
  itemsLabel: string;
};

interface InUse {
  accounts: Account[];
  teams: MSTeamsTenant[];
}

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

const InUseItems = ({ items, itemsLabel, sidKey, labelKey }: InUseProps) => {
  return (
    <ul className="m">
      <li>
        <strong>{itemsLabel}:</strong>
      </li>
      {items.map((item) => {
        return (
          <li className="txt--teal" key={item[sidKey as keyof typeof item]}>
            {item[labelKey as keyof typeof item]}
          </li>
        );
      })}
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

  const [inUse, setInUse] = useState<InUse | null>(null);
  const [isDeletable, setIsDeletable] = useState(false);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      getFetch<Account[]>(API_ACCOUNTS),
      getFetch<MSTeamsTenant[]>(API_MS_TEAMS_TENANTS),
      ,
    ]).then(([accountRes, msteamRes]) => {
      if (!ignore) {
        const used = {
          accounts: accountRes.json.filter(
            (account) =>
              account.device_calling_application_sid ===
              application.application_sid
          ),
          teams: msteamRes.json.filter(
            (team) => team.application_sid === application.application_sid
          ),
        };
        const deletable =
          Object.keys(used).reduce((acc, key) => {
            return acc + used[key as keyof InUse].length;
          }, 0) === 0;

        if (deletable) {
          setIsDeletable(deletable);
        } else {
          setInUse(used);
        }
      }
    });

    if (error) {
      toastError(error.msg);
    }

    return function cleanup() {
      ignore = true;
    };
  }, [error]);

  return (
    <>
      {isDeletable && (
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
      )}
      {inUse && (
        <ModalClose handleClose={handleCancel}>
          <P>
            In order to delete the account it cannot be in use by any{" "}
            <span className="txt-jam">Accounts ({inUse.accounts.length})</span>{" "}
            , or{" "}
            <span className="txt-jam">
              Microsoft Teams Tenant ({inUse.teams.length})
            </span>
          </P>
          {inUse.accounts.length > 0 && (
            <InUseItems
              items={inUse.accounts}
              itemsLabel="Account"
              sidKey="account_name"
              labelKey="name"
            />
          )}
          {inUse.teams.length > 0 && (
            <InUseItems
              items={inUse.teams}
              itemsLabel="Microsoft Teams Tenant"
              sidKey="msteam"
              labelKey="tenant_fqdn"
            />
          )}
        </ModalClose>
      )}
    </>
  );
};

export default DeleteApplication;
