import React, { useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import AccountForm from '../../forms/AccountForm';
import TableContent from '../../blocks/TableContent.js';

const AccountsAddEdit = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  let { account_sid } = useParams();
  const pageTitle = account_sid ? 'Edit Account' : 'Add Account';
  useEffect(() => {
    document.title = `${pageTitle} | Jambonz | Open Source CPAAS`;
  });

  //=============================================================================
  // Get API keys
  //=============================================================================
  const getApiKeys = async () => {
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
      const results = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Accounts/${account_sid}/ApiKeys`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const simplifiedApiKeys = results.data.map(a => {
        const { token } = a;
        const maskLength = token.length - 4;
        const maskedPortion = token.substring(0, maskLength).replace(/[a-zA-Z0-9]/g, '*');
        const revealedPortion = token.substring(maskLength);
        const maskedToken = `${maskedPortion}${revealedPortion}`;

        const { last_used } = a;
        let lastUsedString = 'Never used';
        if (last_used) {
          const currentDate = new Date();
          const lastUsedDate = new Date(last_used);
          currentDate.setHours(0,0,0,0);
          lastUsedDate.setHours(0,0,0,0);
          const daysDifference = Math.round((currentDate - lastUsedDate) / 1000 / 60 / 60 / 24);
          lastUsedString = daysDifference > 1
            ? `${daysDifference} days ago`
            : daysDifference === 1
              ? 'Yesterday'
              : daysDifference === 0
                ? 'Today'
                : 'Never used';
        }

        return {
          sid: a.api_key_sid,
          token: {
            type: 'masked',
            masked: maskedToken,
            revealed: token,
          },
          last_used: {
            type: 'normal',
            content: lastUsedString,
          },
        };
      });
      return(simplifiedApiKeys);
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
        dispatch({
          type: 'ADD',
          level: 'error',
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get API key data',
        });
      }
    }
  };

  //=============================================================================
  // Create API key
  //=============================================================================
  const createApiKey = async () => {
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
      const result = await axios({
        method: 'post',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Apikeys',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: {
          "account_sid": account_sid,
        }
      });
      return result.data.token;
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
        dispatch({
          type: 'ADD',
          level: 'error',
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to create API key',
        });
        return 'error';
      }
    }
  };

  //=============================================================================
  // Delete API key
  //=============================================================================
  const formatApiKeyToDelete = apiKey => {
    const items = [
      { name: 'API Key:'   , content: apiKey.token.masked      || '[none]'     },
      { name: 'Last Used:' , content: apiKey.last_used.content || 'Never used' },
    ];
    return items;
  };
  const deleteApiKey = async apiKeyToDelete => {
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
        url: `/Apikeys/${apiKeyToDelete.sid}`,
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
        return ((err.response && err.response.data && err.response.data.msg) || 'Unable to delete API key');
      }
    }
  };

  //=============================================================================
  // Render
  //=============================================================================
  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
      breadcrumbs={[
        { name: 'Accounts', url: '/internal/accounts' },
        { name: pageTitle },
      ]}
      additionalTable={account_sid && (
        <TableContent
          name="API key"
          getContent={getApiKeys}
          columns={[
            { header: 'API Key',   key: 'token',     width: '27rem', fontWeight: 'normal' },
            { header: 'Last Used', key: 'last_used', width: '10rem' },
          ]}
          addContent={createApiKey}
          formatContentToDelete={formatApiKeyToDelete}
          deleteContent={deleteApiKey}
          rowsHaveDeleteButtons
        />
      )}
    >
      <AccountForm
        type={account_sid ? 'edit' : 'add'}
        account_sid={account_sid}
      />
    </InternalTemplate>
  );
};

export default AccountsAddEdit;
