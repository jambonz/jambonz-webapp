import React, { useEffect, useState } from "react";
import { classNames } from "jambonz-ui";

import { Icons } from "src/components/icons";
import { useServiceProviderData } from "src/api";

import type { Dispatch, SetStateAction } from "react";
import type { Account } from "src/api/types";

import "./styles.scss";

type AccountFilterProps = {
  label?: string;
  account: [string, Dispatch<SetStateAction<string>>];
  defaultOption?: boolean;
};

/** This will apply the selected account SID so you can filter local data */
/** Currently used by: Applications, Recent Calls, Alerts, Carriers and Speech index views */
export const AccountFilter = ({
  label = "Account",
  account: [accountSid, setAccountSid],
  defaultOption,
}: AccountFilterProps) => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [focus, setFocus] = useState(false);
  const classes = {
    "account-filter": true,
    focused: focus,
  };

  useEffect(() => {
    if (accounts && !defaultOption) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, defaultOption, setAccountSid]);

  return (
    <div className={classNames(classes)}>
      <label htmlFor="account_filter">{label}:</label>
      <select
        name="account_filter"
        value={accountSid}
        onChange={(e) => setAccountSid(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        {defaultOption && <option value="">All accounts</option>}
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