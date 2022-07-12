import React, { useState } from "react";
import { H1, M, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useServiceProviderData, deleteAccount } from "src/api";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { Section, Icons, Spinner } from "src/components";
import { DeleteAccount } from "./delete";
import { toastError, toastSuccess } from "src/store";
import { hasLength, hasValue } from "src/utils";

import type { Account } from "src/api/types";

export const Accounts = () => {
  const [accounts, refetch] = useServiceProviderData<Account[]>("Accounts");
  const [account, setAccount] = useState<Account | null>(null);

  const handleDelete = () => {
    if (account) {
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
      <Section {...(hasLength(accounts) ? { slim: true } : {})}>
        <div className="list">
          {!hasValue(accounts) && <Spinner />}
          {hasLength(accounts) ? (
            accounts.map((account) => {
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
            <M>No Accounts yet.</M>
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
