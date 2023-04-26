import React from "react";
import { H1 } from "@jambonz/ui-kit";

import { LcrForm } from "./form";

export const AddLcr = () => {
  return (
    <>
      <H1 className="h2">Add outbound call routes</H1>
      <LcrForm />
    </>
  );
};

export default AddLcr;
