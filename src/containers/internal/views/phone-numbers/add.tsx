import React from "react";
import { H1 } from "jambonz-ui";

import { PhoneNumberForm } from "./form";

export const AddPhoneNumber = () => {
  return (
    <>
      <H1 className="h2">Add a phone number</H1>
      <PhoneNumberForm />
    </>
  );
};

export default AddPhoneNumber;
