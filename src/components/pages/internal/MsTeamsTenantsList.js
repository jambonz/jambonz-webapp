import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';

const MsTeamsTenantsList = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  useEffect(() => {
    document.title = `Microsoft Teams Tenants | Jambonz | Open Source CPAAS`;
  });

  //=============================================================================
  // Get data
  //=============================================================================
  const getMsTeamsTenants = async () => {
    try {
      if (!localStorage.getItem('token')) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You must log in to view that page.',
        });
        return;
      }
      const msTeamsTenantsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/MicrosoftTeamsTenants',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const accountsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Accounts',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const applicationsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Applications',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const promiseAllValues = await Promise.all([
        msTeamsTenantsPromise,
        accountsPromise,
        applicationsPromise,
      ]);
      const msTeamsTenants = promiseAllValues[0].data;
      const accounts       = promiseAllValues[1].data;
      const applications   = promiseAllValues[2].data;

      const combinedData = msTeamsTenants.map(team => {
        const account     =     accounts.filter(a => a.account_sid      === team.account_sid    );
        const application = applications.filter(a => a.application_sid  === team.application_sid);
        return {
          sid:         team.ms_teams_tenant_sid,
          fqdn:        team.tenant_fqdn,
          account:     account[0]     && account[0].name,
          application: application[0] && application[0].name,
        };
      });
      return(combinedData);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        dispatch({
          type: 'ADD',
          level: 'error',
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get Microsoft Teams Tenant data',
        });
        console.log(err.response || err);
      }
    }
  };

  //=============================================================================
  // Delete Microsoft Teams Tenant
  //=============================================================================
  const formatTenantsToDelete = team => {
    return [
      { name: 'FQDN:',        content: team.fqdn        || '[none]' },
      { name: 'Account:',     content: team.account     || '[none]' },
      { name: 'Application:', content: team.application || '[none]' },
    ];
  };
  const deleteTenant = async tenant => {
    try {
      if (!localStorage.getItem('token')) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You must log in to view that page.',
        });
        return;
      }
      await axios({
        method: 'delete',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/MicrosoftTeamsTenants/${tenant.sid}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return 'success';
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        console.log(err.response || err);
        return ((err.response && err.response.data && err.response.data.msg) || 'Unable to delete Microsoft Teams Tenant');
      }
    }
  };

  //=============================================================================
  // Render
  //=============================================================================
  return (
    <InternalTemplate
      title="Microsoft Teams Tenants"
      addButtonText="Add a Microsoft Teams Tenant"
      addButtonLink="/internal/ms-teams-tenants/add"
    >
      <TableContent
        name="tenant"
        urlParam="ms-teams-tenants"
        getContent={getMsTeamsTenants}
        columns={[
          { header: 'FQDN',        key: 'fqdn'        },
          { header: 'Account',     key: 'account'     },
          { header: 'Application', key: 'application' },
        ]}
        formatContentToDelete={formatTenantsToDelete}
        deleteContent={deleteTenant}
      />
    </InternalTemplate>
  );
};

export default MsTeamsTenantsList;
