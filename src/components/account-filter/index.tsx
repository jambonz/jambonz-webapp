import React, { useEffect, useState } from "react";
import { classNames } from "jambonz-ui";

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
  const [focus, setFocus] = useState(false);
  const classes = {
    "account-filter": true,
    focused: focus,
  };

  useEffect(() => {
    if (accounts) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, setAccountSid]);

  return (
    <div className={classNames(classes)}>
      <select
        name="account_filter"
        value={accountSid}
        onChange={(e) => setAccountSid(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
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
