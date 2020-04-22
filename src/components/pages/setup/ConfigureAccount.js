import React, { useEffect } from 'react';
import SetupTemplate from '../../templates/SetupTemplate';
import AccountForm from '../../forms/AccountForm';

const ConfigureAccount = () => {
  useEffect(() => {
    document.title = `Configure Account | Jambonz | Open Source CPAAS`;
  });
  return (
    <SetupTemplate
      wide
      title="Configure Account"
      progress={1}
    >
      <AccountForm
        type="setup"
      />
    </SetupTemplate>
  );
};

export default ConfigureAccount;
