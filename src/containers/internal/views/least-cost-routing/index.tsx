import React, { useMemo } from "react";
import { Button, H1, Icon, M } from "@jambonz/ui-kit";
import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteLcr, useApiData, useServiceProviderData } from "src/api";
// import { USER_ACCOUNT } from "src/api/constants";
import type { Account, Lcr } from "src/api/types";
import {
  AccountFilter,
  Icons,
  SearchFilter,
  Section,
  Spinner,
} from "src/components";
import { ScopedAccess } from "src/components/scoped-access";
import { ROUTE_INTERNAL_LEST_COST_ROUTING } from "src/router/routes";
import { toastSuccess, toastError, useSelectState } from "src/store";
// import { getAccountFilter, setLocation } from "src/store/localStore";
import { Scope } from "src/store/types";
import {
  hasLength,
  hasValue,
  useFilteredResults,
  useScopedRedirect,
} from "src/utils";
import { USER_ACCOUNT } from "src/api/constants";
import DeleteLcr from "./delete";

export const Lcrs = () => {
  const user = useSelectState("user");
  useScopedRedirect(
    Scope.admin,
    `${ROUTE_INTERNAL_LEST_COST_ROUTING}/add`,
    user,
    "You do not have permissions to manage all outbound call routes"
  );
  const [lcrs, refetch] = useApiData<Lcr[]>("Lcrs");
  const [filter, setFilter] = useState("");
  const [accountSid, setAccountSid] = useState("");

  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [lcr, setLcr] = useState<Lcr | null>();
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  const lcrsFiltered = useMemo(() => {
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
      return lcrs;
    }

    return lcrs
      ? lcrs.filter((lcr) =>
          accountSid
            ? lcr.account_sid === accountSid
            : currentServiceProvider?.service_provider_sid
            ? lcr.service_provider_sid ==
              currentServiceProvider.service_provider_sid
            : lcr.account_sid === null
        )
      : [];
  }, [accountSid, lcrs]);
  const filteredLcrs = useFilteredResults<Lcr>(filter, lcrsFiltered);

  const handleDelete = () => {
    if (lcr) {
      deleteLcr(lcr.lcr_sid || "")
        .then(() => {
          toastSuccess(
            <>
              Deleted outbound call route <strong>{lcr?.name}</strong>
            </>
          );
          setLcr(null);
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
        <H1 className="h2">Outbound call routing</H1>
        <Link
          to={`${ROUTE_INTERNAL_LEST_COST_ROUTING}/add`}
          title="Add a Least cost routing"
        >
          {" "}
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters filters--spaced">
        <SearchFilter placeholder="Filter lcrs" filter={[filter, setFilter]} />
        <ScopedAccess user={user} scope={Scope.admin}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            label="Used by"
            defaultOption
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(filteredLcrs) && { slim: true })}>
        <div className="list">
          {!hasValue(filteredLcrs) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(filteredLcrs) ? (
            filteredLcrs.map((lcr) => (
              <div className="item" key={lcr.lcr_sid}>
                <div className="item__info">
                  <div className="item__title">
                    <ScopedAccess
                      user={user}
                      scope={
                        !lcr.account_sid
                          ? Scope.service_provider
                          : Scope.account
                      }
                    >
                      <Link
                        to={`${ROUTE_INTERNAL_LEST_COST_ROUTING}/${lcr.lcr_sid}/edit`}
                        title="Edit outbound call routes"
                        className="i"
                      >
                        <strong>{lcr.name}</strong>
                        <Icons.ArrowRight />
                      </Link>
                    </ScopedAccess>
                  </div>
                  <div className="item__meta">
                    <div>
                      <div
                        className={`i txt--${lcr.is_active ? "teal" : "grey"}`}
                      >
                        {lcr.is_active ? (
                          <Icons.CheckCircle />
                        ) : (
                          <Icons.XCircle />
                        )}
                        <span>{lcr.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <div>
                      <div className={`i txt--teal`}>
                        <Icons.Activity />
                        <span>
                          {lcr.account_sid
                            ? accounts?.find(
                                (acct) => acct.account_sid === lcr.account_sid
                              )?.name
                            : currentServiceProvider?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <ScopedAccess
                  user={user}
                  scope={
                    !lcr.account_sid ? Scope.service_provider : Scope.account
                  }
                >
                  <div className="item__actions">
                    <Link
                      to={`${ROUTE_INTERNAL_LEST_COST_ROUTING}/${lcr.lcr_sid}/edit`}
                      title="Edit carrier"
                    >
                      <Icons.Edit3 />
                    </Link>
                    <button
                      type="button"
                      title="Delete outbound call route"
                      onClick={() => setLcr(lcr)}
                      className="btnty"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </ScopedAccess>
              </div>
            ))
          ) : (
            <M>No outbound call routes.</M>
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_LEST_COST_ROUTING}/add`}>
          Add outbound call routes
        </Button>
      </Section>
      {lcr && (
        <DeleteLcr
          lcr={lcr}
          handleCancel={() => setLcr(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default Lcrs;
