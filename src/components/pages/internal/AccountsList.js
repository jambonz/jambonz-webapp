/* eslint-disable no-undef */
import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';
import { ServiceProviderValueContext } from '../../../contexts/ServiceProviderContext';
import { APP_API_BASE_URL } from "../../../constants";

const AccountsList = () => {
  let history = useHistory();
  const currentServiceProvider = useContext(ServiceProviderValueContext);
  const dispatch = useContext(NotificationDispatchContext);
  useEffect(() => {
    document.title = `Accounts | Jambonz | Open Source CPAAS`;
  });

  //=============================================================================
  // Get accounts
  //=============================================================================
  const getAccounts = async () => {
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
      if(!currentServiceProvider) return [];
      const results = await axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: `/ServiceProviders/${currentServiceProvider}/Accounts`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const simplifiedAccounts = results.data.map(a => ({
        sid:         a.account_sid,
        name:        a.name,
        sip_realm:   a.sip_realm,
        url_reg:     a.registration_hook && a.registration_hook.url,
        url_queue:   a.queue_event_hook && a.queue_event_hook.url,
        subspace_enabled: a.subspace_sip_teleport_id ? 'Enabled' : ''
      }));
      return(simplifiedAccounts);
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
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get account data',
        });
        console.log(err.response || err);
      }
    }
  };

  //=============================================================================
  // Delete account
  //=============================================================================
  const formatAccountToDelete = account => {
    const items = [
      { name: 'Name:'                  , content: account.name      || '[none]' },
      { name: 'SIP Realm:'             , content: account.sip_realm || '[none]' },
      { name: 'Registration Webhook:'  , content: account.url_reg   || '[none]' },
    ];
    return items;
  };
  const deleteAccount = async accountToDelete => {
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

      // Check if any application, phone number, or MS Teams tenant uses this account
      // or if the account has any API keys
      const applicationsPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/Applications',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const phoneNumbersPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/PhoneNumbers',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const msTeamsTenantsPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/MicrosoftTeamsTenants',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const apiKeysPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: `/Accounts/${accountToDelete.sid}/ApiKeys`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const promiseAllValues = await Promise.all([
        applicationsPromise,
        phoneNumbersPromise,
        msTeamsTenantsPromise,
        apiKeysPromise,
      ]);
      const applications   = promiseAllValues[0].data;
      const phoneNumbers   = promiseAllValues[1].data;
      const msTeamsTenants = promiseAllValues[2].data;
      const apiKeys        = promiseAllValues[3].data;

      const accountApps = applications.filter(app => (
        app.account_sid === accountToDelete.sid
      ));
      const accountPhoneNumbers = phoneNumbers.filter(p => (
        p.account_sid === accountToDelete.sid
      ));
      const accountMsTeamsTenants = msTeamsTenants.filter(tenant => (
        tenant.account_sid === accountToDelete.sid
      ));
      let errorMessages = [];
      for (const app of accountApps) {
        errorMessages.push(`Application: ${app.name}`);
      }
      for (const num of accountPhoneNumbers) {
        errorMessages.push(`Phone Number: ${num.number}`);
      }
      for (const tenant of accountMsTeamsTenants) {
        errorMessages.push(`Microsoft Teams Tenant: ${tenant.tenant_fqdn}`);
      }
      for (const apiKey of apiKeys) {
        const maskLength = apiKey.token.length - 4;
        const maskedPortion = apiKey.token.substring(0, maskLength).replace(/[a-zA-Z0-9]/g, '*');
        const revealedPortion = apiKey.token.substring(maskLength);
        const maskedToken = `${maskedPortion}${revealedPortion}`;
        errorMessages.push(`API Key: ${maskedToken}`);
      }
      if (errorMessages.length) {
        return (
          <React.Fragment>
            <p style={{ margin: '0.5rem 0' }}>
              This account cannot be deleted because it is in use by:
            </p>
            <ul style={{ margin: '0.5rem 0' }}>
              {errorMessages.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </React.Fragment>
        );
      }

      // Delete account
      await axios({
        method: 'delete',
        baseURL: APP_API_BASE_URL,
        url: `/Accounts/${accountToDelete.sid}`,
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
        return ((err.response && err.response.data && err.response.data.msg) || 'Unable to delete account');
      }
    }
  };

  //=============================================================================
  // Render
  //=============================================================================
  return (
    <InternalTemplate
      title="Accounts"
      addButtonText="Add an Account"
      addButtonLink="/internal/accounts/add"
    >
      <TableContent
        name="account"
        urlParam="accounts"
        getContent={getAccounts}
        columns={[
          { header: 'Name',                 key: 'name'      },
          { header: 'AccountSid',           key: 'sid'       },
          { header: 'SIP Realm',            key: 'sip_realm' },
          { header: 'Registration Webhook', key: 'url_reg'       },
          { header: 'Queue Event Webhook',  key: 'url_queue'       }
        ]}
        formatContentToDelete={formatAccountToDelete}
        deleteContent={deleteAccount}
      />
    </InternalTemplate>
  );
};

export default AccountsList;
