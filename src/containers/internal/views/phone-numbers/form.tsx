import { Button, ButtonGroup, MS } from "jambonz-ui";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postPhoneNumber, putPhoneNumber } from "src/api";
import { Account, Application, FetchError, PhoneNumber } from "src/api/types";
import { Section } from "src/components";
import { Message, Selector } from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { ROUTE_INTERNAL_PHONE_NUMBERS } from "src/router/routes";
import { toastError, toastSuccess } from "src/store";

type UsePhoneNumberData = {
  data: PhoneNumber | null;
  error: FetchError | null;
  refetch: () => void;
};

type PhoneNumberFormProps = {
  phoneNumber?: UsePhoneNumberData;
  phoneNumbers: PhoneNumber[] | null;
  accounts: Account[] | null;
  applications: Application[] | null;
  // voipCarriers: VoipCarrier[];
};

export const PhoneNumberForm = ({
  phoneNumber,
  phoneNumbers,
  accounts,
  applications,
}: PhoneNumberFormProps) => {
  const navigate = useNavigate();

  const [phoneNumberNum, setPhoneNumberNum] = useState("");

  const [accountSid, setAccountSid] = useState("");
  const [sipTrunkSid, setSipTrunkSid] = useState(""); // TODO
  const [applicationSid, setApplicationSid] = useState("");

  const [message, setMessage] = useState("");

  const trunkDummy = [
    {
      name: "hello",
      value: "world",
    },
    {
      name: "foo",
      value: "bar",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (phoneNumbers) {
      if (
        phoneNumbers.find(
          (a) =>
            a.number === phoneNumberNum &&
            (!phoneNumber ||
              !phoneNumber.data ||
              a.phone_number_sid !== phoneNumber.data.phone_number_sid)
        )
      ) {
        setMessage("The phone number you have entered is already in use.");
        return;
      }
    }

    const payload = {
      ...(!phoneNumber && { number: phoneNumberNum }),
      // ...(!sipTrunkSid && { voip_carrier_sid: sipTrunkSid }),
      account_sid: accountSid,
      application_sid: applicationSid || null,
      // this field is in the sql but not here and it is never updated in the back end))
      // service_provider_sid: null,
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
      postPhoneNumber(payload)
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
    if (accounts && !accountSid) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, accountSid]);

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
              disabled={phoneNumber ? true : false} // no styling yet
            ></input>
          </fieldset>
          {trunkDummy && (
            <fieldset>
              <label htmlFor="sip_trunk">
                SIP Trunk <span>*</span>
              </label>
              <Selector
                id="sip_trunk"
                name="sip_trunk"
                required
                value={sipTrunkSid}
                // TODO do the TODO
                options={trunkDummy.map((trunk) => ({
                  name: trunk.name,
                  value: trunk.value,
                }))}
                onChange={(e) => setSipTrunkSid(e.target.value)}
                disabled={phoneNumber ? true : false} // this one has style
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
          {applications && (
            <fieldset>
              <label htmlFor="application_name">Application</label>
              <Selector
                id="application_name"
                name="application_name"
                value={applicationSid}
                options={[
                  {
                    name: "-- Optional --",
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

export default PhoneNumberForm;
