import React, { useState } from "react";
import { H1, M, Button, Icon } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useServiceProviderData, deleteAccount } from "src/api";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { Section, Icons, Spinner } from "src/components";
import { DeleteAccount } from "./delete";
import { toastError, toastSuccess } from "src/store";
import { hasLength } from "src/utils";

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
        <H1>Accounts</H1>
        <Link to={`${ROUTE_INTERNAL_ACCOUNTS}/add`} title="Add account">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <Section {...(hasLength(accounts) ? { slim: true } : {})}>
        <div className="list">
          {accounts ? (
            accounts.length > 0 ? (
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
                      {/* <div className="item__meta">
                        <div>
                          <div
                            className={`i txt--${
                              account.sip_realm ? "teal" : "grey"
                            }`}
                          >
                            {account.sip_realm ? (
                              <Icons.CheckCircle />
                            ) : (
                              <Icons.XCircle />
                            )}
                            <span>SIP realm</span>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`i txt--${
                              account.registration_hook ? "teal" : "grey"
                            }`}
                          >
                            {account.registration_hook ? (
                              <Icons.CheckCircle />
                            ) : (
                              <Icons.XCircle />
                            )}
                            <span>Registration webhook</span>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`i txt--${
                              account.queue_event_hook ? "teal" : "grey"
                            }`}
                          >
                            {account.queue_event_hook ? (
                              <Icons.CheckCircle />
                            ) : (
                              <Icons.XCircle />
                            )}
                            <span>Queue event webhook</span>
                          </div>
                        </div>
                      </div> */}
                    </div>
                    <div className="item__actions">
                      <Link
                        to={`${ROUTE_INTERNAL_ACCOUNTS}/${account.account_sid}/edit`}
                        title="Edit account"
                        className=""
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
            )
          ) : (
            <Spinner />
          )}
        </div>
      </Section>
      {/* <section className="cards">
        {accounts ? (
          accounts.length > 0 ? (
            accounts.map((account) => {
              return (
                <div className="card" key={account.account_sid}>
                  <div className="card__title">
                    <Link
                      to={`${ROUTE_INTERNAL_ACCOUNTS}/${account.account_sid}/edit`}
                      title="Edit account"
                      className="i"
                    >
                      <strong>{account.name}</strong>
                      <Icons.ArrowRight />
                    </Link>
                  </div>
                  <div className="card__sid">
                    <strong>SID:</strong> <code>{account.account_sid}</code>
                  </div>
                  <div className="card__meta">
                    <div>
                      <div
                        className={`i txt--${
                          account.sip_realm ? "teal" : "grey"
                        }`}
                      >
                        {account.sip_realm ? (
                          <Icons.CheckCircle />
                        ) : (
                          <Icons.XCircle />
                        )}
                        <span>SIP realm</span>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`i txt--${
                          account.registration_hook ? "teal" : "grey"
                        }`}
                      >
                        {account.registration_hook ? (
                          <Icons.CheckCircle />
                        ) : (
                          <Icons.XCircle />
                        )}
                        <span>Registration webhook</span>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`i txt--${
                          account.queue_event_hook ? "teal" : "grey"
                        }`}
                      >
                        {account.queue_event_hook ? (
                          <Icons.CheckCircle />
                        ) : (
                          <Icons.XCircle />
                        )}
                        <span>Queue event webhook</span>
                      </div>
                    </div>
                  </div>
                  <div className="card__actions">
                    <Link
                      to={`${ROUTE_INTERNAL_ACCOUNTS}/${account.account_sid}/edit`}
                      title="Edit account"
                      className=""
                    >
                      <Icons.Edit />
                    </Link>
                    <button
                      type="button"
                      title="Delete account"
                      onClick={() => setAccount(account)}
                      className="btnty"
                    >
                      <Icons.Trash2 />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div>No Accounts yet.</div>
          )
        ) : (
          <Spinner />
        )}
      </section> */}
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
