import React, { useState } from "react";
import { H1, M, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useServiceProviderData, deleteAccount } from "src/api";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { Section, Icons, Spinner, SearchFilter } from "src/components";
import { DeleteAccount } from "./delete";
import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  hasLength,
  hasValue,
  useFilteredResults,
  useScopedRedirect,
} from "src/utils";
import { USER_ACCOUNT } from "src/api/constants";

import { Scope } from "src/store/types";
import type { Account } from "src/api/types";

export const Accounts = () => {
  const user = useSelectState("user");
  const [accounts, refetch] = useServiceProviderData<Account[]>("Accounts");
  const [account, setAccount] = useState<Account | null>(null);
  const [filter, setFilter] = useState("");

  const filteredAccounts = useFilteredResults<Account>(filter, accounts);

  useScopedRedirect(
    Scope.service_provider,
    `${ROUTE_INTERNAL_ACCOUNTS}/${user?.account_sid}/edit`,
    user,
    "You do not have permissions to manage all accounts"
  );

  const handleDelete = () => {
    if (account) {
      if (
        user?.scope === USER_ACCOUNT &&
        user.account_sid !== account.account_sid
      ) {
        toastError(
          "You do not have permissions to make changes to this Account"
        );
        return;
      }

      deleteAccount(account.account_sid)
        .then(() => {
          refetch();
          setAccount(null);
          toastSuccess(
            <>
              Deleted account <strong>{account.name}</strong>
            </>
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  return (
    <>
      <section className="mast">
        <H1 className="h2">Accounts</H1>
        <Link to={`${ROUTE_INTERNAL_ACCOUNTS}/add`} title="Add account">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters filters--spaced">
        <SearchFilter
          placeholder="Filter accounts"
          filter={[filter, setFilter]}
        />
      </section>
      <Section {...(hasLength(filteredAccounts) && { slim: true })}>
        <div className="list">
          {!hasValue(accounts) ? (
            <Spinner />
          ) : hasLength(filteredAccounts) ? (
            filteredAccounts.map((account) => {
              return (
                <div className="item" key={account.account_sid}>
                  <div className="item__info">
                    <div className="item__title">
                      <Link
                        to={`${ROUTE_INTERNAL_ACCOUNTS}/${account.account_sid}/edit`}
                        title="Edit account"
                        className="i"
                      >
                        <strong>{account.name}</strong>
                        <Icons.ArrowRight />
                      </Link>
                    </div>
                    <div className="item__sid">
                      <strong>SID:</strong> <code>{account.account_sid}</code>
                    </div>
                  </div>
                  <div className="item__actions">
                    <Link
                      to={`${ROUTE_INTERNAL_ACCOUNTS}/${account.account_sid}/edit`}
                      title="Edit account"
                    >
                      <Icons.Edit3 />
                    </Link>
                    <button
                      type="button"
                      title="Delete account"
                      onClick={() => setAccount(account)}
                      className="btnty"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <M>No Accounts.</M>
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_ACCOUNTS}/add`}>
          Add account
        </Button>
      </Section>
      {account && (
        <DeleteAccount
          account={account}
          handleCancel={() => setAccount(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default Accounts;
