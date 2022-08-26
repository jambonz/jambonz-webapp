import React from "react";
import { H1 } from "jambonz-ui";

import { useApiData, useServiceProviderData } from "src/api";
import { CarrierForm } from "./form";

import type { Account, Carrier, PredefinedCarriers } from "src/api/types";

export const AddCarrier = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [carriers] = useServiceProviderData<Carrier[]>("VoipCarriers");
  const [predefinedCarriers] =
    useApiData<PredefinedCarriers[]>("PredefinedCarriers");

  return (
    <>
      <H1>Add a speech service</H1>
      <CarrierForm
        accounts={accounts}
        carriers={carriers} // currently unused
        predefinedCarriers={predefinedCarriers}
      />
    </>
  );
};

export default AddCarrier;
