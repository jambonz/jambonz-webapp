import React, { useEffect, forwardRef } from "react";

import { Selector } from "src/components/forms";

import type { Account } from "src/api/types";
import { hasLength } from "src/utils";

type AccountSelectProps = {
  label?: string;
  account: [string, React.Dispatch<React.SetStateAction<string>>];
  accounts?: Account[];
  defaultOption?: boolean;

  /** Native select element attributes we support */
  required?: boolean;
  disabled?: boolean;
};

type SelectorRef = HTMLSelectElement;

export const AccountSelect = forwardRef<SelectorRef, AccountSelectProps>(
  (
    {
      label = "Account",
      account: [accountSid, setAccountSid],
      accounts,
      required = true,
      defaultOption,
      ...restProps
    }: AccountSelectProps,
    ref,
  ) => {
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
          ref={ref}
          id="account_sid"
          name="account_sid"
          required={required}
          value={accountSid}
          options={(defaultOption
            ? [{ name: "All accounts", value: "" }]
            : []
          ).concat(
            hasLength(accounts)
              ? accounts.map((account) => ({
                  name: account.name,
                  value: account.account_sid,
                }))
              : [],
          )}
          onChange={(e) => setAccountSid(e.target.value)}
          {...restProps}
        />
      </>
    );
  },
);

AccountSelect.displayName = "AccountSelect";
