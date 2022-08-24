import React, { useEffect, useState } from "react";
import { Button, H1, Icon } from "jambonz-ui";
import {
  deletePhoneNumber,
  putPhoneNumber,
  useApiData,
  useServiceProviderData,
} from "src/api";
import { Account, Application, PhoneNumber, VoipCarrier } from "src/api/types";
import { toastError, toastSuccess } from "src/store";
import { Link } from "react-router-dom";
import { Icons, Section, Spinner } from "src/components";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_CARRIERS,
  ROUTE_INTERNAL_PHONE_NUMBERS,
} from "src/router/routes";
import DeletePhoneNumber from "./delete";
import { Selector } from "src/components/forms";

export const PhoneNumbers = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [voipCarriers] = useApiData<VoipCarrier[]>("VoipCarriers");

  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber | null>(null);
  const [phoneNumbers, refetch] =
    useServiceProviderData<PhoneNumber[]>("PhoneNumbers");

  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<
    PhoneNumber["phone_number_sid"][]
  >([]);
  const [applications] = useApiData<Application[]>("Applications");
  const [applicationSid, setApplicationSid] = useState("");
  const [showSelectApplication, setShowSelectApplication] = useState(false);

  const handleMassEdit = () => {
    // the webapp allows changing to an application of another account
    // but during the edit, that option is unavailable
    // so there is something with application involving with account
    // this mass edit allows free for all, so not sure if it should be a thing
    // the webapp will force the phone number to use that application
    selectedPhoneNumbers.forEach((sid) => {
      const payload: Partial<PhoneNumber> = {
        application_sid: applicationSid,
      };

      putPhoneNumber(sid, payload)
        .then(() => {
          refetch();
          toastSuccess("Number routing updated successfully");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    });
  };

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

  useEffect(() => {
    if (applicationSid !== "") {
      handleMassEdit();
      setSelectedPhoneNumbers([]);
      setApplicationSid("");
      setShowSelectApplication(false);
    }
  }, [applicationSid]);

  useEffect(() => {
    if (selectedPhoneNumbers.length === 0) {
      setShowSelectApplication(false);
    }
  }, [selectedPhoneNumbers]);

  return (
    <>
      <section className="mast">
        <H1>Phone numbers</H1>
        {selectedPhoneNumbers && selectedPhoneNumbers.length > 0 && (
          <>
            {!showSelectApplication ? (
              <Button onClick={() => setShowSelectApplication(true)}>
                Choose Application
              </Button>
            ) : (
              applications && (
                <fieldset>
                  <label htmlFor="application_name">Application</label>
                  <Selector
                    id="application_name"
                    name="application_name"
                    value={applicationSid}
                    options={[
                      {
                        name: "Choose application",
                        value: "",
                      },
                    ].concat(
                      applications.map((application) => ({
                        name: application.name,
                        value: application.application_sid,
                      }))
                    )}
                    onChange={(e) => setApplicationSid(e.target.value)}
                  />
                </fieldset>
              )
            )}
          </>
        )}
        {accounts && accounts.length > 0 && (
          <Link
            to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/add`}
            title="Add a phone number"
          >
            <Icon>
              <Icons.Plus />
            </Icon>
          </Link>
        )}
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
                      <div className="item__checkbox">
                        <input
                          id="select_item"
                          name="select_item"
                          type="checkbox"
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedPhoneNumbers((curr) => [
                                  ...curr,
                                  phoneNumber.phone_number_sid,
                                ])
                              : setSelectedPhoneNumbers((curr) =>
                                  curr.filter(
                                    (phone) =>
                                      phone !== phoneNumber.phone_number_sid
                                  )
                                )
                          }
                          // not sure how is should uncheck itself
                          // checked={selectedPhoneNumbers.length !== 0}
                        />
                      </div>
                      <div className="item__title">
                        <Link
                          to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/${phoneNumber.phone_number_sid}/edit`}
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
                        to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/${phoneNumber.phone_number_sid}/edit`}
                        title="Edit phone number"
                        className="i"
                      >
                        <Icons.Edit3 />
                      </Link>
                      <button
                        type="button"
                        title="Delete phone number"
                        onClick={() => setPhoneNumber(phoneNumber)}
                        className="btnty"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : accounts && accounts.length > 0 ? (
              voipCarriers && voipCarriers.length > 0 ? (
                <div>No phone numbers yet.</div>
              ) : (
                <div>
                  You must{" "}
                  <Link to={`${ROUTE_INTERNAL_CARRIERS}/add`}>
                    create a carrier
                  </Link>{" "}
                  before you can create a phone number.
                </div>
              )
            ) : (
              <div>
                You must{" "}
                <Link to={`${ROUTE_INTERNAL_ACCOUNTS}/add`}>
                  create an account
                </Link>{" "}
                before you can create a phone number.
              </div>
            )
          ) : (
            <Spinner />
          )}
        </div>
      </Section>
      <Section clean>
        {accounts &&
          accounts.length > 0 &&
          voipCarriers &&
          voipCarriers.length > 0 && (
            <Button small as={Link} to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/add`}>
              Add phone number
            </Button>
          )}
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
