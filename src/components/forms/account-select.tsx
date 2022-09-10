import React, { useEffect } from "react";

import { Selector } from "src/components/forms";

import type { Dispatch, SetStateAction } from "react";
import type { Account } from "src/api/types";
import { hasLength } from "src/utils";

type AccountSelectProps = {
  label?: string;
  account: [string, Dispatch<SetStateAction<string>>];
  accounts?: Account[];
  defaultOption?: boolean;

  /** Native select element attributes we support */
  required?: boolean;
  disabled?: boolean;
};

export const AccountSelect = ({
  label = "Account",
  account: [accountSid, setAccountSid],
  accounts,
  required = true,
  defaultOption,
  ...restProps
}: AccountSelectProps) => {
  useEffect(() => {
    if (hasLength(accounts) && !accountSid && !defaultOption) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, accountSid, defaultOption]);

  return (
    <>
      <label htmlFor="account_sid">
        {label} {required && <span>*</span>}
      </label>
      <Selector
        id="account_sid"
        name="account_sid"
        required={required}
        value={accountSid}
        options={
          hasLength(accounts)
            ? (defaultOption
                ? [{ name: "All accounts", value: "" }]
                : []
              ).concat(
                accounts.map((account) => ({
                  name: account.name,
                  value: account.account_sid,
                }))
              )
            : []
        }
        onChange={(e) => setAccountSid(e.target.value)}
        {...restProps}
      />
    </>
  );
};
