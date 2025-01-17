import { Button, ButtonGroup, MS } from "@jambonz/ui-kit";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  postPhoneNumber,
  putPhoneNumber,
  useServiceProviderData,
} from "src/api";
import { Section } from "src/components";
import {
  Message,
  AccountSelect,
  ApplicationSelect,
  TypeaheadSelector,
} from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_CARRIERS,
  ROUTE_INTERNAL_PHONE_NUMBERS,
} from "src/router/routes";
import { toastError, toastSuccess } from "src/store";
import { hasLength, useRedirect } from "src/utils";

import type {
  Account,
  Application,
  PhoneNumber,
  Carrier,
  UseApiDataMap,
} from "src/api/types";
import { setAccountFilter, setLocation } from "src/store/localStore";

type PhoneNumberFormProps = {
  phoneNumber?: UseApiDataMap<PhoneNumber>;
};

export const PhoneNumberForm = ({ phoneNumber }: PhoneNumberFormProps) => {
  const navigate = useNavigate();
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useServiceProviderData<Application[]>("Applications");
  const [phoneNumbers] = useServiceProviderData<PhoneNumber[]>("PhoneNumbers");
  const [carriers] = useServiceProviderData<Carrier[]>("VoipCarriers");
  const [phoneNumberNum, setPhoneNumberNum] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [sipTrunkSid, setSipTrunkSid] = useState("");
  const [applicationSid, setApplicationSid] = useState("");
  const [message, setMessage] = useState("");

  useRedirect<Account>(
    accounts,
    ROUTE_INTERNAL_ACCOUNTS,
    "You must create an account before you can create a phone number.",
  );

  useRedirect<Carrier>(
    carriers,
    ROUTE_INTERNAL_CARRIERS,
    "You must create a SIP trunk before you can create a phone number.",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (phoneNumbers) {
      const filtered =
        phoneNumber && phoneNumber.data
          ? phoneNumbers.filter(
              (a) => a.phone_number_sid !== phoneNumber.data!.phone_number_sid,
            )
          : phoneNumbers;

      if (filtered.find((a) => a.number === phoneNumberNum)) {
        setMessage("The phone number you have entered is already in use.");
        return;
      }
    }

    const payload = {
      account_sid: accountSid,
      application_sid: applicationSid || null,
    };

    if (phoneNumber && phoneNumber.data) {
      putPhoneNumber(phoneNumber.data.phone_number_sid, payload)
        .then(() => {
          phoneNumber.refetch();
          toastSuccess("Phone number updated successfully");
          navigate(
            `${ROUTE_INTERNAL_PHONE_NUMBERS}/${phoneNumber.data?.phone_number_sid}/edit`,
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    } else {
      postPhoneNumber({
        ...payload,
        number: phoneNumberNum,
        voip_carrier_sid: sipTrunkSid,
      })
        .then(() => {
          toastSuccess("Phone number created successfully");
          navigate(ROUTE_INTERNAL_PHONE_NUMBERS);
          setAccountFilter(accountSid);
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    setLocation();
    if (phoneNumber && phoneNumber.data) {
      setPhoneNumberNum(phoneNumber.data.number);

      if (phoneNumber.data.voip_carrier_sid) {
        setSipTrunkSid(phoneNumber.data.voip_carrier_sid);
      }

      if (phoneNumber.data.account_sid) {
        setAccountSid(phoneNumber.data.account_sid);
      }

      if (phoneNumber.data.application_sid) {
        setApplicationSid(phoneNumber.data.application_sid);
      }
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (hasLength(carriers) && !sipTrunkSid) {
      setSipTrunkSid(carriers[0].voip_carrier_sid);
    }
  }, [carriers, sipTrunkSid]);

  return (
    <>
      <Section slim>
        <form
          className={`form form--internal ${
            !phoneNumber?.data && phoneNumber?.refetch ? "form--blur" : ""
          }`}
          onSubmit={handleSubmit}
        >
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
          </fieldset>
          <fieldset>
            <label htmlFor="phone_number">
              Phone number <span>*</span>
            </label>
            <input
              id="phone_number"
              required
              type="text"
              name="phone_number"
              placeholder="Phone number that will be sending calls to this service"
              value={phoneNumberNum}
              onChange={(e) => setPhoneNumberNum(e.target.value)}
              disabled={phoneNumber ? true : false}
            ></input>
          </fieldset>
          <fieldset>
            <label htmlFor="sip_trunk">
              Carrier <span>*</span>
            </label>
            <TypeaheadSelector
              id="sip_trunk"
              name="sip_trunk"
              required
              value={sipTrunkSid}
              options={
                carriers
                  ? carriers.map((trunk) => ({
                      name: trunk.name,
                      value: trunk.voip_carrier_sid,
                    }))
                  : []
              }
              onChange={(e) => {
                setSipTrunkSid(e.target.value);
              }}
              disabled={phoneNumber ? true : false}
            />
          </fieldset>
          <fieldset>
            <AccountSelect
              accounts={accounts}
              account={[accountSid, setAccountSid]}
            />
          </fieldset>
          <fieldset>
            <ApplicationSelect
              defaultOption="Choose application"
              application={[applicationSid, setApplicationSid]}
              applications={
                applications
                  ? applications
                      .filter(
                        (application) => application.account_sid === accountSid,
                      )
                      .sort((a, b) => a.name.localeCompare(b.name))
                  : []
              }
            />
          </fieldset>
          {message && <fieldset>{<Message message={message} />}</fieldset>}
          <fieldset>
            <ButtonGroup left>
              <Button
                small
                subStyle="grey"
                as={Link}
                to={ROUTE_INTERNAL_PHONE_NUMBERS}
              >
                Cancel
              </Button>
              <Button type="submit" small>
                Save
              </Button>
            </ButtonGroup>
          </fieldset>
        </form>
      </Section>
    </>
  );
};
