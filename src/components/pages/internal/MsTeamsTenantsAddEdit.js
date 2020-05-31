import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InternalTemplate from '../../templates/InternalTemplate';
import MsTeamsTenantForm from '../../forms/MsTeamsTenantForm';

const MsTeamsTenantsAddEdit = () => {
  let { ms_teams_tenant_sid } = useParams();
  const pageTitle = ms_teams_tenant_sid ? 'Edit Microsoft Teams Tenant' : 'Add Microsoft Teams Tenant';
  useEffect(() => {
    document.title = `${pageTitle} | Jambonz | Open Source CPAAS`;
  });
  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
      breadcrumbs={[
        { name: 'Microsoft Teams Tenants', url: '/internal/ms-teams-tenants' },
        { name: pageTitle },
      ]}
    >
      <MsTeamsTenantForm
        type={ms_teams_tenant_sid ? 'edit' : 'add'}
        ms_teams_tenant_sid={ms_teams_tenant_sid}
      />
    </InternalTemplate>
  );
};

export default MsTeamsTenantsAddEdit;
