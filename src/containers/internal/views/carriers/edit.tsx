import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import { CarrierForm } from "./form";

import {
  Account,
  Carrier,
  PredefinedCarriers,
  SipGateway,
  SmppGateway,
} from "src/api/types";

export const EditCarrier = () => {
  const params = useParams();
  const [data, refetch, error] = useApiData<Carrier>(
    `VoipCarriers/${params.voip_carrier_sid}`
  );

  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [carriers] = useServiceProviderData<Carrier[]>("VoipCarriers");

  const [carrierSipGateways] = useApiData<SipGateway[]>(
    `SipGateways?voip_carrier_sid=${params.voip_carrier_sid}`
  );
  const [carrierSmppGateways] = useApiData<SmppGateway[]>(
    `SmppGateways?voip_carrier_sid=${params.voip_carrier_sid}`
  );
  // const [carrierSipGateways, setCarrierSipGateways] = useState<
  //   SipGateway[] | null
  // >([]);
  // const [carrierSmppGateways, setCarrierSmppGateways] = useState<
  //   SmppGateway[] | null
  // >([]);

  const [predefinedCarriers] =
    useApiData<PredefinedCarriers[]>("PredefinedCarriers");

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1>Edit carrier</H1>
      <CarrierForm
        accounts={accounts}
        carriers={carriers}
        predefinedCarriers={predefinedCarriers}
        carrierSipGateways={carrierSipGateways}
        carrierSmppGateways={carrierSmppGateways}
        carrier={{ data, refetch, error }}
      />
    </>
  );
};

export default EditCarrier;
