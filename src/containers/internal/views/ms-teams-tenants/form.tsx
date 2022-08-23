import { Button, ButtonGroup, MS } from "jambonz-ui";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { postMsTeamsTentant, putMsTeamsTenant } from "src/api";
import { Section } from "src/components";
import { Message, Selector } from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { toastError, toastSuccess } from "src/store";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_MS_TEAMS_TENANTS,
} from "src/router/routes";

import type {
  Account,
  Application,
  MSTeamsTenant,
  ServiceProvider,
  UseApiDataMap,
} from "src/api/types";

type MsTeamsTenantFormProps = {
  accounts: null | Account[];
  applications: null | Application[];
  msTeamsTenants: null | MSTeamsTenant[];
  currentServiceProvider: null | ServiceProvider;
  msTeamsTenant?: UseApiDataMap<MSTeamsTenant>;
};

export const MsTeamsTenantForm = ({
  accounts,
  applications,
  msTeamsTenants,
  currentServiceProvider,
  msTeamsTenant,
}: MsTeamsTenantFormProps) => {
  const navigate = useNavigate();

  const [domainName, setDomainName] = useState("");

  const [accountSid, setAccountSid] = useState("");
  const [applicationSid, setApplicationSid] = useState("");

  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (msTeamsTenants) {
      if (
        msTeamsTenants.find(
          (a) =>
            a.tenant_fqdn === domainName &&
            (!msTeamsTenant ||
              !msTeamsTenant.data ||
              a.ms_teams_tenant_sid !== msTeamsTenant.data.ms_teams_tenant_sid)
        )
      ) {
        setMessage("The domain name you have entered is already in use.");
        return;
      }
    }

    const payload: Partial<MSTeamsTenant> = {
      ...(!msTeamsTenant && {
        service_provider_sid: currentServiceProvider?.service_provider_sid,
      }),
      tenant_fqdn: domainName,
      account_sid: accountSid,
      application_sid: applicationSid,
    };

    if (msTeamsTenant && msTeamsTenant.data) {
      putMsTeamsTenant(msTeamsTenant.data.ms_teams_tenant_sid, payload)
        .then(() => {
          msTeamsTenant.refetch();
          toastSuccess("Microsoft Teams Tenant updated successfully");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    } else {
      postMsTeamsTentant(payload)
        .then(({ json }) => {
          toastSuccess("Microsoft Teams Tenant created successfully");
          navigate(`${ROUTE_INTERNAL_MS_TEAMS_TENANTS}/${json.sid}/edit`);
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    if (msTeamsTenant && msTeamsTenant.data) {
      if (msTeamsTenant.data.tenant_fqdn) {
        setDomainName(msTeamsTenant.data.tenant_fqdn);
      }

      if (msTeamsTenant.data.account_sid) {
        setAccountSid(msTeamsTenant.data.account_sid);
      }
      if (msTeamsTenant.data.application_sid) {
        setApplicationSid(msTeamsTenant.data.application_sid);
      }
    }
  }, [msTeamsTenant]);

  useEffect(() => {
    if (accounts && !accounts.length) {
      toastError(
        "You must create an account before you can create an application."
      );
      navigate(ROUTE_INTERNAL_ACCOUNTS);
    } else if (accounts && !accountSid) {
      setAccountSid(accounts[0].account_sid);
    }
  }, [accounts, accountSid]);

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        <fieldset>
          <label htmlFor="domain_name">
            Domain Name<span>*</span>
          </label>
          <input
            id="domain_name"
            name="domain_name"
            type="text"
            required
            placeholder="Tenant's fully qualified domain name"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
          />
        </fieldset>
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
              to={ROUTE_INTERNAL_MS_TEAMS_TENANTS}
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
  );
};
