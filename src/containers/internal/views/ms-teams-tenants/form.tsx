import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, MS } from "jambonz-ui";
import { Link, useNavigate } from "react-router-dom";

import {
  postMsTeamsTentant,
  putMsTeamsTenant,
  useApiData,
  useServiceProviderData,
} from "src/api";
import { Section } from "src/components";
import {
  Message,
  AccountSelect,
  ApplicationSelect,
} from "src/components/forms";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { toastError, toastSuccess, useSelectState } from "src/store";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_MS_TEAMS_TENANTS,
} from "src/router/routes";
import { useRedirect } from "src/utils";

import type {
  Account,
  Application,
  MSTeamsTenant,
  UseApiDataMap,
} from "src/api/types";

type MsTeamsTenantFormProps = {
  msTeamsTenant?: UseApiDataMap<MSTeamsTenant>;
};

export const MsTeamsTenantForm = ({
  msTeamsTenant,
}: MsTeamsTenantFormProps) => {
  const navigate = useNavigate();
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useServiceProviderData<Application[]>("Applications");
  const [msTeamsTenants] = useApiData<MSTeamsTenant[]>("MicrosoftTeamsTenants");
  const [domainName, setDomainName] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [applicationSid, setApplicationSid] = useState("");
  const [message, setMessage] = useState("");

  useRedirect(
    accounts,
    ROUTE_INTERNAL_ACCOUNTS,
    "You must create an account before you can create an Microsoft Teams Tenant."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (msTeamsTenants) {
      const filtered =
        msTeamsTenant && msTeamsTenant.data
          ? msTeamsTenants.filter(
              (a) =>
                a.ms_teams_tenant_sid !==
                msTeamsTenant.data!.ms_teams_tenant_sid
            )
          : msTeamsTenants;

      if (filtered.find((a) => a.tenant_fqdn === domainName)) {
        setMessage("The domain name you have entered is already in use.");
        return;
      }
    }

    const payload: Partial<MSTeamsTenant> = {
      tenant_fqdn: domainName,
      account_sid: accountSid,
      application_sid: applicationSid || null,
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
      postMsTeamsTentant({
        ...payload,
        service_provider_sid: currentServiceProvider?.service_provider_sid,
      })
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
                ? applications.filter(
                    (application) => application.account_sid === accountSid
                  )
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
