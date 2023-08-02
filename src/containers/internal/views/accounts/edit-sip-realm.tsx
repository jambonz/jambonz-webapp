import { Button, ButtonGroup, H1, MS } from "@jambonz/ui-kit";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAvailability, postSipRealms, useApiData } from "src/api";
import { CurrentUserData } from "src/api/types";
import { Section } from "src/components";
import DomainInput from "src/components/domain-input";
import { Message } from "src/components/forms";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { hasValue } from "src/utils";

export const EditSipRealm = () => {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const typingTimeoutRef = useRef<number | null>(null);
  const [isValidDomain, setIsValidDomain] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rootDomain = userData?.account?.root_domain;
    const account_sid = userData?.account?.account_sid;

    postSipRealms(account_sid || "", `${name}.${rootDomain}`)
      .then(() => {
        navigate(`${ROUTE_INTERNAL_ACCOUNTS}/${account_sid}/edit`);
      })
      .catch((error) => {
        setErrorMessage(error.msg);
      });
  };

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (!name || name.length < 3) {
      setIsValidDomain(false);
      return;
    }
    setIsValidDomain(false);
    typingTimeoutRef.current = setTimeout(() => {
      getAvailability(`${name}.${userData?.account?.root_domain}`)
        .then(({ json }) =>
          setIsValidDomain(
            Boolean(json.available) && hasValue(name) && name.length != 0
          )
        )
        .catch((error) => {
          setErrorMessage(error.msg);
          setIsValidDomain(false);
        });
    }, 500);
  }, [name]);

  return (
    <>
      <H1 className="h2">Edit Sip Realm</H1>
      <Section slim>
        <form className="form form--internal" onSubmit={handleSubmit}>
          <fieldset>
            <MS>
              This is the domain name where your carrier will send calls, and
              where you can register devices to.
            </MS>
            {errorMessage && <Message message={errorMessage} />}
            <br />
            <DomainInput
              id="sip_realm"
              name="sip_realm"
              value={name}
              setValue={setName}
              placeholder="Your name here"
              root_domain={`.${userData?.account?.root_domain || ""}`}
              is_valid={isValidDomain}
            />
          </fieldset>
          <fieldset>
            <ButtonGroup left>
              <Button
                small
                subStyle="grey"
                as={Link}
                to={`${ROUTE_INTERNAL_ACCOUNTS}/${userData?.account?.account_sid}/edit`}
              >
                Cancel
              </Button>
              <Button type="submit" small disabled={!isValidDomain}>
                Change Sip Realm
              </Button>
            </ButtonGroup>
          </fieldset>
        </form>
      </Section>
    </>
  );
};

export default EditSipRealm;
