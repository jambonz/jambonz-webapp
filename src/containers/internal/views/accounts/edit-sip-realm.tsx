import { Button, ButtonGroup, H1, MS } from "@jambonz/ui-kit";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAvailability, postSipRealms, useApiData } from "src/api";
import { CurrentUserData } from "src/api/types";
import { Section } from "src/components";
import { Message } from "src/components/forms";
import { ROUTE_INTERNAL_ACCOUNTS } from "src/router/routes";

export const EditSipRealm = () => {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rootDomain = userData?.account?.root_domain;
    const account_sid = userData?.account?.account_sid;

    getAvailability(`${name}.${rootDomain}`)
      .then(({ json }) => {
        if (!json.available) {
          setErrorMessage("That subdomain is not available.");
          return;
        }
        postSipRealms(account_sid || "", `${name}.${rootDomain}`)
          .then(() => {
            navigate(`${ROUTE_INTERNAL_ACCOUNTS}/${account_sid}/edit`);
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
            <input
              id="name"
              required
              type="text"
              name="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="fqdn">
              FQDN: {name}.{userData?.account?.root_domain}
            </label>
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
              <Button type="submit" small>
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
