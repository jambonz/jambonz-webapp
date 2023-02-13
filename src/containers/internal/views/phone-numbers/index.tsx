import React, { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup, H1, Icon, MS } from "@jambonz/ui-kit";
import { Link } from "react-router-dom";

import {
  deletePhoneNumber,
  putPhoneNumber,
  useServiceProviderData,
} from "src/api";
import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  Icons,
  Section,
  Spinner,
  ApplicationFilter,
  SearchFilter,
  AccountFilter,
} from "src/components";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_CARRIERS,
  ROUTE_INTERNAL_PHONE_NUMBERS,
} from "src/router/routes";
import {
  hasLength,
  hasValue,
  formatPhoneNumber,
  useFilteredResults,
} from "src/utils";
import { DeletePhoneNumber } from "./delete";

import type { Account, PhoneNumber, Carrier, Application } from "src/api/types";
import { USER_ACCOUNT } from "src/api/constants";
import { ScopedAccess } from "src/components/scoped-access";
import { Scope } from "src/store/types";
import { getAccountFilter, setLocation } from "src/store/localStore";

export const PhoneNumbers = () => {
  const user = useSelectState("user");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useServiceProviderData<Application[]>("Applications");
  const [carriers] = useServiceProviderData<Carrier[]>("VoipCarriers");
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber | null>(null);
  const [phoneNumbers, refetch] =
    useServiceProviderData<PhoneNumber[]>("PhoneNumbers");
  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<
    PhoneNumber[]
  >([]);
  const [applicationSid, setApplicationSid] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [applyMassEdit, setApplyMassEdit] = useState(false);
  const [filter, setFilter] = useState("");
  const [accountSid, setAccountSid] = useState("");

  const phoneNumbersFiltered = useMemo(() => {
    setAccountSid(getAccountFilter());
    return phoneNumbers
      ? phoneNumbers.filter(
          (phn) => !accountSid || phn.account_sid === accountSid
        )
      : [];
  }, [accountSid, phoneNumbers]);

  const filteredPhoneNumbers = useFilteredResults<PhoneNumber>(
    filter,
    phoneNumbersFiltered
  );

  const handleMassEdit = () => {
    Promise.all(
      selectedPhoneNumbers.map((phoneNumber) => {
        const payload: Partial<PhoneNumber> = {
          application_sid: applicationSid || null,
        };

        return putPhoneNumber(phoneNumber.phone_number_sid, payload);
      })
    )
      .then(() => {
        refetch();
        setApplicationSid("");
        setApplyMassEdit(false);
        toastSuccess("Number routing updated successfully");
      })
      .catch((error) => {
        setApplicationSid("");
        setApplyMassEdit(false);
        toastError(error.msg);
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
    setLocation();
    if (user?.account_sid && user.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    }
  }, [user]);

  return (
    <>
      <section className="mast">
        <H1 className="h2">Phone numbers</H1>
        {hasLength(accounts) && hasLength(carriers) && (
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
      <section className="filters filters--spaced">
        <SearchFilter
          placeholder="Filter phone numbers"
          filter={[filter, setFilter]}
        />
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            defaultOption
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(filteredPhoneNumbers) && { slim: true })}>
        <div className="list">
          {!hasValue(phoneNumbers) ? (
            <Spinner />
          ) : hasLength(filteredPhoneNumbers) ? (
            <>
              <div className="item item--actions">
                {accountSid ? (
                  <>
                    <div className="mass-edit">
                      <label htmlFor="select_mass" className="chk">
                        <input
                          id="select_mass"
                          name="select_mass"
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectAll(true);
                              setSelectedPhoneNumbers(filteredPhoneNumbers);
                            } else {
                              setSelectAll(false);
                              setSelectedPhoneNumbers([]);
                            }
                          }}
                          checked={selectAll}
                        />
                        <div>Select all</div>
                      </label>
                    </div>
                    {hasLength(selectedPhoneNumbers) && !applyMassEdit && (
                      <ButtonGroup>
                        <ApplicationFilter
                          application={[applicationSid, setApplicationSid]}
                          applications={applications?.filter(
                            (application) =>
                              application.account_sid === accountSid
                          )}
                          defaultOption="None"
                        />
                        <Button
                          small
                          onClick={() => {
                            handleMassEdit();
                            setSelectAll(false);
                            setApplyMassEdit(true);
                            setSelectedPhoneNumbers([]);
                          }}
                        >
                          Apply
                        </Button>
                      </ButtonGroup>
                    )}
                    {applyMassEdit && (
                      <div className="ispin">
                        <Spinner small />
                        <span className="ms txt--dark">
                          Updating number routing...
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <MS>
                    Select an account to assign applications to phone numbers.
                  </MS>
                )}
              </div>
              {filteredPhoneNumbers.map((phoneNumber) => {
                return (
                  <div className="item" key={phoneNumber.phone_number_sid}>
                    <div className="item__info">
                      <div className="item__title">
                        {accountSid && (
                          <input
                            id="select_item"
                            name="select_item"
                            type="checkbox"
                            checked={
                              selectAll ||
                              selectedPhoneNumbers.find(
                                (phone) =>
                                  phone.phone_number_sid ===
                                  phoneNumber.phone_number_sid
                              )
                                ? true
                                : false
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPhoneNumbers((curr) => [
                                  ...curr,
                                  phoneNumber,
                                ]);
                              } else {
                                setSelectedPhoneNumbers((curr) =>
                                  curr.filter(
                                    (phone) =>
                                      phone.phone_number_sid !==
                                      phoneNumber.phone_number_sid
                                  )
                                );
                              }
                            }}
                          />
                        )}
                        <Link
                          to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/${phoneNumber.phone_number_sid}/edit`}
                          title="Edit phone number"
                          className="i"
                        >
                          <strong>
                            {formatPhoneNumber(phoneNumber.number)}
                          </strong>
                          <Icons.ArrowRight />
                        </Link>
                      </div>
                      <div className="item__meta">
                        <div>
                          <div
                            className={`i txt--${
                              phoneNumber.account_sid ? "teal" : "grey"
                            }`}
                          >
                            <Icons.Activity />
                            <span>
                              {
                                accounts?.find(
                                  (acct) =>
                                    acct.account_sid === phoneNumber.account_sid
                                )?.name
                              }
                            </span>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`i txt--${
                              phoneNumber.application_sid ? "teal" : "grey"
                            }`}
                          >
                            <Icons.Grid />
                            <span>
                              {applications?.find(
                                (app) =>
                                  app.application_sid ===
                                  phoneNumber.application_sid
                              )?.name || "None"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="item__actions">
                      <Link
                        to={`${ROUTE_INTERNAL_PHONE_NUMBERS}/${phoneNumber.phone_number_sid}/edit`}
                        title="Edit phone number"
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
              })}
            </>
          ) : hasLength(accounts) ? (
            hasLength(carriers) ? (
              <div>No phone numbers.</div>
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
          )}
        </div>
      </Section>
      <Section clean>
        {hasLength(accounts) && hasLength(carriers) && (
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
