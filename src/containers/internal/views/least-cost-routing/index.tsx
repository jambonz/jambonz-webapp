import React from "react";
import { Button, H1, Icon, M } from "@jambonz/ui-kit";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiData, useServiceProviderData } from "src/api";
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
import { useSelectState } from "src/store";
import { setLocation } from "src/store/localStore";
import { Scope } from "src/store/types";
import { hasLength, hasValue } from "src/utils";

export const Lcrs = () => {
  const [filter, setFilter] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [apiUrl, setApiUrl] = useState("");

  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [lcrs /*refetch*/] = useApiData<Lcr[]>(apiUrl);
  // const [lcr, setLcr] = useState<Lcr | null>(null);
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

  // const lcrsFiltered = useMemo(() => {
  //   setAccountSid(getAccountFilter());
  //   if (user?.account_sid && user?.scope === USER_ACCOUNT) {
  //     setAccountSid(user?.account_sid);
  //     return lcrs;
  //   }

  //   return lcrs
  //     ? lcrs.filter((lcr) =>
  //       accountSid ? lcr.account_sid === accountSid : lcr.account_sid === null
  //     )
  //     : [];
  // }, [accountSid, lcr, lcrs]);
  // const filteredLcrs = useFilteredResults<Lcr>(filter, lcrsFiltered);

  useEffect(() => {
    setLocation();
    if (currentServiceProvider) {
      setApiUrl(
        `ServiceProviders/${currentServiceProvider.service_provider_sid}/Lcrs`
      );
    }
  }, [user, currentServiceProvider, accountSid]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Least cost routing</H1>
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
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            label="Used by"
            defaultOption
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(lcrs) && { slim: true })}>
        <div className="list">
          {!hasValue(lcrs) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(lcrs) ? (
            lcrs.map((lcr) => (
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
                        title="Edit least cost routing"
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
                      title="Delete Carrier"
                      onClick={() => console.log("xhoaluu")}
                      className="btnty"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </ScopedAccess>
              </div>
            ))
          ) : (
            <M> No Least cost routings.</M>
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_LEST_COST_ROUTING}/add`}>
          Add least cost routing
        </Button>
      </Section>
    </>
  );
};

export default Lcrs;
