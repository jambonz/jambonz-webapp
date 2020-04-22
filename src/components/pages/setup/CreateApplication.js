import React, { useEffect } from 'react';
import SetupTemplate from '../../templates/SetupTemplate';
import ApplicationForm from '../../forms/ApplicationForm';

const CreateApplication = () => {
  useEffect(() => {
    document.title = `Create Application | Jambonz | Open Source CPAAS`;
  });
  return (
    <SetupTemplate
      wide
      title="Create Application"
      progress={2}
    >
      <ApplicationForm
        type="setup"
      />
    </SetupTemplate>
  );
};

export default CreateApplication;
