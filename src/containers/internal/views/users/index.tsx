import React, { useMemo, useState } from "react";
import { H1, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import {
  USER_SCOPE_SELECTION,
  USER_ADMIN,
  USER_ACCOUNT,
} from "src/api/constants";

import {
  Section,
  Icons,
  Spinner,
  SearchFilter,
  AccountFilter,
  SelectFilter,
} from "src/components";
import {
  hasLength,
  hasValue,
  sortAlphabetically,
  useFilteredResults,
} from "src/utils";

import type { Account, User } from "src/api/types";
import { useSelectState } from "src/store";

export const Users = () => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [users] = useApiData<User[]>("Users");
  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [accountSid, setAccountSid] = useState("");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  const usersFiltered = useMemo(() => {
    //find and add account/sp names to user to improve fuzzy search
    users?.forEach((user) => {
      user.account_name =
        accounts?.find((acct) => acct.account_sid === user.account_sid)?.name ||
        null;
      user.service_provider_name =
        user.scope === USER_ADMIN ? null : currentServiceProvider?.name || null;
    });

    const serviceProviderUsers = users?.filter((e) => {
      return (
        e.scope === USER_ADMIN ||
        e.service_provider_sid === currentServiceProvider?.service_provider_sid
      );
    });

    if (scopeFilter === "all" && !accountSid) {
      return serviceProviderUsers;
    }

    if (scopeFilter !== "all" && !accountSid) {
      return serviceProviderUsers?.filter((e) => e.scope === scopeFilter);
    }

    if (scopeFilter !== "all" && accountSid) {
      return serviceProviderUsers?.filter(
        (e) => e.scope === scopeFilter && accountSid === e.account_sid
      );
    }

    if (scopeFilter === "all" && accountSid) {
      return serviceProviderUsers?.filter((e) => e.account_sid === accountSid);
    }
    return [];
  }, [accountSid, scopeFilter, users, accounts, currentServiceProvider]);

  const filteredUsers = useFilteredResults<User>(filter, usersFiltered)?.sort(
    (a, b) => sortAlphabetically(a, b)
  );

  return (
    <>
      <section className="mast">
        <H1 className="h2">Users</H1>
        <Link to={`${ROUTE_INTERNAL_USERS}/add`} title="Add user">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters filters--mix">
        <section>
          <SearchFilter
            placeholder="Filter users"
            filter={[filter, setFilter]}
          />
        </section>
        <SelectFilter
          id="scope"
          label="Scope"
          filter={[scopeFilter, setScopeFilter]}
          options={USER_SCOPE_SELECTION}
        />
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={
            user?.scope === USER_ACCOUNT
              ? accounts?.filter(
                  (acct) => acct.account_sid === user.account_sid
                )
              : accounts
          }
          defaultOption={user?.scope !== USER_ACCOUNT}
        />
      </section>

      <Section slim>
        <div className="grid grid--col3--users">
          <div className="grid__row grid__th">
            <div>User Name</div>
            <div>Scope</div>
            <div>&nbsp;</div>
          </div>
          {!hasValue(users) ? (
            <Spinner />
          ) : hasLength(filteredUsers) ? (
            filteredUsers.map((user) => {
              return (
                <div className="grid__row" key={user.user_sid}>
                  <div>
                    <Link
                      to={`${ROUTE_INTERNAL_USERS}/${user.user_sid}/edit`}
                      title="Edit user"
                    >
                      <div>{user.name}</div>
                    </Link>
                  </div>
                  <div>
                    {user.scope === USER_ADMIN
                      ? "All"
                      : user.account_name
                      ? `Account: ${user.account_name}`
                      : `Service Provider: ${user.service_provider_name}`}
                  </div>
                  <div className="item__actions">
                    <Link
                      to={`${ROUTE_INTERNAL_USERS}/${user.user_sid}/edit`}
                      title="Edit user"
                    >
                      <Icons.Edit3 />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid__row grid__empty">
              <div>No users.</div>
            </div>
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_USERS}/add`}>
          Add user
        </Button>
      </Section>
    </>
  );
};

export default Users;
