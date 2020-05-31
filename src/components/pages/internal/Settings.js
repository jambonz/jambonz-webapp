import React, { useEffect } from 'react';
import InternalTemplate from '../../templates/InternalTemplate';
import SettingsForm from '../../forms/SettingsForm';

const Settings = () => {
  const pageTitle = 'Settings';
  useEffect(() => {
    document.title = `${pageTitle} | Jambonz | Open Source CPAAS`;
  });
  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
    >
      <SettingsForm />
    </InternalTemplate>
  );
};

export default Settings;
