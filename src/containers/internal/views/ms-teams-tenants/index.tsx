import React, { useState } from "react";
import { Button, H1, Icon, M } from "jambonz-ui";
import { Link } from "react-router-dom";

import { deleteMsTeamsTenant, useApiData } from "src/api";
import { withAccessControl } from "src/utils";
import { toastError, toastSuccess } from "src/store";
import { Icons, Section, Spinner } from "src/components";
import { ROUTE_INTERNAL_MS_TEAMS_TENANTS } from "src/router/routes";
import { DeleteMsTeamsTenant } from "./delete";

import type { MSTeamsTenant } from "src/api/types";
import type { ACLGetIMessage } from "src/utils/with-access-control";

export const MSTeamsTenants = () => {
  const [msTeamsTenant, setMsTeamsTenant] = useState<MSTeamsTenant | null>(
    null
  );
  const [msTeamsTenants, refetch] = useApiData<MSTeamsTenant[]>(
    "MicrosoftTeamsTenants"
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
        <H1>Mircosoft Teams Tenants</H1>
        <Link
          to={`${ROUTE_INTERNAL_MS_TEAMS_TENANTS}/add`}
          title="Add a Microsoft Teams Tenant"
        >
          <Icon>
            <Icons.Plus />
          </Icon>
        </Link>
      </section>
      <Section
        {...(msTeamsTenants && msTeamsTenants.length > 0 ? { slim: true } : {})}
      >
        <div className="list">
          {msTeamsTenants ? (
            msTeamsTenants.length > 0 ? (
              msTeamsTenants.map((msTeamsTenant) => {
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
                      <div className="item__sid">
                        <strong>SID:</strong>{" "}
                        <code>{msTeamsTenant.ms_teams_tenant_sid}</code>
                      </div>
                      {/* some other infor like account and application will be done here as soon as the approriate change comes TODO?*/}
                      {/* <div className="item__account">
                        <strong>Account:</strong> <code>{accountName}</code>
                      </div>
                      <div className="item__application">
                        <strong>application:</strong>{" "}
                        <code>{applicationName || "[None]"}</code>
                      </div> */}
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
            ) : (
              <M>No Microsoft Teams Tenant yet.</M>
            )
          ) : (
            <Spinner />
          )}
        </div>
      </Section>
      <Section clean>
        <Button small as={Link} to={`${ROUTE_INTERNAL_MS_TEAMS_TENANTS}/add`}>
          Add Microsoft Teams Tenant
        </Button>
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
