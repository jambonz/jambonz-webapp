import React, { useContext } from 'react';
import axios from 'axios';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';

const ApplicationsList = () => {
  const dispatch = useContext(NotificationDispatchContext);

  //=============================================================================
  // Get applications
  //=============================================================================
  const getApplications = async () => {
    try {
      const results = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Applications',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const simplifiedApplications = results.data.map(a => ({
        sid:             a.application_sid,
        name:            a.name,
        account_sid:     a.account_sid,
        call_hook_url:   a.call_hook && a.call_hook.url,
        status_hook_url: a.call_status_hook && a.call_status_hook.url,
      }));
      return(simplifiedApplications);
    } catch (err) {
      dispatch({
        type: 'ADD',
        level: 'error',
        message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get application data',
      });
      console.log(err.response || err);
    }
  };

  //=============================================================================
  // Delete application
  //=============================================================================
  const formatApplicationToDelete = app => {
    return [
      { name: 'Name:',                content: app.name            || '' },
      { name: 'Calling Webhook:',     content: app.call_hook_url   || '' },
      { name: 'Call Status Webhook:', content: app.status_hook_url || '' },
    ];
  };
  const deleteApplication = async applicationToDelete => {
    try {
      await axios({
        method: 'delete',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Applications/${applicationToDelete.sid}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return true;
    } catch (err) {
      dispatch({
        type: 'ADD',
        level: 'error',
        message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get delete application',
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
