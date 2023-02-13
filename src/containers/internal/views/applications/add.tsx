import React from "react";
import { H1 } from "@jambonz/ui-kit";

import { ApplicationForm } from "./form";

export const AddApplication = () => {
  return (
    <>
      <H1 className="h2">Add an application</H1>
      <ApplicationForm />
    </>
  );
};

export default AddApplication;
