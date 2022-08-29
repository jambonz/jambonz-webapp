import React from "react";
import { H1 } from "jambonz-ui";

import { useApiData, useServiceProviderData } from "src/api";
import { CarrierForm } from "./form";

import type { Account, PredefinedCarriers } from "src/api/types";

export const AddCarrier = () => {
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [predefinedCarriers] =
    useApiData<PredefinedCarriers[]>("PredefinedCarriers");

  return (
    <>
      <H1>Add a carrier</H1>
      <CarrierForm
        accounts={accounts}
        predefinedCarriers={predefinedCarriers}
      />
    </>
  );
};

export default AddCarrier;
