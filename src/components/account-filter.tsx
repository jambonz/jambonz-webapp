import React, { useEffect } from "react";
import { classNames } from "@jambonz/ui-kit";

import { TypeaheadSelector } from "src/components/forms";

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
  const classes = {
    smsel: true,
    "smsel--filter": true,
    "account-filter": true,
  };

  useEffect(() => {
    if (hasLength(accounts) && !defaultOption) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, defaultOption, setAccountSid]);

  const options = [
    ...(defaultOption ? [{ name: "All accounts", value: "" }] : []),
    ...(hasLength(accounts)
      ? accounts.sort(sortLocaleName).map((acct) => ({
          name: acct.name,
          value: acct.account_sid,
        }))
      : []),
  ];

  return (
    <div className={classNames(classes)}>
      {label && <label htmlFor="account_filter">{label}:</label>}
      <TypeaheadSelector
        id="account_filter"
        name="account_filter"
        value={accountSid}
        options={options}
        className="small"
        onChange={(e) => {
          setAccountSid(e.target.value);
          setAccountFilter(e.target.value);
        }}
      />
    </div>
  );
};
