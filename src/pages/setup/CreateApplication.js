import React from 'react';
import SetupTemplate from '../../templates/SetupTemplate';
import ApplicationForm from '../../blocks/forms/ApplicationForm';

const CreateApplication = () => {
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
