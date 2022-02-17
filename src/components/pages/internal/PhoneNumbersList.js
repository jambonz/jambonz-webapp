/* eslint-disable no-undef */
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';
import phoneNumberFormat from '../../../helpers/phoneNumberFormat';
import { ServiceProviderValueContext } from '../../../contexts/ServiceProviderContext';
import { APP_API_BASE_URL } from "../../../constants";

const PhoneNumbersList = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const currentServiceProvider = useContext(ServiceProviderValueContext);

  useEffect(() => {
    document.title = `Phone Number Routing | Jambonz | Open Source CPAAS`;
  }, []);

  //=============================================================================
  // Get phone numbers
  //=============================================================================
  const getPhoneNumbers = useCallback(async () => {
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
      const phoneNumbersPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: `/ServiceProviders/${currentServiceProvider}/PhoneNumbers`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const accountsPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: `/ServiceProviders/${currentServiceProvider}/Accounts`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const applicationsPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: `/ServiceProviders/${currentServiceProvider}/Applications`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const sipTrunksPromise = axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: `/ServiceProviders/${currentServiceProvider}/VoipCarriers`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const promiseAllValues = await Promise.all([
        phoneNumbersPromise,
        accountsPromise,
        applicationsPromise,
        sipTrunksPromise,
      ]);
      const phoneNumbers = promiseAllValues[0].data;
      const accounts     = promiseAllValues[1].data;
      const applications = promiseAllValues[2].data;
      const sipTrunks    = promiseAllValues[3].data;

      // sort all applications and store to state for use in bulk editing
      const allApplications = [...applications, ];
      allApplications.sort((a, b) => {
        let valA = (a.name && a.name.toLowerCase()) || '';
        let valB = (b.name && b.name.toLowerCase()) || '';
        const result = valA > valB ? 1 : valA < valB ? -1 : 0;
        return result;
      });
      const applicationsForBulk = allApplications.map(app => ({
        name: app.name,
        application_sid: app.application_sid,
      }));
      applicationsForBulk.push({
        name: '- None -',
        application_sid: null,
      });
      setApplications(applicationsForBulk);

      const combinedData = phoneNumbers.map((p, i) => {
        const account     =     accounts.filter(a => a.account_sid      === p.account_sid      );
        const application = applications.filter(a => a.application_sid  === p.application_sid  );
        const sipTrunk    =    sipTrunks.filter(a => a.voip_carrier_sid === p.voip_carrier_sid );
        return {
          sid:         p.phone_number_sid,
          number:      phoneNumberFormat(p.number),
          account:     account[0]     && account[0].name,
          application: application[0] && application[0].name,
          sipTrunk:    sipTrunk[0]    && sipTrunk[0].name,
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
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get phone number data',
        });
        console.log(err.response || err);
      }
    }
  }, [currentServiceProvider, dispatch, history]);

  //=============================================================================
  // Delete phone number
  //=============================================================================
  const formatPhoneNumberToDelete = p => {
    return [
      { name: 'Number:',      content: p.number      || '[none]' },
      { name: 'SIP Trunk:',   content: p.sipTrunk    || '[none]' },
      { name: 'Account:',     content: p.account     || '[none]' },
      { name: 'Application:', content: p.application || '[none]' },
    ];
  };
  const deletePhoneNumber = async phoneNumber => {
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
        baseURL: APP_API_BASE_URL,
        url: `/PhoneNumbers/${phoneNumber.sid}`,
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
        return ((err.response && err.response.data && err.response.data.msg) || 'Unable to delete phone number');
      }
    }
  };

  //=============================================================================
  // Bulk Edit Applications
  //=============================================================================
  const [ applications, setApplications ] = useState([]);
  const handleBulkEditApplications = async (phoneNumberSids, application) => {
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
      for (const sid of phoneNumberSids) {
        await axios({
          method: 'put',
          baseURL: APP_API_BASE_URL,
          url: `/PhoneNumbers/${sid}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          data: {
            application_sid: application.application_sid,
          }
        });
      }
      return true;
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
          message: (err.response && err.response.data && err.response.data.msg) || 'Something went wrong, please try again.',
        });
        console.log(err.response || err);
      }
      return false;
    }
  };

  //=============================================================================
  // Render
  //=============================================================================
  return (
    <InternalTemplate
      title="Phone Number Routing"
      addButtonText="Add a Phone Number"
      addButtonLink="/internal/phone-numbers/add"
    >
      <TableContent
        withCheckboxes
        name="phone number"
        urlParam="phone-numbers"
        getContent={getPhoneNumbers}
        columns={[
          { header: 'Number',      key: 'number'      },
          { header: 'SIP Trunk',   key: 'sipTrunk'    },
          { header: 'Account',     key: 'account'     },
          { header: 'Application', key: 'application' },
        ]}
        formatContentToDelete={formatPhoneNumberToDelete}
        deleteContent={deletePhoneNumber}
        bulkMenuItems={applications}
        bulkAction={handleBulkEditApplications}
      />
    </InternalTemplate>
  );
};

export default PhoneNumbersList;
