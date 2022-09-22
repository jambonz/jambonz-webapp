import React, { useEffect, useState } from "react";
import { P } from "jambonz-ui";

import { ModalClose, Modal } from "src/components";
import { getFetch } from "src/api";
import {
  API_BASE_URL,
  API_APPLICATIONS,
  API_PHONE_NUMBERS,
  API_MS_TEAMS_TENANTS,
} from "src/api/constants";
import { getObscured, hasLength } from "src/utils";

import type {
  ApiKey,
  Account,
  Application,
  PhoneNumber,
  MSTeamsTenant,
} from "src/api/types";

type DeleteProps = {
  account: Account;
  handleCancel: () => void;
  handleSubmit: () => void;
};

type InUseProps = {
  items: Application[] | PhoneNumber[] | MSTeamsTenant[] | ApiKey[];
  sidKey: string;
  labelKey: string;
  itemsLabel: string;
};

interface InUse {
  apps: Application[];
  phones: PhoneNumber[];
  teams: MSTeamsTenant[];
  apiKeys: ApiKey[];
}

const InUseItems = ({ items, itemsLabel, sidKey, labelKey }: InUseProps) => {
  return (
    <ul className="m">
      <li>
        <strong>{itemsLabel}:</strong>
      </li>
      {items.map((item) => {
        return (
          <li className="txt--teal" key={item[sidKey as keyof typeof item]}>
            {labelKey === "token"
              ? getObscured((item as ApiKey).token)
              : item[labelKey as keyof typeof item]}
          </li>
        );
      })}
    </ul>
  );
};

export const DeleteAccount = ({
  account,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  const [inUse, setInUse] = useState<InUse>();
  const [isDeletable, setIsDeletable] = useState(false);

  /** Fetch data to see if account can be deleted */
  useEffect(() => {
    let ignore = false;

    Promise.all([
      getFetch<Application[]>(API_APPLICATIONS),
      getFetch<PhoneNumber[]>(API_PHONE_NUMBERS),
      getFetch<MSTeamsTenant[]>(API_MS_TEAMS_TENANTS),
      getFetch<ApiKey[]>(
        `${API_BASE_URL}/Accounts/${account.account_sid}/ApiKeys`
      ),
    ]).then(([appsRes, phonesRes, teamsRes, apiKeysRes]) => {
      if (!ignore) {
        const used = {
          apps: appsRes.json.filter(
            (app) => app.account_sid === account.account_sid
          ),
          phones: phonesRes.json.filter(
            (phone) => phone.account_sid === account.account_sid
          ),
          teams: teamsRes.json.filter(
            (team) => team.account_sid === account.account_sid
          ),
          apiKeys: apiKeysRes.json,
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
  }, []);

  return (
    <>
      {isDeletable && (
        <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
          <P>
            Are you sure you want to delete the account{" "}
            <strong>{account.name}</strong>?
          </P>
        </Modal>
      )}
      {inUse && (
        <ModalClose handleClose={handleCancel}>
          <P>
            In order to delete the account it cannot be in use by any{" "}
            <span>Applications ({inUse.apps.length})</span>,{" "}
            <span>Phone Numbers ({inUse.phones.length})</span>, or{" "}
            <span>MS Teams Tenants ({inUse.teams.length})</span> or have any{" "}
            <span>Api Keys ({inUse.apiKeys.length})</span>.
          </P>
          {hasLength(inUse.apps) && (
            <InUseItems
              items={inUse.apps}
              itemsLabel="Applications"
              sidKey="application_sid"
              labelKey="name"
            />
          )}
          {hasLength(inUse.phones) && (
            <InUseItems
              items={inUse.phones}
              itemsLabel="Phone Numbers"
              sidKey="phone_number_sid"
              labelKey="number"
            />
          )}
          {hasLength(inUse.teams) && (
            <InUseItems
              items={inUse.teams}
              itemsLabel="MS Teams Tenants"
              sidKey="tenant_fqdn"
              labelKey="tenant_fqdn"
            />
          )}
          {hasLength(inUse.apiKeys) && (
            <InUseItems
              items={inUse.apiKeys}
              itemsLabel="API Keys"
              sidKey="api_key_sid"
              labelKey="token"
            />
          )}
        </ModalClose>
      )}
    </>
  );
};

export default DeleteAccount;
