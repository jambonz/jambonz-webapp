import React, { useState } from "react";
import { H1, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";

// import { toastError, toastSuccess } from "src/store";
import {
  Section,
  Icons,
  Spinner,
  SearchFilter,
  AccountFilter,
  SelectFilter,
  ServiceProviderFilter,
} from "src/components";
// import { DeleteUser } from "./delete";
import { hasLength, hasValue, useFilteredResults } from "src/utils";

import type { ServiceProvider, Account, User } from "src/api/types";

const scopeSelection = [
  { name: "all", value: "all" },
  { name: "admin", value: "admin" },
  { name: "service_provider", value: "service_provider" },
  { name: "account", value: "account" },
];

export const Users = () => {
  const [users] = useApiData<User[]>("Users");
  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [serviceProviders] = useApiData<ServiceProvider[]>("ServiceProviders");
  const [accountSid, setAccountSid] = useState("");
  const [serviceProviderSid, setServiceProviderSid] = useState("");

  // const [pageNumber, setPageNumber] = useState(1);
  // const [perPageFilter, setPerPageFilter] = useState("25");
  // const [maxPageNumber, setMaxPageNumber] = useState(1);

  const filteredUsers = useFilteredResults<User>(filter, users);

  // const getUsers = () => {
  //   const users = useApiData<User[]>("Users");
  //   setUsers(users as any);
  //   return users;
  // }

  // const handleDelete = () => {
  //   if (user) {
  //     deleteUser(user.user_sid)
  //       .then(() => {
  //         refetch();
  //         setUser(null);
  //         toastSuccess(
  //           <>
  //             Deleted account <strong>{user.name}</strong>
  //           </>
  //         );
  //       })
  //       .catch((error) => {
  //         toastError(error.msg);
  //       });
  //   }
  // };

  // const handleFilterChange = () => {
  //     const filteredUsers = users?.filter((e) => {
  //       e.account_sid === acco
  //     })
  // };

  // const handleSelect = () => {
  //   const result = users?.filter((e)=> {
  //     e.account_sid === accountSid && e.service_provider_sid
  //   });
  //   setUsers(result);
  // };

  // useEffect(() => {
  //   if(!users){
  //     getUsers();
  //     console.log("users", users)
  //   }
  //   console.log(users)
  //   if (serviceProviderSid || accountSid || scopeFilter) {
  //     //handleFilterChange();
  //     handleSelect();
  //   }

  //   console.log(users)
  // }, [users, serviceProviderSid, accountSid, scopeFilter]);

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
          options={scopeSelection}
        />
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={accounts}
        />
        <ServiceProviderFilter
          serviceProvider={[serviceProviderSid, setServiceProviderSid]}
          serviceProviders={serviceProviders}
        />
      </section>

      <Section {...(hasLength(filteredUsers) && { slim: true })}>
        <div className="grid grid--col4">
          <div className="grid__row grid__th">
            <div>Users</div>
            <div>Email</div>
            <div>SID</div>
            <div>&nbsp;</div>
          </div>
          {!hasValue(users) ? (
            <Spinner />
          ) : hasLength(filteredUsers) ? (
            filteredUsers.map((user) => {
              return (
                <div className="grid__row" key={user.name}>
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
    </>
  );
};

export default Users;
