import React, { useEffect, useState } from "react";
import { P } from "@jambonz/ui-kit";

import { Modal, ModalClose } from "src/components";
import { getFetch, getLcrRoutes, getLcrs } from "src/api";
import { API_PHONE_NUMBERS } from "src/api/constants";
import { formatPhoneNumber, hasLength, hasValue } from "src/utils";

import type { Carrier, Lcr, PhoneNumber } from "src/api/types";

type DeleteProps = {
  carrier: Carrier;
  handleCancel: () => void;
  handleSubmit: () => void;
};

export const DeleteCarrier = ({
  carrier,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>();
  const [lcrs, setLcrs] = useState<Lcr[]>();

  useEffect(() => {
    let ignore = false;

    Promise.all([
      getFetch<PhoneNumber[]>(API_PHONE_NUMBERS),
      new Promise<Lcr[]>((resolve, reject) => {
        getLcrs()
          .then(({ json }) => {
            Promise.all(
              json.map((lcr: Lcr) =>
                getLcrRoutes(lcr.lcr_sid!)
                  .then(({ json }) => {
                    if (
                      json.some((route) =>
                        route.lcr_carrier_set_entries?.some(
                          (entry) =>
                            entry.voip_carrier_sid === carrier.voip_carrier_sid,
                        ),
                      )
                    ) {
                      return lcr;
                    }
                  })
                  .catch((error) => reject(error)),
              ),
            )
              .then((lcrs) => {
                resolve(lcrs as Lcr[]);
              })
              .catch((error) => reject(error));
          })
          .catch((error) => reject(error));
      }),
    ]).then(([numbers, fetchedLcrs]) => {
      if (!ignore) {
        setPhoneNumbers(
          numbers.json.filter(
            (phone) => phone.voip_carrier_sid === carrier.voip_carrier_sid,
          ),
        );

        // Only set LCRs if they are not empty
        setLcrs(fetchedLcrs.filter((p) => hasValue(p)));
      }
    });

    return function cleanup() {
      ignore = true;
    };
  }, [carrier.voip_carrier_sid]);

  const hasBlockingDependencies = hasLength(phoneNumbers) || hasLength(lcrs);

  return (
    <>
      {phoneNumbers && lcrs && !hasBlockingDependencies && (
        <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
          <P>
            Are you sure you want to delete carrier{" "}
            <strong>{carrier.name}</strong>?
          </P>
        </Modal>
      )}
      {hasBlockingDependencies && (
        <ModalClose handleClose={handleCancel}>
          <P>
            In order to delete the carrier it cannot be in use by any{" "}
            {hasLength(phoneNumbers) && (
              <span>Phone Numbers ({phoneNumbers.length})</span>
            )}
            {hasLength(phoneNumbers) && hasLength(lcrs) && " or "}
            {hasLength(lcrs) && (
              <span>Outbound call Routings ({lcrs.length})</span>
            )}
            .
          </P>

          {hasLength(phoneNumbers) && (
            <ul className="m">
              <li>
                <strong>Phone Numbers:</strong>
              </li>
              {phoneNumbers.map((phone) => {
                return (
                  <li className="txt--teal" key={phone.phone_number_sid}>
                    {formatPhoneNumber(phone.number)}
                  </li>
                );
              })}
            </ul>
          )}

          {hasLength(lcrs) && (
            <ul className="m">
              <li>
                <strong>Outbound Call Routing:</strong>
              </li>
              {lcrs.map((lcr) => {
                return (
                  <li className="txt--teal" key={lcr.lcr_sid}>
                    {lcr.name || "Default route"}
                  </li>
                );
              })}
            </ul>
          )}
        </ModalClose>
      )}
    </>
  );
};
