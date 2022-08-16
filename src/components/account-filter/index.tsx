import React, { useEffect } from "react";

import { Icons } from "src/components/icons";
import { useServiceProviderData } from "src/api";

import type { Dispatch, SetStateAction } from "react";
import type { Account } from "src/api/types";

import "./styles.scss";

type AccountFilterProps = {
  account: [string, Dispatch<SetStateAction<string>>];
};

/** This will apply the selected account SID so you can filter local data */
export const AccountFilter = ({
  account: [accountSid, setAccountSid],
}: AccountFilterProps) => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  useEffect(() => {
    if (accounts) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, setAccountSid]);

  return (
    <div className="account-filter">
      <select
        name="account_filter"
        value={accountSid}
        onChange={(e) => setAccountSid(e.target.value)}
      >
        {accounts &&
          accounts
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((acct) => {
              return (
                <option key={acct.account_sid} value={acct.account_sid}>
                  {acct.name}
                </option>
              );
            })}
      </select>
      <span>
        <Icons.ChevronUp />
        <Icons.ChevronDown />
      </span>
    </div>
  );
};
