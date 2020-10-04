import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';

const ApplicationsList = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  useEffect(() => {
    document.title = `Applications | Jambonz | Open Source CPAAS`;
  });

  //=============================================================================
  // Get applications
  //=============================================================================
  const getApplications = async () => {
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
      const applicationsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Applications',
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

      const promiseAllValues = await Promise.all([
        applicationsPromise,
        accountsPromise,
      ]);

      const applications = promiseAllValues[0].data;
      const accounts     = promiseAllValues[1].data;

      const simplifiedApplications = applications.map(app => {
        const account = accounts.filter(acc => acc.account_sid === app.account_sid);
        return {
          sid:                app.application_sid,
          name:               app.name,
          account_sid:        app.account_sid,
          call_hook_url:      app.call_hook && app.call_hook.url,
          status_hook_url:    app.call_status_hook && app.call_status_hook.url,
          messaging_hook_url: app.messaging_hook && app.messaging_hook.url,
          account:            account[0].name,
        };
      });
      return(simplifiedApplications);
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
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get application data',
        });
        console.log(err.response || err);
      }
    }
  };

  //=============================================================================
  // Delete application
  //=============================================================================
  const formatApplicationToDelete = app => {
    return [
      { name: 'Name:',                content: app.name               || '[none]' },
      { name: 'Account:',             content: app.account            || '[none]' },
      { name: 'Calling Webhook:',     content: app.call_hook_url      || '[none]' },
      { name: 'Call Status Webhook:', content: app.status_hook_url    || '[none]' },
      { name: 'Messaging Webhook:',   content: app.messaging_hook_url || '[none]' },
    ];
  };
  const deleteApplication = async applicationToDelete => {
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

      // check if any account or Microsoft Teams Tenant uses this application
      const accountsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Accounts',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const msTeamsTenantsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/MicrosoftTeamsTenants',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const promiseAllValues = await Promise.all([
        accountsPromise,
        msTeamsTenantsPromise,
      ]);

      const accounts       = promiseAllValues[0].data;
      const msTeamsTenants = promiseAllValues[1].data;

      const appAccounts = accounts.filter(acc => (
        acc.device_calling_application_sid === applicationToDelete.sid
      ));
      const appMsTeamsTenants = msTeamsTenants.filter(tenant => (
        tenant.application_sid === applicationToDelete.sid
      ));
      let errorMessages = [];
      for (const account of appAccounts) {
        errorMessages.push(`Account: ${account.name}`);
      }
      for (const tenant of appMsTeamsTenants) {
        errorMessages.push(`Microsoft Teams Tenant: ${tenant.tenant_fqdn}`);
      }
      if (errorMessages.length) {
        return (
          <React.Fragment>
            <p style={{ margin: '0.5rem 0' }}>
              This application cannot be deleted because it is in use by:
            </p>
            <ul style={{ margin: '0.5rem 0' }}>
              {errorMessages.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </React.Fragment>
        );
      }

      // Delete application
      await axios({
        method: 'delete',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Applications/${applicationToDelete.sid}`,
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
        return ((err.response && err.response.data && err.response.data.msg) || 'Unable to delete application');
      }
    }
  };

  //=============================================================================
  // Render
  //=============================================================================
  return (
    <InternalTemplate
      title="Applications"
      addButtonText="Add an Application"
      addButtonLink="/internal/applications/add"
    >
      <TableContent
        name="application"
        urlParam="applications"
        getContent={getApplications}
        columns={[
          { header: 'Name',                key: 'name'            },
          { header: 'Account',             key: 'account'         },
          { header: 'Calling Webhook',     key: 'call_hook_url'   },
          { header: 'Call Status Webhook', key: 'status_hook_url' },
        ]}
        formatContentToDelete={formatApplicationToDelete}
        deleteContent={deleteApplication}
      />
    </InternalTemplate>
  );
};

export default ApplicationsList;
