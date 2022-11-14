import React, { useEffect, useMemo, useState } from "react";
import { H1, Button, Icon, ButtonGroup } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useApiData } from "src/api";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import { PER_PAGE_SELECTION } from "src/api/constants";

// import { toastError, toastSuccess } from "src/store";
import {
  Section,
  Icons,
  Spinner,
  SearchFilter,
  AccountFilter,
  SelectFilter,
  ServiceProviderFilter,
  Pagination,
} from "src/components";
// import { DeleteUser } from "./delete";
import { hasLength, hasValue, useFilteredResults } from "src/utils";

import type { ServiceProvider, Account, User } from "src/api/types";

export const Users = () => {
  const [users] = useApiData<User[]>("Users");
  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState(false);
  const [accountSid, setAccountSid] = useState("");
  const [serviceProviderSid, setServiceProviderSid] = useState("");
  const [serviceProviders] = useApiData<ServiceProvider[]>(`ServiceProviders`);
  const [accounts] = useApiData<Account[]>(
    `ServiceProviders/${serviceProviderSid}/Accounts`
  );

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [maxPageNumber, setMaxPageNumber] = useState(1);
  const [filterResult, setFilterResult] = useState<User[]>([]);

  const filteredUsers = useFilteredResults<User>(filter, users);

  /** Reset page number when filters change */
  useEffect(() => {
    setPageNumber(1);
  }, [accountSid, scopeFilter, serviceProviderSid]);

  useMemo(() => {
    if (users && filteredUsers) {
      setFilterResult(filteredUsers);

      if (scopeFilter)
        setFilterResult(
          filterResult.filter((e) => {
            return e.scope === "admin";
          })
        );

      if (serviceProviderSid)
        setFilterResult(
          filterResult.filter((e) => {
            return serviceProviderSid === e.service_provider_sid;
          })
        );

      if (accountSid)
        setFilterResult(
          filterResult.filter((e) => {
            return accountSid === e.account_sid;
          })
        );

      setMaxPageNumber(Math.ceil(users.length / Number(perPageFilter)));
    }
  }, [
    users,
    filteredUsers,
    scopeFilter,
    accountSid,
    serviceProviderSid,
    pageNumber,
    serviceProviders,
    accounts,
  ]);

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
        <label htmlFor="is_active" className="chk chk--filter">
          <div>Admin users</div>
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.checked)}
          />
        </label>
        <ServiceProviderFilter
          serviceProvider={[serviceProviderSid, setServiceProviderSid]}
          serviceProviders={serviceProviders}
          defaultOption={true}
        />
        {serviceProviderSid && (
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            defaultOption={true}
          />
        )}
      </section>

      <Section {...(hasLength(filterResult) && { slim: true })}>
        <div className="grid grid--col4">
          <div className="grid__row grid__th">
            <div>Users</div>
            <div>Email</div>
            <div>SID</div>
            <div>&nbsp;</div>
          </div>
          {!hasValue(users) ? (
            <Spinner />
          ) : hasLength(filterResult) ? (
            filterResult.map((user) => {
              return (
                <div className="grid__row" key={user.user_sid}>
                  <div>{user.name}</div>
                  <div>{user.email}</div>
                  <div>{user.user_sid}</div>
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
      <footer>
        <ButtonGroup>
          {hasLength(users) && (
            <Pagination
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              maxPageNumber={maxPageNumber}
            />
          )}
          <SelectFilter
            id="page_filter"
            filter={[perPageFilter, setPerPageFilter]}
            options={PER_PAGE_SELECTION}
          />
        </ButtonGroup>
      </footer>
    </>
  );
};

export default Users;
