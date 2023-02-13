import React, { useState, useMemo } from "react";
import { Button, H1, Icon, M } from "@jambonz/ui-kit";
import { Link } from "react-router-dom";

import {
  deleteMsTeamsTenant,
  useApiData,
  useServiceProviderData,
} from "src/api";
import {
  hasLength,
  hasValue,
  withAccessControl,
  useFilteredResults,
} from "src/utils";
import { toastError, toastSuccess } from "src/store";
import {
  Icons,
  Section,
  Spinner,
  SearchFilter,
  AccountFilter,
} from "src/components";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_MS_TEAMS_TENANTS,
} from "src/router/routes";
import { DeleteMsTeamsTenant } from "./delete";

import type { Account, MSTeamsTenant, Application } from "src/api/types";
import type { ACLGetIMessage } from "src/utils/with-access-control";

export const MSTeamsTenants = () => {
  const [msTeamsTenant, setMsTeamsTenant] = useState<MSTeamsTenant | null>(
    null
  );
  const [msTeamsTenants, refetch] = useApiData<MSTeamsTenant[]>(
    "MicrosoftTeamsTenants"
  );
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [applications] = useServiceProviderData<Application[]>("Applications");
  const [filter, setFilter] = useState("");
  const [accountSid, setAccountSid] = useState("");

  const msTeamsTenantsFiltered = useMemo(() => {
    return msTeamsTenants
      ? msTeamsTenants.filter(
          (mst) => !accountSid || mst.account_sid === accountSid
        )
      : [];
  }, [accountSid, msTeamsTenants]);

  const filteredMsTeamsTenants = useFilteredResults<MSTeamsTenant>(
    filter,
    msTeamsTenantsFiltered
  );

  const handleDelete = () => {
    if (msTeamsTenant) {
      deleteMsTeamsTenant(msTeamsTenant.ms_teams_tenant_sid)
        .then(() => {
          refetch();
          setMsTeamsTenant(null);
          toastSuccess(
            <>
              Deleted Microsoft Teams Tenant{" "}
              <strong>{msTeamsTenant.tenant_fqdn}</strong>
            </>
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  return (
    <>
      <section className="mast">
        <H1 className="h2">Microsoft Teams Tenants</H1>
        {hasLength(accounts) && (
          <Link
            to={`${ROUTE_INTERNAL_MS_TEAMS_TENANTS}/add`}
            title="Add a Microsoft Teams Tenant"
          >
            <Icon>
              <Icons.Plus />
            </Icon>
          </Link>
        )}
      </section>
      <section className="filters filters--spaced">
        <SearchFilter
          placeholder="Filter ms teams tenants"
          filter={[filter, setFilter]}
        />
        <AccountFilter
          account={[accountSid, setAccountSid]}
          accounts={accounts}
          defaultOption
        />
      </section>
      <Section {...(hasLength(filteredMsTeamsTenants) && { slim: true })}>
        <div className="list">
          {!hasValue(msTeamsTenants) ? (
            <Spinner />
          ) : hasLength(filteredMsTeamsTenants) ? (
            filteredMsTeamsTenants.map((msTeamsTenant) => {
              return (
                <div className="item" key={msTeamsTenant.ms_teams_tenant_sid}>
                  <div className="item__info">
                    <div className="item__title">
                      <Link
                        to={`${ROUTE_INTERNAL_MS_TEAMS_TENANTS}/${msTeamsTenant.ms_teams_tenant_sid}/edit`}
                        title="Edit Microsoft Teams Tenant"
                        className="i"
                      >
                        <strong>{msTeamsTenant.tenant_fqdn}</strong>
                        <Icons.ArrowRight />
                      </Link>
                    </div>
                    <div className="item__meta">
                      <div>
                        <div
                          className={`i txt--${
                            msTeamsTenant.account_sid ? "teal" : "grey"
                          }`}
                        >
                          <Icons.Activity />
                          <span>
                            {
                              accounts?.find(
                                (acct) =>
                                  acct.account_sid === msTeamsTenant.account_sid
                              )?.name
                            }
                          </span>
                        </div>
                      </div>
                      <div>
                        <div
                          className={`i txt--${
                            msTeamsTenant.application_sid ? "teal" : "grey"
                          }`}
                        >
                          <Icons.Grid />
                          <span>
                            {applications?.find(
                              (app) =>
                                app.application_sid ===
                                msTeamsTenant.application_sid
                            )?.name || "None"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="item__actions">
                    <Link
                      to={`${ROUTE_INTERNAL_MS_TEAMS_TENANTS}/${msTeamsTenant.ms_teams_tenant_sid}/edit`}
                      title="Edit Microsoft Teams Tenant"
                      className=""
                    >
                      <Icons.Edit3 />
                    </Link>
                    <button
                      type="button"
                      title="Delete Microsoft Teams Tenant"
                      onClick={() => setMsTeamsTenant(msTeamsTenant)}
                      className="btnty"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              );
            })
          ) : hasLength(accounts) ? (
            <M>No Microsoft Teams Tenant.</M>
          ) : (
            <div>
              You must{" "}
              <Link to={`${ROUTE_INTERNAL_ACCOUNTS}/add`}>
                create an account
              </Link>{" "}
              before you can create a Microsoft Teams Tenant.
            </div>
          )}
        </div>
      </Section>
      <Section clean>
        {hasLength(accounts) && (
          <Button small as={Link} to={`${ROUTE_INTERNAL_MS_TEAMS_TENANTS}/add`}>
            Add Microsoft Teams Tenant
          </Button>
        )}
      </Section>
      {msTeamsTenant && (
        <DeleteMsTeamsTenant
          msTeamsTenant={msTeamsTenant}
          handleCancel={() => setMsTeamsTenant(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

const getAclIMessage: ACLGetIMessage = (currentServiceProvider) => {
  return (
    <>
      <strong>{currentServiceProvider.name}</strong> does not have a fully
      qualified domain name for MS Teams
    </>
  );
};

export default withAccessControl(
  "hasMSTeamsFqdn",
  getAclIMessage
)(MSTeamsTenants);
