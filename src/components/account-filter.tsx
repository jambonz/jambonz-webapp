import React, { useEffect, useState } from "react";
import { classNames } from "jambonz-ui";

import { Icons } from "src/components/icons";

import type { Account } from "src/api/types";
import { hasLength, sortLocaleName } from "src/utils";
import { setAccountFilter } from "src/store/localStore";

export type AccountFilterProps = {
  label?: string;
  account: [string, React.Dispatch<React.SetStateAction<string>>];
  accounts?: Account[];
  defaultOption?: boolean;
};

/** This will apply the selected account SID so you can filter local data */
/** Currently used by: Applications, Recent Calls, Alerts, Carriers and Speech index views */
export const AccountFilter = ({
  label = "Account",
  account: [accountSid, setAccountSid],
  accounts,
  defaultOption,
}: AccountFilterProps) => {
  const [focus, setFocus] = useState(false);
  const classes = {
    smsel: true,
    "smsel--filter": true,
    "account-filter": true,
    focused: focus,
  };

  useEffect(() => {
    if (hasLength(accounts) && !defaultOption) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, defaultOption, setAccountSid]);

  return (
    <div className={classNames(classes)}>
      <label htmlFor="account_filter">{label}:</label>
      <div>
        <select
          id="account_filter"
          name="account_filter"
          value={accountSid}
          onChange={(e) => {
            setAccountSid(e.target.value);
            setAccountFilter(e.target.value);
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        >
          {defaultOption ? (
            <option value="">All accounts</option>
          ) : (
            accounts &&
            !accounts.length && <option value="">No accounts</option>
          )}
          {hasLength(accounts) &&
            accounts.sort(sortLocaleName).map((acct) => {
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
    </div>
  );
};
