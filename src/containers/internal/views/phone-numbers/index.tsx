import React, { useState } from "react";
import { Button, H1, Icon } from "jambonz-ui";
import { deletePhoneNumber, useServiceProviderData } from "src/api";
import { PhoneNumber } from "src/api/types";
import { toastError, toastSuccess } from "src/store";
import { Link } from "react-router-dom";
import { Icons, Section, Spinner } from "src/components";
import { ROUTE_INTERNAL_PHONE_NUMBERS } from "src/router/routes";
import DeletePhoneNumber from "./delete";

export const PhoneNumbers = () => {
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber | null>(null);
  const [phoneNumbers, refetch] =
    useServiceProviderData<PhoneNumber[]>("PhoneNumbers");

  // const [voipCarriers, setVoipCarriers] = console.log("hello world");

  // const getPhoneNumbers = () => {
  //   getFetch<PhoneNumber[]>("PhoneNumbers")
  //     .then(({ json }) => setPhoneNumbers(json))
  //     .catch((error) => toastError(error));
  // };

  const handleDelete = () => {
    if (phoneNumber) {
      deletePhoneNumber(phoneNumber.phone_number_sid)
        .then(() => {
          refetch();
          setPhoneNumber(null);
          toastSuccess(
            <>
              Deleted phone number <strong>{phoneNumber.number}</strong>
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
        <H1>Phone numbers</H1>
        <Link
          to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/add`}
          title="Add a phone number"
        >
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <Section
        {...(phoneNumbers && phoneNumbers.length > 0 ? { slim: true } : {})}
      >
        <div className="list">
          {phoneNumbers ? (
            phoneNumbers.length > 0 ? (
              phoneNumbers.map((phoneNumber) => {
                return (
                  <div className="item" key={phoneNumber.phone_number_sid}>
                    <div className="item__info">
                      <div className="item__title">
                        <Link
                          to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/${phoneNumber.phone_number_sid}`}
                          title="Edit phone number"
                          className="i"
                        >
                          <strong>{phoneNumber.number}</strong>
                          <Icons.ArrowRight />
                        </Link>
                      </div>
                      <div className="item__sid">
                        <strong>SID:</strong>{" "}
                        <code>{phoneNumber.phone_number_sid}</code>
                      </div>
                      {/**Here it can print more things but that means we should move the fetch applications, etc, to the src/api/index because it seems like there are more things need it
                       * TBD
                       */}
                    </div>
                    <div className="item__actions">
                      <Link
                        to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/${phoneNumber.phone_number_sid}`}
                        title="Edit phone number"
                        className="i"
                      >
                        <Icons.Edit3 />
                      </Link>
                      <button
                        type="button"
                        title="Delete phone number"
                        onClick={() => setPhoneNumber(phoneNumber)}
                        className="btn--type"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div>No phone numbers yet.</div>
            )
          ) : (
            <Spinner />
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/add`}>
          Add phone number
        </Button>
      </Section>
      {phoneNumber && (
        <DeletePhoneNumber
          phoneNumber={phoneNumber}
          handleCancel={() => setPhoneNumber(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default PhoneNumbers;
