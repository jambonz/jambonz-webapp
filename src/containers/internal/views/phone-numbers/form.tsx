import { Button, ButtonGroup, MS } from "jambonz-ui";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  postPhoneNumber,
  putPhoneNumber,
  useApiData,
  useServiceProviderData,
} from "src/api";
import { Section } from "src/components";
import { Message, Selector } from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_CARRIERS,
  ROUTE_INTERNAL_PHONE_NUMBERS,
} from "src/router/routes";
import { toastError, toastSuccess } from "src/store";

import type {
  Account,
  Application,
  PhoneNumber,
  Carrier,
  UseApiDataMap,
} from "src/api/types";

type PhoneNumberFormProps = {
  phoneNumber?: UseApiDataMap<PhoneNumber>;
};

export const PhoneNumberForm = ({ phoneNumber }: PhoneNumberFormProps) => {
  const navigate = useNavigate();
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useApiData<Application[]>("Applications");
  const [phoneNumbers] = useServiceProviderData<PhoneNumber[]>("PhoneNumbers");
  const [carriers] = useApiData<Carrier[]>("VoipCarriers");
  const [phoneNumberNum, setPhoneNumberNum] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [sipTrunkSid, setSipTrunkSid] = useState("");
  const [applicationSid, setApplicationSid] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (phoneNumbers) {
      const filtered =
        phoneNumber && phoneNumber.data
          ? phoneNumbers.filter(
              (a) => a.phone_number_sid !== phoneNumber.data!.phone_number_sid
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
        .then(({ json }) => {
          toastSuccess("Phone number created successfully");
          navigate(`${ROUTE_INTERNAL_PHONE_NUMBERS}/${json.sid}/edit`);
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
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
    if (accounts && !accounts.length) {
      toastError(
        "You must create an account before you can create a phone number."
      );
      navigate(ROUTE_INTERNAL_ACCOUNTS);
    }

    if (carriers && carriers.length === 0) {
      toastError(
        "You must create a SIP trunk before you can create a phone number."
      );
      navigate(ROUTE_INTERNAL_CARRIERS);
    }

    if (accounts && !accountSid) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, accountSid]);

  useEffect(() => {
    if (carriers && !sipTrunkSid) {
      setSipTrunkSid(carriers[0].voip_carrier_sid);
    }
  });

  return (
    <>
      <Section slim>
        <form className="form form--internal" onSubmit={handleSubmit}>
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
          {carriers && (
            <fieldset>
              <label htmlFor="sip_trunk">
                SIP Trunk <span>*</span>
              </label>
              <Selector
                id="sip_trunk"
                name="sip_trunk"
                required
                value={sipTrunkSid}
                options={carriers.map((trunk) => ({
                  name: trunk.name,
                  value: trunk.voip_carrier_sid,
                }))}
                onChange={(e) => {
                  setSipTrunkSid(e.target.value);
                  console.log(e.target.value);
                }}
                disabled={phoneNumber ? true : false}
              />
            </fieldset>
          )}
          {accounts && (
            <fieldset>
              <label htmlFor="account_name">
                Account <span>*</span>
              </label>
              <Selector
                id="account_name"
                name="account_name"
                required
                value={accountSid}
                options={accounts.map((account) => ({
                  name: account.name,
                  value: account.account_sid,
                }))}
                onChange={(e) => setAccountSid(e.target.value)}
              />
            </fieldset>
          )}
          {applications && accountSid && (
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
                  applications
                    .filter(
                      (application) => application.account_sid === accountSid
                    )
                    .map((application) => ({
                      name: application.name,
                      value: application.application_sid,
                    }))
                )}
                onChange={(e) => setApplicationSid(e.target.value)}
              />
            </fieldset>
          )}
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
