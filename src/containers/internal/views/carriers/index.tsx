import React, { useState, useEffect, useRef } from "react";
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
import { useSelectState } from "src/store";
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
import { isUserAccountScope, hasLength, hasValue } from "src/utils";
import {
  API_SIP_GATEWAY,
  API_SMPP_GATEWAY,
  CARRIER_REG_OK,
  ENABLE_HOSTED_SYSTEM,
  PER_PAGE_SELECTION,
  USER_ACCOUNT,
  ADMIN_CARRIER,
  USER_ADMIN,
  USER_SP,
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
import { useToast } from "src/components/toast/toast-provider";

export const Carriers = () => {
  const { toastError, toastSuccess } = useToast();
  const user = useSelectState("user");
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [carriers, setCarriers] = useState<Carrier[] | null>(null);
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [filter, setFilter] = useState("");

  const [carriersTotal, setCarriersTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [maxPageNumber, setMaxPageNumber] = useState(1);

  // Add a ref to track previous values
  const prevValuesRef = useRef({
    serviceProviderId: "",
    accountSid: "",
    filter: "",
    pageNumber: 1,
    perPageFilter: "25",
  });

  const fetchCarriers = (resetPage = false) => {
    if (!currentServiceProvider) return;

    setCarriers(null);

    // Calculate the correct page to use
    const currentPage = resetPage ? 1 : pageNumber;

    // If we're resetting the page, also update the state
    if (resetPage && pageNumber !== 1) {
      setPageNumber(1);
    }

    getSPVoipCarriers(currentServiceProvider.service_provider_sid, {
      page: currentPage,
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
        setCarriers([]);
        toastError(error.msg);
      });
  };

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
          fetchCarriers(false);
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

  // Initial account setup
  useEffect(() => {
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    } else {
      setAccountSid(getAccountFilter());
    }
    setLocation();
  }, [user, accounts]);

  // Combined effect for all data fetching
  useEffect(() => {
    if (!currentServiceProvider) return;

    const prevValues = prevValuesRef.current;
    const currentSPId = currentServiceProvider.service_provider_sid;

    // Determine if we should reset pagination
    const isFilterOrProviderChange =
      prevValues.serviceProviderId !== currentSPId ||
      prevValues.accountSid !== accountSid ||
      prevValues.filter !== filter;

    const isPageSizeChange =
      prevValues.perPageFilter !== perPageFilter &&
      prevValues.perPageFilter !== "25"; // Skip initial render

    // Update ref for next comparison
    prevValuesRef.current = {
      serviceProviderId: currentSPId,
      accountSid,
      filter,
      pageNumber,
      perPageFilter,
    };

    // Fetch data with page reset if filters changed
    fetchCarriers(isFilterOrProviderChange || isPageSizeChange);
  }, [currentServiceProvider, accountSid, filter, pageNumber, perPageFilter]);

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
        {((ADMIN_CARRIER === "1" &&
          (user?.scope === USER_ADMIN || user?.scope === USER_SP)) ||
          ADMIN_CARRIER === "0") && (
          <Link to={`${ROUTE_INTERNAL_CARRIERS}/add`} title="Add a Carrier">
            {" "}
            <Icon>
              <Icons.Plus />
            </Icon>
          </Link>
        )}
      </section>
      <section className="filters filters--multi">
        <SearchFilter
          placeholder="Filter carriers"
          filter={[filter, setFilter]}
          delay={1000}
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
      <Section {...(hasLength(carriers) && { slim: true })}>
        <div className="list">
          {!hasValue(carriers) && hasLength(accounts) ? (
            <Spinner />
          ) : hasLength(carriers) ? (
            carriers.map((carrier) => (
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
      {((ADMIN_CARRIER === "1" &&
        (user?.scope === USER_ADMIN || user?.scope === USER_SP)) ||
        ADMIN_CARRIER === "0") && (
        <Section clean>
          <Button small as={Link} to={`${ROUTE_INTERNAL_CARRIERS}/add`}>
            Add carrier
          </Button>
        </Section>
      )}
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
