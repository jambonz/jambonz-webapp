import React from "react";
import { H1 } from "jambonz-ui";

import { ApplicationForm } from "./form";

export const AddApplication = () => {
  return (
    <>
      <H1>Add an application</H1>
      <ApplicationForm />
    </>
  );
};

export default AddApplication;
