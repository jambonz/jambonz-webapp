import { Button, H1, Icon, M } from "@jambonz/ui-kit";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteClient, useApiData, useServiceProviderData } from "src/api";
import { Account, Client } from "src/api/types";
import {
  AccountFilter,
  Icons,
  ScopedAccess,
  SearchFilter,
  Section,
  Spinner,
} from "src/components";
import { ROUTE_INTERNAL_CLIENTS } from "src/router/routes";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { Scope } from "src/store/types";
import { hasLength, hasValue, useFilteredResults } from "src/utils";
import ClientsDelete from "./delete";
import { USER_ACCOUNT } from "src/api/constants";

export const Clients = () => {
  const user = useSelectState("user");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [clients, refetch] = useApiData<Client[]>("Clients");

  const [accountSid, setAccountSid] = useState("");
  const [filter, setFilter] = useState("");
  const [client, setClient] = useState<Client | null>();

  const tmpFilteredClients = useMemo(() => {
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
      return clients;
    }

    return clients
      ? clients.filter((c) => {
          return accountSid ? c.account_sid === accountSid : true;
        })
      : [];
  }, [accountSid, clients]);

  const filteredClients = useFilteredResults(filter, tmpFilteredClients);

  const handleDelete = () => {
    if (client) {
      deleteClient(client.client_sid || "")
        .then(() => {
          toastSuccess(
            <>
              Deleted outbound call route <strong>{client.user_name}</strong>
            </>
          );
          setClient(null);
          refetch();
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  return (
    <>
      <section className="mast">
        <H1 className="h2">Clients</H1>
        <Link to={`${ROUTE_INTERNAL_CLIENTS}/add`} title="Add a client">
          {" "}
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>

      <section className="filters filters--spaced">
        <SearchFilter
          placeholder="Filter clients"
          filter={[filter, setFilter]}
        />
        <ScopedAccess user={user} scope={Scope.admin}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            label="Used by"
            defaultOption
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(filteredClients) && { slim: true })}>
        <div className="list">
          {!hasValue(filteredClients) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(filteredClients) ? (
            filteredClients.map((c) => (
              <div className="item" key={c.client_sid}>
                <div className="item__info">
                  <div className="item__title">
                    <Link
                      to={`${ROUTE_INTERNAL_CLIENTS}/${c.client_sid}/edit`}
                      title="Edit outbound call routes"
                      className="i"
                    >
                      <strong>{c.user_name}</strong>
                      <Icons.ArrowRight />
                    </Link>
                  </div>
                  <div className="item__meta">
                    <div>
                      <div
                        className={`i txt--${c.is_active ? "teal" : "grey"}`}
                      >
                        {c.is_active ? (
                          <Icons.CheckCircle />
                        ) : (
                          <Icons.XCircle />
                        )}
                        <span>{c.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item__actions">
                  <Link
                    to={`${ROUTE_INTERNAL_CLIENTS}/${c.client_sid}/edit`}
                    title="Edit Client"
                  >
                    <Icons.Edit3 />
                  </Link>
                  <button
                    type="button"
                    title="Delete client"
                    onClick={() => setClient(c)}
                    className="btnty"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <M>No Clients.</M>
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_CLIENTS}/add`}>
          Add client
        </Button>
      </Section>
      {client && (
        <ClientsDelete
          client={client}
          handleCancel={() => setClient(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default Clients;
