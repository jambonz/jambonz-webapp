import { Button, H1, MS } from "@jambonz/ui-kit";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailability, postSipRealms } from "src/api";
import { Message } from "src/components/forms";
import { getToken, parseJwt } from "src/router/auth";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";
import { getRootDomain } from "src/store/localStore";
import { UserData } from "src/store/types";

export const RegisterChooseSubdomain = () => {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const rootDomain = getRootDomain();
  const userData: UserData = parseJwt(getToken());
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    getAvailability(`${name}.${rootDomain}`)
      .then(({ json }) => {
        if (!json.available) {
          setErrorMessage("That subdomain is not available.");
          return;
        }
        postSipRealms(userData.account_sid || "", `${name}.${rootDomain}`)
          .then(() => {
            navigate(`${ROUTE_INTERNAL_ACCOUNTS}/${userData.account_sid}/edit`);
          })
          .catch((error) => {
            setErrorMessage(error.msg);
          });
      })
      .catch((error) => {
        setErrorMessage(error.msg);
      });
  };
  return (
    <>
      <H1 className="h2">Choose a subdomain</H1>

      <form className="form form--login" onSubmit={handleSubmit}>
        {errorMessage && <Message message={errorMessage} />}
        <MS>
          This will be the FQDN where your carrier will send calls, and where
          you can register devices to. This can be changed at any time.
        </MS>
        <input
          required
          type="text"
          name="username"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Complete Registration →</Button>
      </form>
    </>
  );
};

export default RegisterChooseSubdomain;
