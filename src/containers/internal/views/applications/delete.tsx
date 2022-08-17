import React, { useEffect, useState } from "react";
import { P } from "jambonz-ui";

import { Modal, ModalClose } from "src/components";
import { getFetch } from "src/api";

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

const InUseItems = ({ items, itemsLabel, sidKey, labelKey }: InUseProps) => {
  return (
    <ul className="m">
      <li>
        <strong>{itemsLabel}:</strong>
      </li>
      {items.map((item, index) => {
        return (
          <li
            className="txt--teal"
            key={`${item[sidKey as keyof typeof item]}_${index}`}
          >
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
  const [inUse, setInUse] = useState<InUse | null>(null);
  const [isDeletable, setIsDeletable] = useState(false);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      getFetch<Account[]>(API_ACCOUNTS),
      getFetch<MSTeamsTenant[]>(API_MS_TEAMS_TENANTS),
    ]).then(([accountRes, msteamRes]) => {
      if (!ignore) {
        const used = {
          accounts: accountRes.json.filter(
            (account) =>
              account.device_calling_application_sid ===
                application.application_sid ||
              account.siprec_hook_sid === application.application_sid
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

    return function cleanup() {
      ignore = true;
    };
  });

  return (
    <>
      {isDeletable && (
        <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
          <P>
            Are you sure you want to delete the application{" "}
            <strong>{application.name}</strong>?
          </P>
        </Modal>
      )}
      {inUse && (
        <ModalClose handleClose={handleCancel}>
          <P>
            In order to delete the account it cannot be in use by any{" "}
            <span>Accounts ({inUse.accounts.length})</span> , or{" "}
            <span>Microsoft Teams Tenant ({inUse.teams.length})</span>.
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
