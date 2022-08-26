import React, { useEffect, useState } from "react";
import { P } from "jambonz-ui";

import { Modal, ModalClose } from "src/components";

import type { Carrier, PhoneNumber } from "src/api/types";
import { getFetch } from "src/api";
import { API_PHONE_NUMBERS } from "src/api/constants";
import { hasLength } from "src/utils";
// there is this error that is sent from the backend, not the frontend......
type DeleteProps = {
  carrier: Carrier;
  handleCancel: () => void;
  handleSubmit: () => void;
};

type InUseProps = {
  items: PhoneNumber[];
  sidKey: string;
  labelKey: string;
  itemsLabel: string;
};

interface InUse {
  phones: PhoneNumber[];
}

const InUseItems = ({ items, itemsLabel, sidKey, labelKey }: InUseProps) => {
  return (
    <ul className="m">
      <li>
        <strong>{itemsLabel}:</strong>
      </li>
      {items.map((item) => {
        return (
          <li className="txt--teal" key={item[sidKey as keyof typeof item]}>
            {item[labelKey as keyof typeof item]}
          </li>
        );
      })}
    </ul>
  );
};

export const DeleteCarrier = ({
  carrier,
  handleCancel,
  handleSubmit,
}: DeleteProps) => {
  const [inUse, setInUse] = useState<InUse | null>(null);
  const [isDeletable, setIsDeletable] = useState(false);

  useEffect(() => {
    let ignore = false;

    Promise.all([getFetch<PhoneNumber[]>(API_PHONE_NUMBERS)]).then(
      ([phonesRes]) => {
        if (!ignore) {
          const used = {
            phones: phonesRes.json.filter(
              (phone) => phone.voip_carrier_sid === carrier.voip_carrier_sid
            ),
          };
          const deletable =
            Object.keys(used).reduce((acc, key) => {
              return acc + used[key as keyof InUse].length;
            }, 0) === 0;

          if (deletable) {
            setIsDeletable(deletable);
          } else {
            setInUse(used);
          }
        }
      }
    );

    return function cleanup() {
      ignore = true;
    };
  }, []);
  return (
    <>
      {isDeletable && (
        <Modal handleCancel={handleCancel} handleSubmit={handleSubmit}>
          <P>
            Are you sure you want to delete carrier{" "}
            <strong>{carrier.name}</strong>?
          </P>
        </Modal>
      )}
      {inUse && (
        <ModalClose handleClose={handleCancel}>
          <P>
            In order to delete the carrier it cannot be in use by any{" "}
            <span>Phone Numbers ({inUse.phones.length})</span>.
          </P>
          {hasLength(inUse.phones) && (
            <InUseItems
              items={inUse.phones}
              itemsLabel="Phone Numbers"
              sidKey="phone_number_sid"
              labelKey="number"
            />
          )}
        </ModalClose>
      )}
    </>
  );
};
