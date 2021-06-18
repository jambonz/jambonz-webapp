/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';
import styled from "styled-components/macro";
import Select from "../../../components/elements/Select";
import InputGroup from "../../../components/elements/InputGroup";
import { ServiceProviderValueContext } from '../../../contexts/ServiceProviderContext';
import handleErrors from "../../../helpers/handleErrors";

const FilterLabel = styled.span`
  color: #231f20;
  text-align: right;
  font-size: 14px;
  margin-left: 1rem;
  margin-right: 0.5rem;
`;

const StyledInputGroup = styled(InputGroup)`
  padding: 1rem 1rem 0;

  @media (max-width: 767.98px) {
    display: grid;
    grid-template-columns: auto 1fr auto 1fr;
    grid-row-gap: 1rem;
  }

  @media (max-width: 575.98px) {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-row-gap: 1rem;
  }
`;

const AccountSelect = styled(Select)`
  min-width: 150px;
`;

const ApplicationsList = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const currentServiceProvider = useContext(ServiceProviderValueContext);
  const jwt = localStorage.getItem('token');
  const [account, setAccount] = useState("");
  const [accountList, setAccountList] = useState([]);

  useEffect(() => {
    document.title = `Applications | Jambonz | Open Source CPAAS`;
  });

  useEffect(() => {
    if (currentServiceProvider) {
      const getAccounts = async () => {
        try {
          const accountResponse = await axios({
            method: "get",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/ServiceProviders/${currentServiceProvider}/Accounts`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });

          setAccountList((accountResponse.data || []).sort((a, b) => a.name.localeCompare(b.name)));
          if (accountResponse.data.length > 0) {
            setAccount(accountResponse.data[0].account_sid);
          } else {
            setAccount("");
          }
        } catch (err) {
          handleErrors({ err, history, dispatch });
        }
      };

      getAccounts();
    } else {
      setAccountList([]);
    }
  }, [currentServiceProvider]);

  //=============================================================================
  // Get applications
  //=============================================================================
  const getApplications = useCallback(async () => {
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
      if (!account) {
        return [];
      }
      const applicationsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Accounts/${account}/Applications`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const promiseAllValues = await Promise.all([
        applicationsPromise,
      ]);

      const applications = promiseAllValues[0].data;

      const simplifiedApplications = applications.map(app => {
        return {
          sid:                app.application_sid,
          name:               app.name,
          account_sid:        app.account_sid,
          call_hook_url:      app.call_hook && app.call_hook.url,
          status_hook_url:    app.call_status_hook && app.call_status_hook.url,
          messaging_hook_url: app.messaging_hook && app.messaging_hook.url,
          account:            app.account
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
  }, [account]);

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
      <StyledInputGroup flexEnd space>
        <FilterLabel htmlFor="account">Account:</FilterLabel>
        <AccountSelect
          name="account"
          id="account"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        >
          {accountList.map((acc) => (
            <option key={acc.account_sid} value={acc.account_sid}>{acc.name}</option>
          ))}
        </AccountSelect>
      </StyledInputGroup>
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
