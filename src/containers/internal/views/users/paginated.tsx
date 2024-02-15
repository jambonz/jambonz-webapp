import React, { useEffect, useMemo, useState } from "react";
import { H1, Button, Icon, ButtonGroup } from "@jambonz/ui-kit";
import { Link } from "react-router-dom";

import { listUsersPaginated, useServiceProviderData } from "src/api";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import {
  USER_SCOPE_SELECTION,
  USER_ADMIN,
  USER_ACCOUNT,
  PER_PAGE_SELECTION,
} from "src/api/constants";

import {
  Section,
  Icons,
  Spinner,
  SearchFilter,
  AccountFilter,
  SelectFilter,
  Pagination,
} from "src/components";
import {
  filterScopeOptions,
  hasLength,
  hasValue,
  sortUsersAlpha,
  useFilteredResults,
} from "src/utils";

import type { Account, CallQuery, User } from "src/api/types";
import { toastError, useSelectState } from "src/store";
import { ScopedAccess } from "src/components/scoped-access";
import { Scope } from "src/store/types";
import { getAccountFilter, setLocation } from "src/store/localStore";

export const UsersPaginated = () => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");

  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [accountSid, setAccountSid] = useState("");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [users, setUsers] = useState<User[]>();
  const [, setUsersTotalItems] = useState(5);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  const handleFilterChange = () => {
    const query: Partial<CallQuery> = {
      page: pageNumber,
      limit: Number(perPageFilter),
    };

    listUsersPaginated(accountSid, query)
      .then(({ json }) => {
        setUsers(json.data);
        setUsersTotalItems(json.total_items);
        setUsersTotalPages(json.total_pages);
      })
      .catch((error) => {
        toastError(error.msg);
        setUsers([]);
      });
  };

  const usersFiltered = useMemo(() => {
    setAccountSid(getAccountFilter());

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

  const sortedUsers = useFilteredResults<User>(filter, usersFiltered)?.sort(
    sortUsersAlpha
  );

  useEffect(() => {
    handleFilterChange();
    setLocation();
    setPageNumber(1);
  }, []);

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
        {user && (
          <SelectFilter
            id="scope"
            label="Scope"
            filter={[scopeFilter, setScopeFilter]}
            options={filterScopeOptions(USER_SCOPE_SELECTION, user)}
          />
        )}
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            defaultOption={user?.scope !== USER_ACCOUNT}
          />
        </ScopedAccess>
      </section>

      <Section slim>
        <div className="grid grid--col3--users">
          <div className="grid__row grid__th">
            <div>User Name</div>
            <div>Scope</div>
            <div>&nbsp;</div>
          </div>
          {!hasValue(users) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(sortedUsers) ? (
            sortedUsers.map((user) => {
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
      <footer>
        <ButtonGroup>
          <Pagination
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            maxPageNumber={usersTotalPages}
          />
          <SelectFilter
            id="page_filter"
            filter={[perPageFilter, setPerPageFilter]}
            options={PER_PAGE_SELECTION}
          />
        </ButtonGroup>
      </footer>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_USERS}/add`}>
          Add user
        </Button>
      </Section>
    </>
  );
};

export default UsersPaginated;
