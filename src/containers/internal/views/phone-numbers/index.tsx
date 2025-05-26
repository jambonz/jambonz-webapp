import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, H1, Icon, MS } from "@jambonz/ui-kit";
import { Link } from "react-router-dom";

import {
  deletePhoneNumber,
  getPhoneNumbers,
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
  Pagination,
  SelectFilter,
} from "src/components";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_CARRIERS,
  ROUTE_INTERNAL_PHONE_NUMBERS,
} from "src/router/routes";
import { hasLength, hasValue, formatPhoneNumber } from "src/utils";
import { DeletePhoneNumber } from "./delete";

import type { Account, PhoneNumber, Carrier, Application } from "src/api/types";
import { PER_PAGE_SELECTION, USER_ACCOUNT } from "src/api/constants";
import { ScopedAccess } from "src/components/scoped-access";
import { Scope } from "src/store/types";
import { getAccountFilter, setLocation } from "src/store/localStore";

export const PhoneNumbers = () => {
  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useServiceProviderData<Application[]>("Applications");
  const [carriers] = useServiceProviderData<Carrier[]>("VoipCarriers");
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[] | null>(null);
  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<
    PhoneNumber[]
  >([]);
  const [applicationSid, setApplicationSid] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [applyMassEdit, setApplyMassEdit] = useState(false);
  const [filter, setFilter] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [phoneNumbersTotal, setphoneNumbersTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [maxPageNumber, setMaxPageNumber] = useState(1);

  const refetch = (resetPage: boolean) => {
    setPhoneNumbers(null);
    if (resetPage) {
      setPageNumber(1);
    }
    getPhoneNumbers({
      page: resetPage ? 1 : pageNumber,
      page_size: Number(perPageFilter),
      ...(accountSid && { account_sid: accountSid }),
      ...(filter && { filter }),
      ...(currentServiceProvider && {
        service_provider_sid: currentServiceProvider.service_provider_sid,
      }),
    })
      .then(({ json }) => {
        if (json) {
          setPhoneNumbers(json.data);
          setphoneNumbersTotal(json.total);
          setMaxPageNumber(Math.ceil(json.total / Number(perPageFilter)));
        }
      })
      .catch((error) => {
        setPhoneNumbers([]);
        toastError(error.msg);
      });
  };

  const handleMassEdit = () => {
    Promise.all(
      selectedPhoneNumbers.map((phoneNumber) => {
        const payload: Partial<PhoneNumber> = {
          application_sid: applicationSid || null,
        };

        return putPhoneNumber(phoneNumber.phone_number_sid, payload);
      }),
    )
      .then(() => {
        refetch(false);
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
          refetch(false);
          setPhoneNumber(null);
          toastSuccess(
            <>
              Deleted phone number <strong>{phoneNumber.number}</strong>
            </>,
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

  useEffect(() => {
    setAccountSid(getAccountFilter() || accountSid);
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    }
  }, []);

  useEffect(() => {
    refetch(false);
  }, [perPageFilter, pageNumber]);

  useEffect(() => {
    refetch(true);
  }, [accountSid, filter, currentServiceProvider]);

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
      <section className="filters filters--multi">
        <SearchFilter
          placeholder="Filter phone numbers"
          filter={[filter, setFilter]}
          delay={1000}
        />
        <ScopedAccess user={user} scope={Scope.service_provider}>
          <AccountFilter
            account={[accountSid, setAccountSid]}
            accounts={accounts}
            defaultOption
          />
        </ScopedAccess>
      </section>
      <Section {...(hasLength(phoneNumbers) && { slim: true })}>
        <div className="list">
          {!hasValue(phoneNumbers) ? (
            <Spinner />
          ) : hasLength(phoneNumbers) ? (
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
                              setSelectedPhoneNumbers(phoneNumbers);
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
                              application.account_sid === accountSid,
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
              {phoneNumbers.map((phoneNumber) => {
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
                                  phoneNumber.phone_number_sid,
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
                                      phoneNumber.phone_number_sid,
                                  ),
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
                                    acct.account_sid ===
                                    phoneNumber.account_sid,
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
                                  phoneNumber.application_sid,
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
      <footer>
        <ButtonGroup>
          <MS>
            Total: {phoneNumbersTotal} record
            {phoneNumbersTotal === 1 ? "" : "s"}
          </MS>
          {hasLength(phoneNumbers) && (
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
