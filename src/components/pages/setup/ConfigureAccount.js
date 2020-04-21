import React from 'react';
import SetupTemplate from '../../templates/SetupTemplate';
import AccountForm from '../../forms/AccountForm';

const ConfigureAccount = () => {
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
