/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';
import Sbcs from '../../blocks/Sbcs';
import sortSipGateways from '../../../helpers/sortSipGateways';
import { ServiceProviderValueContext } from '../../../contexts/ServiceProviderContext';

const SipTrunksList = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const currentServiceProvider = useContext(ServiceProviderValueContext);

  useEffect(() => {
    document.title = `Carriers | Jambonz | Open Source CPAAS`;
  }, []);

  //=============================================================================
  // Get sip trunks
  //=============================================================================
  const getSipTrunks = useCallback(async () => {
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
      // Get all SIP trunks
      const trunkResults = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/ServiceProviders/${currentServiceProvider}/VoipCarriers`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Get all SIP gateways
      const gatewayResults = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/SipGateways',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Add appropriate gateways to each trunk
      const trunksWithGateways = trunkResults.data.map(t => {
        const gateways = gatewayResults.data.filter(g => t.voip_carrier_sid === g.voip_carrier_sid);
        sortSipGateways(gateways);
        return {
          ...t,
          gateways,
        };
      });


      const simplifiedSipTrunks = trunksWithGateways.map(t => ({
        sid:            t.voip_carrier_sid,
        name:           t.name,
        status:    t.is_active === 1 ? "active" : "inactive",
        gatewaysConcat: `${
          t.gateways.filter((item) => item.inbound === 1).length
        } inbound, ${
          t.gateways.filter((item) => item.outbound === 1).length
        } outbound`,
        gatewaysList:   t.gateways.map(g => `${g.ipv4}:${g.port}`),
        gatewaysSid:    t.gateways.map(g => g.sip_gateway_sid),
      }));
      return(simplifiedSipTrunks);
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
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get SIP trunk data',
        });
        console.log(err.response || err);
      }
    }
  }, [currentServiceProvider]);

  //=============================================================================
  // Delete sip trunk
  //=============================================================================
  const formatSipTrunkToDelete = trunk => {
    const gatewayName = trunk.gatewaysList.length > 1
      ? 'SIP Gateways:'
      : 'SIP Gateway:';

      return [
      { name: 'Name:',        content: trunk.name        || '[none]' },
      { name: 'Status:', content: trunk.status || '[none]' },
      { name: gatewayName, content: trunk.gatewaysConcat || '[none]' },
    ];
  };
  const deleteSipTrunk = async sipTrunkToDelete => {
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
      // delete associated gateways
      for (const sid of sipTrunkToDelete.gatewaysSid) {
        await axios({
          method: 'delete',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: `/SipGateways/${sid}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      };
      // delete sip trunk
      await axios({
        method: 'delete',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/VoipCarriers/${sipTrunkToDelete.sid}`,
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
        return ((err.response && err.response.data && err.response.data.msg) || 'Unable to delete SIP trunk');
      }
    }
  };

  //=============================================================================
  // Render
  //=============================================================================
  return (
    <InternalTemplate
      title="Carriers"
      addButtonText="Add a Carrier"
      addButtonLink="/internal/sip-trunks/add"
      subtitle={<Sbcs />}
    >
      <TableContent
        name="Carrier"
        urlParam="sip-trunks"
        getContent={getSipTrunks}
        columns={[
          { header: 'Name',         key: 'name'           },
          { header: 'Status', key: 'status' },
          { header: 'Gateways', key: 'gatewaysConcat' },
        ]}
        formatContentToDelete={formatSipTrunkToDelete}
        deleteContent={deleteSipTrunk}
      />
    </InternalTemplate>
  );
};

export default SipTrunksList;
