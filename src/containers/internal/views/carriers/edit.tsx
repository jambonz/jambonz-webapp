import React, { useEffect } from "react";
import { H1 } from "@jambonz/ui-kit";
import { useParams } from "react-router-dom";

import { useApiData } from "src/api";
import { toastError, useSelectState } from "src/store";
import { CarrierForm } from "./form";

import { Carrier, SipGateway, SmppGateway } from "src/api/types";
import { useScopedRedirect } from "src/utils/use-scoped-redirect";
import { ROUTE_INTERNAL_CARRIERS } from "src/router/routes";
import { Scope } from "src/store/types";

export const EditCarrier = () => {
  const params = useParams();
  const user = useSelectState("user");
  const [data, refetch, error] = useApiData<Carrier>(
    `VoipCarriers/${params.voip_carrier_sid}`,
  );
  const [sipGateways, sipGatewaysRefetch] = useApiData<SipGateway[]>(
    `SipGateways?voip_carrier_sid=${params.voip_carrier_sid}`,
  );
  const [smppGateways, smppGatewaysRefetch] = useApiData<SmppGateway[]>(
    `SmppGateways?voip_carrier_sid=${params.voip_carrier_sid}`,
  );

  useScopedRedirect(
    Scope.account,
    ROUTE_INTERNAL_CARRIERS,
    user,
    "You do not have access to this resource",
    data,
  );

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error, data]);

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
