import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InternalTemplate from '../../templates/InternalTemplate';
import SipTrunkForm from '../../forms/SipTrunkForm';
import Sbcs from '../../blocks/Sbcs';

const SipTrunksAddEdit = () => {
  let { voip_carrier_sid } = useParams();
  const pageTitle = voip_carrier_sid ? 'Edit SIP Trunk' : 'Add SIP Trunk';
  useEffect(() => {
    document.title = `${pageTitle} | Jambonz | Open Source CPAAS`;
  });
  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
      subtitle={<Sbcs />}
      breadcrumbs={[
        { name: 'SIP Trunks', url: '/internal/sip-trunks' },
        { name: pageTitle },
      ]}
    >
      <SipTrunkForm
        type={voip_carrier_sid ? 'edit' : 'add'}
        voip_carrier_sid={voip_carrier_sid}
      />
    </InternalTemplate>
  );
};

export default SipTrunksAddEdit;
