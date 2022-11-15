import React, { useMemo, useState } from "react";
import { H1, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import { USER_SCOPE_SELECTION } from "src/api/constants";

import {
  Section,
  Icons,
  Spinner,
  SearchFilter,
  AccountFilter,
  SelectFilter,
} from "src/components";
import { hasLength, hasValue, useFilteredResults } from "src/utils";

import type { Account, User } from "src/api/types";
import { useSelectState } from "src/store";

export const Users = () => {
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [users] = useApiData<User[]>("Users");
  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [accountSid, setAccountSid] = useState("");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  const usersFiltered = useMemo(() => {
    const serviceProviderUsers = users?.filter((e) => {
      return (
        e.scope === "admin" ||
        e.service_provider_sid ===
          currentServiceProvider?.service_provider_sid ||
        accounts?.every((account) => {
          account.account_sid === e.account_sid;
        })
      );
    });

    return serviceProviderUsers
      ? serviceProviderUsers.filter((e) => {
          return scopeFilter === "all" && !accountSid
            ? serviceProviderUsers
            : scopeFilter !== "all" && !accountSid
            ? e.scope === scopeFilter
            : scopeFilter !== "all" && accountSid
            ? e.scope === scopeFilter && accountSid === e.account_sid
            : scopeFilter === "all" && accountSid
            ? e.account_sid === accountSid
            : false;
        })
      : [];
  }, [accountSid, scopeFilter, users, accounts]);

  const filteredUsers = useFilteredResults<User>(filter, usersFiltered);

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
          accounts={accounts}
          defaultOption={true}
        />
      </section>

      <Section {...(hasLength(filteredUsers) && { slim: true })}>
        <div className="grid grid--col4">
          <div className="grid__row grid__th">
            <div>Users</div>
            <div>Email</div>
            <div>Scope</div>
            <div>&nbsp;</div>
          </div>
          {!hasValue(users) ? (
            <Spinner />
          ) : hasLength(filteredUsers) ? (
            filteredUsers.map((user) => {
              return (
                <div className="grid__row" key={user.user_sid}>
                  <div>{user.name}</div>
                  <div>{user.email}</div>
                  <div>{user.scope}</div>
                  <Link
                    to={`${ROUTE_INTERNAL_USERS}/${user.user_sid}/edit`}
                    title="Edit user"
                  >
                    <Icons.Edit3 />
                  </Link>
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
