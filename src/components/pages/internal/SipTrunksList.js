import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';
import Sbcs from '../../blocks/Sbcs';

const SipTrunksList = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  useEffect(() => {
    document.title = `SIP Trunks | Jambonz | Open Source CPAAS`;
  });

  //=============================================================================
  // Get sip trunks
  //=============================================================================
  const getSipTrunks = async () => {
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

      // Get all SIP trunks
      const trunkResults = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/VoipCarriers',
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
        return {
          ...t,
          gateways,
        };
      });


      const simplifiedSipTrunks = trunksWithGateways.map(t => ({
        sid:            t.voip_carrier_sid,
        name:           t.name,
        description:    t.description,
        gatewaysConcat: t.gateways.map(g => `${g.ipv4}:${g.port}`).join(', '),
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
  };

  //=============================================================================
  // Delete sip trunk
  //=============================================================================
  const formatSipTrunkToDelete = trunk => {
    const gatewayName = trunk.gatewaysList.length > 1
      ? 'SIP Gateways:'
      : 'SIP Gateway:';
    const gatewayContent = trunk.gatewaysList.length > 1
      ? trunk.gatewaysList
      : trunk.gatewaysList[0];
    return [
      { name: 'Name:',        content: trunk.name        || '' },
      { name: 'Description:', content: trunk.description || '' },
      { name: gatewayName,    content: gatewayContent    || '' },
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
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to delete SIP trunk',
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
      title="SIP Trunks"
      addButtonText="Add a SIP Trunk"
      addButtonLink="/internal/sip-trunks/add"
      subtitle={<Sbcs />}
    >
      <TableContent
        name="SIP trunk"
        urlParam="sip-trunks"
        getContent={getSipTrunks}
        columns={[
          { header: 'Name',         key: 'name'           },
          { header: 'Description',  key: 'description'    },
          { header: 'SIP Gateways', key: 'gatewaysConcat' },
        ]}
        formatContentToDelete={formatSipTrunkToDelete}
        deleteContent={deleteSipTrunk}
      />
    </InternalTemplate>
  );
};

export default SipTrunksList;
