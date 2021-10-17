import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InternalTemplate from '../../templates/InternalTemplate';
import CarrierForm from '../../forms/CarrierForm';

const CarriersAddEdit = () => {
  let { voip_carrier_sid } = useParams();
  const pageTitle = voip_carrier_sid ? 'Edit Carrier' : 'Add Carrier';
  useEffect(() => {
    document.title = `${pageTitle} | Jambonz | Open Source CPAAS`;
  });

  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
      breadcrumbs={[
        { name: 'Carriers', url: '/internal/carriers' },
        { name: pageTitle },
      ]}
    >
      <CarrierForm
        type={voip_carrier_sid ? 'edit' : 'add'}
        voip_carrier_sid={voip_carrier_sid}
      />
    </InternalTemplate>
  );
};

export default CarriersAddEdit;
