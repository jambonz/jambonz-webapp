import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';

const AccountsList = () => {
  const dispatch = useContext(NotificationDispatchContext);
  useEffect(() => {
    document.title = `Accounts | Jambonz | Open Source CPAAS`;
  });

  //=============================================================================
  // Get accounts
  //=============================================================================
  const getAccounts = async () => {
    try {
      const results = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Accounts',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const simplifiedAccounts = results.data.map(a => ({
        sid:         a.account_sid,
        name:        a.name,
        sip_realm:   a.sip_realm,
        url:         a.registration_hook && a.registration_hook.url,
        method:      a.registration_hook && a.registration_hook.method,
        username:    a.registration_hook && a.registration_hook.username,
        password:    a.registration_hook && a.registration_hook.password,
      }));
      return(simplifiedAccounts);
    } catch (err) {
      dispatch({
        type: 'ADD',
        level: 'error',
        message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get account data',
      });
      console.log(err.response || err);
    }
  };

  //=============================================================================
  // Delete account
  //=============================================================================
  const formatAccountToDelete = account => {
    const password = '•'.repeat(account.password && account.password.length) || '[none]';
    return [
      { name: 'Name:'                  , content: account.name      || '' },
      { name: 'SIP Realm:'             , content: account.sip_realm || '' },
      { name: 'Registration Webhook:'  , content: account.url       || '' },
      { name: 'Registration Method:'   , content: account.method    || '' },
      { name: 'Registration Username:' , content: account.username  || '[none]' },
      { name: 'Registration Password:' , content: password },
    ];
  };
  const deleteAccount = async accountToDelete => {
    try {
      // Check if any application or phone number uses this account
      const applicationsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Applications',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const phoneNumbersPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/PhoneNumbers',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const promiseAllValues = await Promise.all([
        applicationsPromise,
        phoneNumbersPromise,
      ]);
      const applications = promiseAllValues[0].data;
      const phoneNumbers = promiseAllValues[1].data;

      const accountApps = applications.filter(app => (
        app.account_sid === accountToDelete.sid
      ));
      const accountPhoneNumbers = phoneNumbers.filter(p => (
        p.account_sid === accountToDelete.sid
      ));
      if (accountApps.length) {
        dispatch({
          type: 'ADD',
          level: 'error',
          message:
          <div>
            <p style={{ margin: '0.5rem 0' }}>
              This account cannot be deleted because it is in use by the
              following application{accountApps.length > 1 && 's'}:
            </p>
            <ul style={{ margin: '0.5rem 0' }}>
              {accountApps.map((app, i) => (
                <li key={i}>{app.name}</li>
              ))}
            </ul>
          </div>
          ,
        });
      }
      if (accountPhoneNumbers.length) {
        dispatch({
          type: 'ADD',
          level: 'error',
          message:
          <div>
            <p style={{ margin: '0.5rem 0' }}>
              This account cannot be deleted because it is in use by the
              following phone number{accountPhoneNumbers.length > 1 && 's'}:
            </p>
            <ul style={{ margin: '0.5rem 0' }}>
              {accountPhoneNumbers.map((p, i) => (
                <li key={i}>{p.number}</li>
              ))}
            </ul>
          </div>
          ,
        });
      }

      if (accountApps.length || accountPhoneNumbers.length) {
        return false;
      }

      // Delete account
      await axios({
        method: 'delete',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Accounts/${accountToDelete.sid}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return true;
    } catch (err) {
      dispatch({
        type: 'ADD',
        level: 'error',
        message: (err.response && err.response.data && err.response.data.msg) || 'Unable to delete account',
      });
      console.log(err.response || err);
      return false;
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
          { header: 'SIP Realm',            key: 'sip_realm' },
          { header: 'Registration Webhook', key: 'url'       },
        ]}
        formatContentToDelete={formatAccountToDelete}
        deleteContent={deleteAccount}
      />
    </InternalTemplate>
  );
};

export default AccountsList;
