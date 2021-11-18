import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InternalTemplate from '../../templates/InternalTemplate';
import SpeechForm from '../../forms/SpeechForm';

const SpeechServicesAddEdit = () => {
  let { speech_service_sid } = useParams();
  const pageTitle = speech_service_sid ? 'Edit Speech Service' : 'Add Speech Service';
  useEffect(() => {
    document.title = `${pageTitle} | Jambonz | Open Source CPAAS`;
  });
  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
      breadcrumbs={[
        { name: 'Speech Services', url: '/internal/speech-services' },
        { name: pageTitle },
      ]}
    >
      <SpeechForm
        type={speech_service_sid ? 'edit' : 'add'}
        speech_service_sid={speech_service_sid}
      />
    </InternalTemplate>
  );
};

export default SpeechServicesAddEdit;
