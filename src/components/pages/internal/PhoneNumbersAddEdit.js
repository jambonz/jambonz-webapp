import React from 'react';
import { useParams } from 'react-router-dom';
import InternalTemplate from '../../templates/InternalTemplate';
import PhoneNumberForm from '../../forms/PhoneNumberForm';

const PhoneNumbersAddEdit = () => {
  let { phone_number_sid } = useParams();
  const pageTitle = phone_number_sid ? 'Edit Phone Number' : 'Add Phone Number';
  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
      breadcrumbs={[
        { name: 'Phone Numbers', url: '/internal/phone-numbers' },
        { name: pageTitle },
      ]}
    >
      <PhoneNumberForm
        type={phone_number_sid ? 'edit' : 'add'}
        phone_number_sid={phone_number_sid}
      />
    </InternalTemplate>
  );
};

export default PhoneNumbersAddEdit;
