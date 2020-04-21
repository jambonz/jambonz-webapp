import React from 'react';
import SetupTemplate from '../../templates/SetupTemplate';
import SipTrunkForm from '../../blocks/forms/SipTrunkForm';

const ConfigureSipTrunk = () => {
  return (
    <SetupTemplate
      wide
      title="Configure SIP Trunk"
      progress={3}
    >
      <SipTrunkForm
        type="setup"
      />
    </SetupTemplate>
  );
};

export default ConfigureSipTrunk;
