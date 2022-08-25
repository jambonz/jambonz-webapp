import React, { useState } from "react";
import { Button, H1, Icon, M } from "jambonz-ui";
import { deleteCarrier, useServiceProviderData } from "src/api";
import { Carrier } from "src/api/types";
import { toastSuccess, toastError } from "src/store";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import { Link } from "react-router-dom";
import { Icons, Section, Spinner } from "src/components";
import { hasLength } from "src/utils";
import DeleteCarrier from "./delete";

export const Carriers = () => {
  // the webapp fetches from all rather than jus the SP
  // i guess we can fetch from SP but post in all?
  const [carriers, refetch] = useServiceProviderData<Carrier[]>("VoipCarriers");

  const [carrier, setCarrier] = useState<Carrier | null>(null);

  const handleDelete = () => {
    if (carrier) {
      deleteCarrier(carrier.voip_carrier_sid)
        .then(() => {
          refetch();
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
