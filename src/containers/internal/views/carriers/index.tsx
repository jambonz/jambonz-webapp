import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonGroup, H1, Icon, M, MS } from "@jambonz/ui-kit";
import {
  deleteCarrier,
  deleteSipGateway,
  deleteSmppGateway,
  getFetch,
  getSPVoipCarriers,
  useApiData,
  useServiceProviderData,
} from "src/api";
import { toastSuccess, toastError, useSelectState } from "src/store";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import {
  AccountFilter,
  Icons,
  Section,
  Spinner,
  SearchFilter,
  Pagination,
  SelectFilter,
} from "src/components";
import { ScopedAccess } from "src/components/scoped-access";
import { Gateways } from "./gateways";
import {
  isUserAccountScope,
  hasLength,
  hasValue,
  useFilteredResults,
} from "src/utils";
import {
  API_SIP_GATEWAY,
  API_SMPP_GATEWAY,
  CARRIER_REG_OK,
  ENABLE_HOSTED_SYSTEM,
  PER_PAGE_SELECTION,
  USER_ACCOUNT,
} from "src/api/constants";
import { DeleteCarrier } from "./delete";

import type {
  Account,
  Carrier,
  CurrentUserData,
  SipGateway,
  SmppGateway,
} from "src/api/types";
import { Scope } from "src/store/types";
import { getAccountFilter, setLocation } from "src/store/localStore";

export const Carriers = () => {
  const user = useSelectState("user");
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [filter, setFilter] = useState("");

  const [carriersTotal, setCarriersTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [maxPageNumber, setMaxPageNumber] = useState(1);

  const refetch = () => {
    if (!currentServiceProvider) return;
    getSPVoipCarriers(currentServiceProvider.service_provider_sid, {
      page: pageNumber,
      page_size: Number(perPageFilter),
      ...(filter && { name: filter }),
      ...(accountSid && { account_sid: accountSid }),
    })
      .then(({ json }) => {
        setCarriers(json.data);
        setCarriersTotal(json.total);
        setMaxPageNumber(Math.ceil(json.total / Number(perPageFilter)));
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  const filteredCarriers = useFilteredResults<Carrier>(filter, carriers);

  const handleDelete = () => {
    if (carrier) {
      if (isUserAccountScope(accountSid, user)) {
        toastError("You do not have permissions to delete this Carrier");
        return;
      }

      deleteCarrier(carrier.voip_carrier_sid)
        .then(() => {
          Promise.all([
            getFetch<SipGateway[]>(
              `${API_SIP_GATEWAY}?voip_carrier_sid=${carrier.voip_carrier_sid}`,
            ),
            getFetch<SmppGateway[]>(
              `${API_SMPP_GATEWAY}?voip_carrier_sid=${carrier.voip_carrier_sid}`,
            ),
          ]).then(([sipGatewaysRes, smppGatewaysRes]) => {
            hasLength(sipGatewaysRes.json) &&
              sipGatewaysRes.json.forEach(
                (g) =>
                  g &&
                  g.sip_gateway_sid &&
                  deleteSipGateway(g.sip_gateway_sid).catch((error) =>
                    toastError(error.msg),
                  ),
              );
            hasLength(smppGatewaysRes.json) &&
              smppGatewaysRes.json.forEach(
                (g) =>
                  g &&
                  g.smpp_gateway_sid &&
                  deleteSmppGateway(g.smpp_gateway_sid).catch((error) =>
                    toastError(error.msg),
                  ),
              );
          });
          setCarrier(null);
          refetch();
          toastSuccess(
            <>
              Deleted Carrier <strong>{carrier.name}</strong>
            </>,
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    setLocation();
    setAccountSid(getAccountFilter());
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    }
  }, [user]);

  useMemo(() => {
    if (currentServiceProvider) {
      refetch();
    }
  }, [currentServiceProvider, pageNumber, perPageFilter, accountSid]);

  return (
    <>
      <section className="mast">
        <div>
          <H1 className="h2">Carriers</H1>
          {ENABLE_HOSTED_SYSTEM && (
            <M>
              Have your carrier send calls to{" "}
              <span>{userData?.account?.sip_realm}</span>
            </M>
          )}
        </div>

        <Link to={`${ROUTE_INTERNAL_CARRIERS}/add`} title="Add a Carrier">
          {" "}
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters filters--multi">
        <SearchFilter
          placeholder="Filter carriers"
          filter={[filter, setFilter]}
        />
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            label="Used by"
            defaultOption
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(filteredCarriers) && { slim: true })}>
        <div className="list">
          {!hasValue(carriers) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(filteredCarriers) ? (
            filteredCarriers.map((carrier) => (
              <div className="item" key={carrier.voip_carrier_sid}>
                <div className="item__info">
                  <div className="item__title">
                    <ScopedAccess
                      user={user}
                      scope={
                        !carrier.account_sid
                          ? Scope.service_provider
                          : Scope.account
                      }
                    >
                      <Link
                        to={`${ROUTE_INTERNAL_CARRIERS}/${carrier.voip_carrier_sid}/edit`}
                        title="Edit carrier"
                        className="i"
                      >
                        <strong>{carrier.name}</strong>
                        <Icons.ArrowRight />
                      </Link>
                    </ScopedAccess>
                    {!carrier.account_sid && user?.scope === USER_ACCOUNT && (
                      <strong>{carrier.name}</strong>
                    )}
                  </div>
                  <div className="item__meta">
                    <div>
                      <div
                        className={`i txt--${
                          carrier.is_active ? "teal" : "grey"
                        }`}
                      >
                        {carrier.is_active ? (
                          <Icons.CheckCircle />
                        ) : (
                          <Icons.XCircle />
                        )}
                        <span>{carrier.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    {Boolean(carrier.requires_register) && (
                      <div
                        className={`i txt--${
                          carrier.register_status.status === CARRIER_REG_OK
                            ? "teal"
                            : "jam"
                        }`}
                      >
                        {carrier.register_status.status === CARRIER_REG_OK ? (
                          <Icons.CheckCircle />
                        ) : (
                          <Icons.XCircle />
                        )}
                        <span>
                          {carrier.register_status.status === CARRIER_REG_OK
                            ? "Registered"
                            : "Unregistered"}
                        </span>
                      </div>
                    )}
                    <Gateways carrier={carrier} />
                  </div>
                </div>
                <ScopedAccess
                  user={user}
                  scope={
                    !carrier.account_sid
                      ? Scope.service_provider
                      : Scope.account
                  }
                >
                  <div className="item__actions">
                    <Link
                      to={`${ROUTE_INTERNAL_CARRIERS}/${carrier.voip_carrier_sid}/edit`}
                      title="Edit carrier"
                    >
                      <Icons.Edit3 />
                    </Link>
                    <button
                      type="button"
                      title="Delete Carrier"
                      onClick={() => setCarrier(carrier)}
                      className="btnty"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </ScopedAccess>
              </div>
            ))
          ) : (
            <M>No Carriers.</M>
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_CARRIERS}/add`}>
          Add carrier
        </Button>
      </Section>
      <footer>
        <ButtonGroup>
          <MS>
            Total: {carriersTotal} record
            {carriersTotal === 1 ? "" : "s"}
          </MS>
          {hasLength(carriers) && (
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
      {carrier && (
        <DeleteCarrier
          carrier={carrier}
          handleCancel={() => setCarrier(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default Carriers;
