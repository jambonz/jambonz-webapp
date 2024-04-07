import { Button, H1, MS } from "@jambonz/ui-kit";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailability, postSipRealms } from "src/api";
import DomainInput from "src/components/domain-input";
import { Message } from "src/components/forms";
import { getToken, parseJwt } from "src/router/auth";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { getRootDomain } from "src/store/localStore";
import { UserData } from "src/store/types";
import { hasValue } from "src/utils";

export const RegisterChooseSubdomain = () => {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidDomain, setIsValidDomain] = useState(false);
  const rootDomain = getRootDomain();
  const userData: UserData = parseJwt(getToken());
  const navigate = useNavigate();
  const typingTimeoutRef = useRef<number | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    postSipRealms(userData.account_sid || "", `${name}.${rootDomain}`)
      .then(() => {
        navigate(`${ROUTE_INTERNAL_ACCOUNTS}/${userData.account_sid}/edit`);
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
      getAvailability(`${name}.${rootDomain}`)
        .then(({ json }) =>
          setIsValidDomain(
            Boolean(json.available) && hasValue(name) && name.length != 0,
          ),
        )
        .catch((error) => {
          setErrorMessage(error.msg);
          setIsValidDomain(false);
        });
    }, 500);
  }, [name]);
  return (
    <>
      <H1 className="h2">Choose a subdomain</H1>

      <form className="form form--login" onSubmit={handleSubmit}>
        {errorMessage && <Message message={errorMessage} />}
        <MS>
          This will be the FQDN where your carrier will send calls, and where
          you can register devices to. This can be changed at any time.
        </MS>
        <DomainInput
          id="subdomain"
          name="subdomain"
          value={name}
          setValue={setName}
          placeholder="Your name here"
          root_domain={rootDomain ? `.${rootDomain}` : ""}
          is_valid={isValidDomain}
        />
        <Button type="submit" disabled={!isValidDomain}>
          Complete Registration →
        </Button>
      </form>
    </>
  );
};

export default RegisterChooseSubdomain;
