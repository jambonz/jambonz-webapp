import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData } from "src/api";
import { toastError } from "src/store";
import { CarrierForm } from "./form";

import { Carrier, SipGateway, SmppGateway } from "src/api/types";

export const EditCarrier = () => {
  const params = useParams();
  const [data, refetch, error] = useApiData<Carrier>(
    `VoipCarriers/${params.voip_carrier_sid}`
  );
  const [sipGateways, sipGatewaysRefetch] = useApiData<SipGateway[]>(
    `SipGateways?voip_carrier_sid=${params.voip_carrier_sid}`
  );
  const [smppGateways, smppGatewaysRefetch] = useApiData<SmppGateway[]>(
    `SmppGateways?voip_carrier_sid=${params.voip_carrier_sid}`
  );

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1 className="h2">Edit carrier</H1>
      <CarrierForm
        carrier={{ data, refetch, error }}
        carrierSipGateways={{
          data: sipGateways,
          refetch: sipGatewaysRefetch,
        }}
        carrierSmppGateways={{
          data: smppGateways,
          refetch: smppGatewaysRefetch,
        }}
      />
    </>
  );
};

export default EditCarrier;
