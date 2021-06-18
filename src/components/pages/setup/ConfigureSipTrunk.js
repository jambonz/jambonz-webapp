import React, { useEffect } from 'react';
import SetupTemplate from '../../templates/SetupTemplate';
import CarrierForm from '../../forms/CarrierForm';
import Sbcs from '../../blocks/Sbcs';

const ConfigureSipTrunk = () => {
  useEffect(() => {
    document.title = `Configure SIP Trunk | Jambonz | Open Source CPAAS`;
  });
  return (
    <SetupTemplate
      wide
      title="Configure SIP Trunk"
      subtitle={<Sbcs centered />}
      progress={3}
    >
      <CarrierForm
        type="setup"
      />
    </SetupTemplate>
  );
};

export default ConfigureSipTrunk;
