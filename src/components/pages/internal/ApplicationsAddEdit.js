import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InternalTemplate from '../../templates/InternalTemplate';
import ApplicationForm from '../../forms/ApplicationForm';

const ApplicationsAddEdit = () => {
  let { application_sid } = useParams();
  const pageTitle = application_sid ? 'Edit Application' : 'Add Application';
  useEffect(() => {
    document.title = `${pageTitle} | Jambonz | Open Source CPAAS`;
  });
  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
      breadcrumbs={[
        { name: 'Applications', url: '/internal/applications' },
        { name: pageTitle },
      ]}
    >
      <ApplicationForm
        type={application_sid ? 'edit' : 'add'}
        application_sid={application_sid}
      />
    </InternalTemplate>
  );
};

export default ApplicationsAddEdit;
