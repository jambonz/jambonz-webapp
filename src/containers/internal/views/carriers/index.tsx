import React, { useEffect, useState } from "react";
import { Button, H1, Icon, M } from "jambonz-ui";
import { deleteCarrier, getFetch, useServiceProviderData } from "src/api";
import { Account, Carrier } from "src/api/types";
import { toastSuccess, toastError, useSelectState } from "src/store";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import { Link } from "react-router-dom";
import { AccountFilter, Icons, Section, Spinner } from "src/components";
import { hasLength } from "src/utils";
import { DeleteCarrier } from "./delete";
import { API_SERVICE_PROVIDERS } from "src/api/constants";

export const Carriers = () => {
  const currentServiceProvider = useSelectState("currentServiceProvider");

  const [carrier, setCarrier] = useState<Carrier | null>(null);

  // const [carriers, refetch] = useServiceProviderData<Carrier[]>("VoipCarriers");
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [accountSid, setAccountSid] = useState("");

  const [refetch, setRefetch] = useState(0);

  const getCarriers = (all: boolean) => {
    getFetch<Carrier[]>(
      `${API_SERVICE_PROVIDERS}/${currentServiceProvider?.service_provider_sid}/VoipCarriers`
    )
      .then(({ json }) => {
        setCarriers(json.filter((a) => all || a.account_sid === accountSid));
      })
      .catch((error) => toastError(error.msg));
  };

  const handleDelete = () => {
    if (carrier) {
      deleteCarrier(carrier.voip_carrier_sid)
        .then(() => {
          setRefetch(refetch + 1);
          setCarrier(null);
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
    if (accountSid && currentServiceProvider) {
      getCarriers(false); // clearer argument? TODO
    } else {
      getCarriers(true);
    }
  }, [accountSid, currentServiceProvider, refetch]);

  return (
    <>
      <section className="mast">
        <H1>Carriers</H1>
        <Link to={`${ROUTE_INTERNAL_CARRIERS}/add`} title="Add a Carrier">
          {" "}
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <section className="filters filters--ender">
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={accounts}
          label="Used by"
          defaultOption
        />
      </section>
      <Section {...(hasLength(carriers) ? { slim: true } : {})}>
        <div className="list">
          {carriers ? (
            hasLength(carriers) ? (
              carriers.map((carrier) => (
                <div className="item" key={carrier.voip_carrier_sid}>
                  <div className="item__info">
                    <div className="item__title">
                      <Link
                        to={`${ROUTE_INTERNAL_CARRIERS}/${carrier.voip_carrier_sid}/edit`}
                        title="Edit Carrier"
                        className="i"
                      >
                        <strong>{carrier.name}</strong>
                        <Icons.ArrowRight />
                      </Link>
                    </div>
                    {
                      // stuff being active and inbound/outbound gateway
                    }
                    <div className="item__meta">
                      <div>
                        <div
                          className={`i txt--${
                            carrier.is_active ? "teal" : "grey"
                          }`}
                        >
                          {carrier.is_active ? "Active" : "Not active"}
                        </div>
                      </div>
                    </div>
                  </div>
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
                </div>
              ))
            ) : (
              <M>No Carriers yet.</M>
            )
          ) : (
            <Spinner />
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
