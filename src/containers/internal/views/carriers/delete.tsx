import React, { useEffect, useState } from "react";
import { P } from "@jambonz/ui-kit";

import { Modal, ModalClose } from "src/components";
import { getFetch } from "src/api";
import { API_PHONE_NUMBERS } from "src/api/constants";
import { formatPhoneNumber, hasLength } from "src/utils";

import type { Carrier, PhoneNumber } from "src/api/types";

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

  useEffect(() => {
    let ignore = false;

    getFetch<PhoneNumber[]>(API_PHONE_NUMBERS).then(({ json }) => {
      if (!ignore) {
        setPhoneNumbers(
          json.filter(
            (phone) => phone.voip_carrier_sid === carrier.voip_carrier_sid,
          ),
        );
      }
    });

    return function cleanup() {
      ignore = true;
    };
  }, []);

  return (
    <>
      {phoneNumbers && !hasLength(phoneNumbers) && (
        <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
          <P>
            Are you sure you want to delete carrier{" "}
            <strong>{carrier.name}</strong>?
          </P>
        </Modal>
      )}
      {hasLength(phoneNumbers) && (
        <ModalClose handleClose={handleCancel}>
          <P>
            In order to delete the carrier it cannot be in use by any{" "}
            <span>Phone Numbers ({phoneNumbers.length})</span>.
          </P>
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
        </ModalClose>
      )}
    </>
  );
};
