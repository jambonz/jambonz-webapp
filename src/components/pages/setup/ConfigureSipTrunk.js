import React, { useEffect } from 'react';
import SetupTemplate from '../../templates/SetupTemplate';
import SipTrunkForm from '../../forms/SipTrunkForm';
import Sbcs from '../../blocks/Sbcs';

const ConfigureSipTrunk = () => {
  useEffect(() => {
    document.title = `Configure SIP Trunk | Jambonz | Open Source CPAAS`;
  });
  return (
    <SetupTemplate
      wide
      title="Configure SIP Trunk"
      subtitle={<Sbcs />}
      progress={3}
    >
      <SipTrunkForm
        type="setup"
      />
    </SetupTemplate>
  );
};

export default ConfigureSipTrunk;
