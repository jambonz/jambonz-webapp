import React from "react";
import { H1 } from "@jambonz/ui-kit";

import { CarrierForm } from "./form";

export const AddCarrier = () => {
  return (
    <>
      <H1 className="h2">Add a carrier</H1>
      <CarrierForm />
    </>
  );
};

export default AddCarrier;
