import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, H1, Icon, M } from "jambonz-ui";
import {
  deleteCarrier,
  deleteSipGateway,
  deleteSmppGateway,
  getFetch,
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
} from "src/components";
import { ScopedAccess } from "src/components/scoped-access";
import { Gateways } from "./gateways";
import {
  getUserAccounts,
  hasAccountAccess,
  hasLength,
  hasValue,
  useFilteredResults,
} from "src/utils";
import {
  API_SIP_GATEWAY,
  API_SMPP_GATEWAY,
  USER_ACCOUNT,
} from "src/api/constants";
import { DeleteCarrier } from "./delete";

import type { Account, Carrier, SipGateway, SmppGateway } from "src/api/types";
import { Scope } from "src/store/types";

export const Carriers = () => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [url, setUrl] = useState("");
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [carriers, refetch, error] = useApiData<Carrier[]>(
    `ServiceProviders/${currentServiceProvider?.service_provider_sid}/VoipCarriers`
  );
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");
  const [filter, setFilter] = useState("");

  const getUrlForCarriers = () => {
    if ((user && user?.scope === USER_ACCOUNT) || accountSid) {
      setUrl(`Accounts/${user?.account_sid || accountSid}/VoipCarriers`);
    }
  };

  const carriersFiltered = useMemo(() => {
    return carriers
      ? carriers.filter((carrier) =>
          accountSid
            ? carrier.account_sid === accountSid
            : carrier.account_sid === null
        )
      : [];
  }, [accountSid, carrier, carriers]);

  const filteredCarriers = useFilteredResults<Carrier>(
    filter,
    carriersFiltered
  );

  const handleDelete = () => {
    if (carrier) {
      if (user && hasAccountAccess(user, accountSid)) {
        toastError("You do not have permissions to delete this Carrier");
        return;
      }

      deleteCarrier(carrier.voip_carrier_sid)
        .then(() => {
          Promise.all([
            getFetch<SipGateway[]>(
              `${API_SIP_GATEWAY}?voip_carrier_sid=${carrier.voip_carrier_sid}`
            ),
            getFetch<SmppGateway[]>(
              `${API_SMPP_GATEWAY}?voip_carrier_sid=${carrier.voip_carrier_sid}`
            ),
          ]).then(([sipGatewaysRes, smppGatewaysRes]) => {
            hasLength(sipGatewaysRes.json) &&
              sipGatewaysRes.json.forEach(
                (g) =>
                  g &&
                  g.sip_gateway_sid &&
                  deleteSipGateway(g.sip_gateway_sid).catch((error) =>
                    toastError(error.msg)
                  )
              );
            hasLength(smppGatewaysRes.json) &&
              smppGatewaysRes.json.forEach(
                (g) =>
                  g &&
                  g.smpp_gateway_sid &&
                  deleteSmppGateway(g.smpp_gateway_sid).catch((error) =>
                    toastError(error.msg)
                  )
              );
          });
          getUrlForCarriers();
          setCarrier(null);
          refetch();
          toastSuccess(
            <>
              Deleted Carrier <strong>{carrier.name}</strong>
            </>
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    getUrlForCarriers();
    if (error) {
      toastError(error.msg);
    }
  }, [user, url, accountSid]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Carriers</H1>
        <Link to={`${ROUTE_INTERNAL_CARRIERS}/add`} title="Add a Carrier">
          {" "}
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters filters--spaced">
        <SearchFilter
          placeholder="Filter carriers"
          filter={[filter, setFilter]}
        />
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={user && accounts && getUserAccounts(user, accounts)}
          label="Used by"
          defaultOption
        />
      </section>
      <Section {...(hasLength(filteredCarriers) && { slim: true })}>
        <div className="list">
          {!hasValue(carriers) ? (
            <Spinner />
          ) : hasLength(filteredCarriers) ? (
            filteredCarriers.map((carrier) => (
              <div className="item" key={carrier.voip_carrier_sid}>
                <div className="item__info">
                  <div className="item__title">
                    <ScopedAccess
                      user={user}
                      scope={
                        !accountSid ? Scope.service_provider : Scope.account
                      }
                    >
                      <Link
                        to={`${ROUTE_INTERNAL_CARRIERS}/${carrier.voip_carrier_sid}/edit`}
                        title="Edit Carrier"
                        className="i"
                      >
                        <strong>{carrier.name}</strong>
                        <Icons.ArrowRight />
                      </Link>
                    </ScopedAccess>
                    {!accountSid && user?.scope === USER_ACCOUNT && (
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
                    <Gateways carrier={carrier} />
                  </div>
                </div>
                <ScopedAccess
                  user={user}
                  scope={!accountSid ? Scope.service_provider : Scope.account}
                >
                  <div className="item__actions">
                    <Link
                      to={`${ROUTE_INTERNAL_CARRIERS}/${carrier.voip_carrier_sid}/edit`}
                      title="Edit Carrier"
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
          Add Carrier
        </Button>
      </Section>
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
