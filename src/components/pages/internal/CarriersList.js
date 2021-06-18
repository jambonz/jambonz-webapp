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

const CarriersList = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const currentServiceProvider = useContext(ServiceProviderValueContext);

  useEffect(() => {
    document.title = `Carriers | Jambonz | Open Source CPAAS`;
  }, []);

  //=============================================================================
  // Get sip trunks
  //=============================================================================
  const getCarriers = useCallback(async () => {
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

      // Add appropriate gateways to each trunk
      const trunkMap = {};
      for (const t of trunkResults.data) {
        const gws = await axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: `/SipGateways?voip_carrier_sid=${t.voip_carrier_sid}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        trunkMap[t.voip_carrier_sid] = gws.data;
      }

      const trunksWithGateways = trunkResults.data.map(t => {
        const gateways = trunkMap[t.voip_carrier_sid] || [];
        sortSipGateways(gateways);
        return {
          ...t,
          gateways,
        };
      });

      const simplifiedCarriers = trunksWithGateways.map(t => ({
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
      return(simplifiedCarriers);
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
  const formatCarrierToDelete = trunk => {
    const gatewayName = trunk.gatewaysList.length > 1
      ? 'SIP Gateways:'
      : 'SIP Gateway:';

      return [
      { name: 'Name:',        content: trunk.name        || '[none]' },
      { name: 'Status:', content: trunk.status || '[none]' },
      { name: gatewayName, content: trunk.gatewaysConcat || '[none]' },
    ];
  };
  const deleteCarrier = async carrierToDelete => {
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
      for (const sid of carrierToDelete.gatewaysSid) {
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
        url: `/VoipCarriers/${carrierToDelete.sid}`,
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
      addButtonLink="/internal/carriers/add"
      subtitle={<Sbcs />}
    >
      <TableContent
        name="Carrier"
        urlParam="carriers"
        getContent={getCarriers}
        columns={[
          { header: 'Name',         key: 'name'           },
          { header: 'Status', key: 'status' },
          { header: 'Gateways', key: 'gatewaysConcat' },
        ]}
        formatContentToDelete={formatCarrierToDelete}
        deleteContent={deleteCarrier}
      />
    </InternalTemplate>
  );
};

export default CarriersList;
