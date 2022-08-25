import React, { useEffect } from "react";
import { H1 } from "jambonz-ui";
import { useParams } from "react-router-dom";

import { useApiData, useServiceProviderData } from "src/api";
import { toastError } from "src/store";
import { CarrierForm } from "./form";

import type { Account, Carrier } from "src/api/types";

export const EditCarrier = () => {
  const params = useParams();
  console.log(params);
  const [data, refetch, error] = useApiData<Carrier>(
    `VoipCarriers/${params.voip_carrier_sid}`
  );

  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [carriers] = useServiceProviderData<Carrier[]>("VoipCarriers");
  const [predefinedCarriers] = useApiData<Carrier[]>("PredefinedCarriers");

  useEffect(() => {
    if (error) {
      toastError(error.msg);
    }
  }, [error]);

  return (
    <>
      <H1>Edit account</H1>
      <CarrierForm
        accounts={accounts}
        carriers={carriers}
        predefinedCarriers={predefinedCarriers}
        carrier={{ data, refetch, error }}
      />
    </>
  );
};

export default EditCarrier;
