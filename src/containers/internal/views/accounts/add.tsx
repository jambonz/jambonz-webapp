import React from "react";
import { H1 } from "jambonz-ui";

import { AccountForm } from "./form";

export const AddAccount = () => {
  return (
    <>
      <H1>Add account</H1>
      <AccountForm />
    </>
  );
};

export default AddAccount;
